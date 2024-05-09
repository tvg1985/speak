import React, {useEffect, useState, useContext} from 'react';
import {
    Button,
    View,
    StyleSheet,
    Text,
    Modal,
    TextInput,
    Image,
    Dimensions,
    FlatList,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import {UserIdContext} from "./UserIdContext";
import {getDatabase, ref, onValue, off, query, orderByChild, equalTo, push, set, remove} from "firebase/database";
import * as ImagePicker from 'expo-image-picker';
import {getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL} from "firebase/storage";

const {width, height} = Dimensions.get("window");

function StorybookScreen({navigation}) {
    const [storybooks, setStorybooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const {userId, userRole, parentId} = React.useContext(UserIdContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [storybookName, setStorybookName] = useState('');
    const [storybookProfilePhoto, setStorybookProfilePhoto] = useState('');
    const [storybookProfilePhotoFileName, setStorybookProfilePhotoFileName] = useState('');
    const [storybookProfilePhotoMetaData, setStorybookProfilePhotoMetaData] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [storybookToDelete, setStorybookToDelete] = useState(null);

    useEffect(() => {
        const userIdToFetch = userRole === 'child' ? parentId : userId;
        if (userIdToFetch) {
            const database = getDatabase();
            const dbRef = ref(database, 'story_books');
            const dbQuery = query(dbRef, orderByChild('user_id'), equalTo(userIdToFetch));
            onValue(dbQuery, (snapshot) => {
                const data = snapshot.val();
                const storybooks = Object.values(data || {});
                setStorybooks(storybooks);
                setLoading(false); // set loading to false here
            });
        } else {
            setLoading(false);
        }
    }, [userId, userRole, parentId]);

    const handleAddStorybook = async () => {
        // validate form fields
        if (!storybookName || !storybookProfilePhoto) {
            alert('Please fill in all fields');
            return;
        }

        // check if user object and uid property exist
        if (!userId) {
            alert('User not found');
            return;
        }

        // convert the selected image's URI to a Blob
        const blob = await getBlobFromUri(storybookProfilePhoto);

        // upload the Blob to Firebase Storage
        const storage = getStorage();
        const uploadRef = storageRef(storage, `storybook_profile_photos/${storybookProfilePhotoFileName}`);
        const uploadTask = uploadBytesResumable(uploadRef, blob, storybookProfilePhotoMetaData);

        uploadTask.on('state_changed',
            (snapshot) => {
                // handle progress
            },
            (error) => {
                // handle error
                console.error("Error uploading image: ", error);
            },
            () => {
                // handle successful upload
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    // add new storybook to Firebase
                    const newStorybookRef = push(ref(getDatabase(), 'story_books'));
                    set(newStorybookRef, {
                        storybook_id: newStorybookRef.key,
                        storybook_name: storybookName,
                        storybook_profile_photo: downloadURL,
                        user_id: userId,
                    });

                    // update storybooks state
                    setStorybooks([...storybooks, {
                        storybook_id: newStorybookRef.key,
                        storybook_name: storybookName,
                        storybook_profile_photo: downloadURL,
                        user_id: userId,
                    }]);

                    // close modal and reset form
                    setModalVisible(false);
                    setStorybookName('');
                    setStorybookProfilePhoto('');
                });
            }
        );
    };
    const handlePickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
            });

            if (!result.cancelled && result.assets && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                const fileName = result.assets[0].fileName;
                const mimeType = result.assets[0].mimeType;
                console.log('result:', result.assets[0])

                if (mimeType === "image/png" || mimeType === "image/jpeg") {
                    let metadata = {
                        contentType: mimeType,
                    };
                    setStorybookProfilePhoto(uri);
                    setStorybookProfilePhotoFileName(fileName);
                    setStorybookProfilePhotoMetaData(metadata);
                } else {
                    alert("Photo must be in PNG or JPG format");
                }
            }
        } catch (error) {
            console.error("Error picking image: ", error);
        }
    };

    const getBlobFromUri = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                reject(new TypeError(e.errorMessage));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        return blob;
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    const resetForm = () => {
        setStorybookName('');
        setStorybookProfilePhoto('');
        setStorybookProfilePhotoFileName('');
        setStorybookProfilePhotoMetaData('');
    };

    const handleDeleteStorybook = async () => {
        if (storybookToDelete) {
            const database = getDatabase();
            const storybookRef = ref(database, `story_books/${storybookToDelete.storybook_id}`);
            const pagesRef = ref(database, `pages/${storybookToDelete.storybook_id}`);

            // Delete the storybook and its pages
            await remove(storybookRef);
            await remove(pagesRef);

            // Remove the storybook from the local state
            setStorybooks(storybooks.filter(storybook => storybook.storybook_id !== storybookToDelete.storybook_id));

            // Close the delete confirmation modal
            setDeleteModalVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button
                    title="Home"
                    onPress={() => navigation.navigate('Home')}
                    color="green"
                />
                <Button
                    title="Settings"
                    onPress={() => {
                        navigation.navigate('Settings');
                    }}
                    color="green"
                />
            </View>

            <View style={styles.subsectionsContainer}>
                <Text style={styles.header}>Story Books</Text>
                <View style={styles.subsection}>
                    {storybooks.length === 0 ? (
                        <Text style={styles.noStorybooksText}>You don't have any storybooks</Text>
                    ) : (
                        <FlatList
                            data={storybooks}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('StorybookPage', {storybook: item, userId, userRole, parentId})}
                                    onLongPress={() => {
                                        if (userRole === 'parent') {
                                            setStorybookToDelete(item);
                                            setDeleteModalVisible(true);
                                        }
                                    }}
                                >
                                    <View>
                                        <Image style={styles.photo}
                                               source={{uri: item.storybook_profile_photo}}
                                        />
                                        <Text style={styles.storybookName}> {item.storybook_name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            numColumns={2}
                        />
                    )}
                </View>
                {userRole === 'parent' && (
                <Button
                    title="Add"
                    onPress={() => setModalVisible(true)}
                />
                    )}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            placeholder="Storybook Name"
                            value={storybookName}
                            onChangeText={setStorybookName}
                        />
                        <View style={styles.inputContainer}>
                            <Text>Profile Photo:</Text>
                            <View style={styles.dynamicButtonContainer}>
                                <Button
                                    title={storybookProfilePhotoFileName ? storybookProfilePhotoFileName : "Pick Storybook Photo"}
                                    onPress={handlePickImage}
                                />
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Add"
                                onPress={handleAddStorybook}
                            />
                            <Button
                                title="Cancel"
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm()
                                }}
                                color="red"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>Are you sure you want to delete this storybook?</Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Yes"
                                onPress={handleDeleteStorybook}
                                color="red"
                            />
                            <Button
                                title="No"
                                onPress={() => setDeleteModalVisible(false)}
                                color="green"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center', // center children vertically
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    subsection: {
        width: width * 0.8, // 80% of screen width
        alignItems: "center",
        marginVertical: 10,
        borderColor: "#d3d3d3", // added border color
        borderWidth: 1, // added border width
    },
    storybookList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
    },
    noStorybooksText: {
        color: 'gray',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    buttonContainer: {
        flexDirection: "row", // Arrange buttons side by side
        justifyContent: "center", // Center buttons horizontally
        width: "100%", // Use full width of the container
        marginTop: 20, // Add some margin at the top
        marginBottom: 10, // Add some margin at the bottom
    },
    modalView: {
        margin: 20, // Increase margin to decrease modal size
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 30, // Increase padding to decrease modal size
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "80%", // Set width to 80% of device width
        height: "60%", // Set height to 60% of device height
    },
    inputContainer: {
        flexDirection: "row", // Arrange text and button side by side
        justifyContent: "space-between", // Add space between text and button
        alignItems: "center", // Vertically align items in the center
        width: "100%", // Use full width of the container
        marginBottom: 10, // Add some margin at the bottom
    },
    fixedWidthButtonContainer: {
        width: 100, // Set a fixed width for the button
    },
    photo: {
        borderWidth: 1,
        borderColor: "red",
        width: width * 0.3, // specify a width
        height: height * 0.15, // specify a height
        backgroundColor: "gray", // add a gray background
        margin: 5,
    },
    storybookName: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subsectionsContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        marginTop: 60,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    dynamicButtonContainer: {
        width: '50%',
    }
});

export default StorybookScreen;