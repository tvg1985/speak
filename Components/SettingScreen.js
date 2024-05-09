import React, {useState, useEffect, useContext} from 'react';
import {
    View,
    Text,
    Button,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import {getDatabase, ref, onValue, remove, push, set} from 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {UserIdContext} from './UserIdContext'; // Assuming you have a UserIdContext that provides the logged-in user
import CryptoJS from "crypto-js";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SettingsScreen = () => {
    const {userId, userRole, userName, setUserId} = useContext(UserIdContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [dependents, setDependents] = useState([]);
    const [selectedDependent, setSelectedDependent] = useState(null);
    const [newDependent, setNewDependent] = useState({email: '', password: '', confirmPassword: '', user_name: ''});
    const navigation = useNavigation();
    const [formErrors, setFormErrors] = useState({});


    useEffect(() => {
        const db = getDatabase();
        const dependentsRef = ref(db, 'users');
        const handleData = snap => {
            if (snap.val()) {
                const dependentsData = Object.entries(snap.val())
                    .filter(([key, user]) => user.parent_id === userId)
                    .map(([key, user]) => ({...user, user_id: key}));
                setDependents(dependentsData);
            }
        };
        onValue(dependentsRef, handleData);
    }, []);


    const handleAddDependent = async () => {
        let errors = {};

        // Convert user_name to lowercase
        const lowerCaseUserName = newDependent.user_name.toLowerCase();

        // Check if user_name already exists
        const userNameExists = dependents.some(dependent => dependent.user_name.toLowerCase() === lowerCaseUserName);

        if (userNameExists) {
            // Generate a unique user_name
            const uniqueUserName = await generateUniqueUserName(lowerCaseUserName);
            errors.user_name = `User name already exists. Try "${uniqueUserName}"`;
        }
        // Add validation checks
        if (!newDependent.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(newDependent.email)) {
            errors.email = 'Email address is invalid';
        }
        if (!newDependent.password) {
            errors.password = 'Password is required';
        }
        if (newDependent.password !== newDependent.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!newDependent.user_name) {
            errors.user_name = 'User name is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Hash the password
        const hashedPassword = CryptoJS.SHA256(newDependent.password).toString();

        // Add new dependent to Firebase Realtime Database
        const db = getDatabase();
        const newDependentRef = push(ref(db, 'users'));
        set(newDependentRef, {
            ...newDependent,
            userName: lowerCaseUserName,
            password: hashedPassword,
            parent_id: userId,
            role: 'child'
        });
        setModalVisible(false);
        setNewDependent({email: '', password: '', confirmPassword: '', user_name: ''});
    };
    const generateUniqueUserName = async (baseUserName) => {
        let uniqueUserName;
        let userNameExists;

        do {
            // Generate a random number between 1 and 100
            const randomNumber = Math.floor(Math.random() * 100) + 1;

            // Append the random number to the baseUserName
            uniqueUserName = `${baseUserName}${randomNumber}`;

            // Check if the generated user_name already exists
            userNameExists = dependents.some(dependent => dependent.user_name.toLowerCase() === uniqueUserName);
        } while (userNameExists);

        return uniqueUserName;
    };

    const handleDeleteDependent = () => {
        // Delete selected dependent from Firebase Realtime Database
        const db = getDatabase();
        const dependentRef = ref(db, 'users/' + selectedDependent.user_id);
        remove(dependentRef)
            .then(() => {
                console.log('Dependent deleted successfully');
                setSelectedDependent(null);
            })
            .catch((error) => {
                console.error('Error deleting dependent: ', error);
            });
    };

    const resetForm = () => {
        setNewDependent({email: '', password: '', confirmPassword: '', user_name: ''});
        setFormErrors({});
    };

    const dependentContainerStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#bbb',
        borderColor: 'gray', // Add gray border color
        borderWidth: dependents.length, // Dynamic border width based on the number of dependents
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topButtons}>

                <Button title="Back" onPress={() => navigation.goBack()} color="green"/>
                <Button
                    title="Logout"
                    onPress={() => {
                        setUserId(null); // Clear the user's session or token
                        navigation.navigate('Login'); // Navigate back to the Login screen
                    }}
                    color="red"
                />
            </View>
            <Text style={styles.header}>{userName.toUpperCase()}</Text>
            <Text style={styles.role}>Role: {userRole.toUpperCase()}</Text>
            {userRole === 'parent' && (
                <>
            <Text style={styles.subsectionHeader}>Dependents</Text>
            {dependents.length > 0 ? (
                <FlatList
                    data={dependents}
                    renderItem={({item}) => (
                        <View style={dependentContainerStyle}>
                            <Text style={styles.dependentName}>{item.user_name}</Text>
                            <Button title="Delete" onPress={() => setSelectedDependent(item)}/>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text style={styles.noDependentsText}>You have no dependent accounts</Text>
            )}
            <TouchableOpacity style={styles.customButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            </> )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.centeredView}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.header}>Add Dependent</Text>
                            <View style={styles.inputContainer}>
                                <Text>Email:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={newDependent.email}
                                    onChangeText={(text) => setNewDependent({...newDependent, email: text})}
                                />
                            </View>
                            {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                            <View style={styles.inputContainer}>
                                <Text>Password:</Text>
                                <TextInput
                                    secureTextEntry={true}
                                    style={styles.input}
                                    placeholder="Password"
                                    value={newDependent.password}
                                    onChangeText={(text) => setNewDependent({...newDependent, password: text})}
                                />
                            </View>
                            {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}
                            <View style={styles.inputContainer}>
                                <Text>Confirm Password:</Text>
                                <TextInput
                                    secureTextEntry={true}
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    value={newDependent.confirmPassword}
                                    onChangeText={(text) => setNewDependent({...newDependent, confirmPassword: text})}
                                />
                            </View>
                            {formErrors.confirmPassword &&
                                <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
                            <View style={styles.inputContainer}>
                                <Text>User Name:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="User Name"
                                    value={newDependent.user_name}
                                    onChangeText={(text) => setNewDependent({...newDependent, user_name: text})}
                                />
                            </View>
                            {formErrors.user_name && <Text style={styles.errorText}>{formErrors.user_name}</Text>}
                            <View style={styles.buttonContainer}>
                                <Button title="Add" onPress={handleAddDependent} color="blue"/>
                                <Button title="Cancel" onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }} color="red"/>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
            {selectedDependent && (
                <Modal visible={true}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.header}>Are you sure you want to delete this user?</Text>
                            <View style={styles.buttonContainer}>
                                <Button title="Yes" onPress={handleDeleteDependent} color="blue"/>
                                <Button title="No" onPress={() => setSelectedDependent(null)} color="red"/>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    role: {
        fontSize: 18,
        marginBottom: 16,
        justifyContent: 'center',
        textAlign: 'center',
    },
    subsectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        margin: 30,
    },
    dependentName: {
        fontSize: 16,
    },
    noDependentsText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 10, // Decrease margin to increase modal size
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 20, // Decrease padding to increase modal size
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: windowWidth * 0.9, // Set width to 90% of window width
        height: windowHeight * 0.8, // Set height to 80% of window height
    },
    buttonContainer: {
        flexDirection: "row", // Arrange buttons side by side
        justifyContent: "center", // Center buttons horizontally
        width: "100%", // Use full width of the container
        marginTop: 20, // Add some margin at the top
        marginBottom: 10, // Add some margin at the bottom
    },
    inputContainer: {
        flexDirection: "row", // Arrange text and input field side by side
        justifyContent: "space-between", // Add space between text and input field
        alignItems: "center", // Vertically align items in the center
        width: "100%", // Use full width of the container
        marginBottom: 10, // Add some margin at the bottom
    },
    input: {
        width: windowWidth * 0.4, // Reduce width to 60% of window width
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
    },
    errorText: {
        color: 'red',
    },
    customButton: {
        backgroundColor: '#007BFF', // Change to the color of your choice
        paddingVertical: 10, // Adjust as needed
        paddingHorizontal: 20, // Adjust as needed
        borderRadius: 5, // Adjust as needed
        alignSelf: 'center',
        marginTop: 20, // Adjust as needed
        marginBottom: 10, // Adjust as needed
    },
    buttonText: {
        color: '#fff', // Change to the color of your choice
        fontSize: 16, // Adjust as needed
        textAlign: 'center',
    },
});

export default SettingsScreen;