import React, {useEffect, useState, useContext} from 'react';
import {Button, View, StyleSheet, Text, Modal, TextInput} from 'react-native';
import {UserIdContext} from "./UserIdContext";
import {getDatabase, ref, onValue, off, query, orderByChild, equalTo, push, set} from "firebase/database";
import * as ImagePicker from 'expo-image-picker';
import {getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL} from "firebase/storage";

function StorybookScreen({navigation}) {
    const [storybooks, setStorybooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useContext(UserIdContext); // get the user from UserContext
    const [modalVisible, setModalVisible] = useState(false);
    const [storybookName, setStorybookName] = useState('');
    const [storybookProfilePhoto, setStorybookProfilePhoto] = useState('');
    const [storybookProfilePhotoFileName, setStorybookProfilePhotoFileName] = useState('');
    const [storybookProfilePhotoMetaData, setStorybookProfilePhotoMetaData] = useState('');

    useEffect(() => {
        if (user && user.uid) {
            const database = getDatabase();
            const dbRef = ref(database, 'story_books');
            const dbQuery = query(dbRef, orderByChild('user_id'), equalTo(user.uid));
            onValue(dbQuery, (snapshot) => {
                const data = snapshot.val();
                const storybooks = Object.values(data || {});
                setStorybooks(storybooks);
            })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleAddStorybook = async () => {
        // validate form fields
        if (!storybookName || !storybookProfilePhoto) {
            alert('Please fill in all fields');
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
                        user_id: user.uid,
                    });

                    // update storybooks state
                    setStorybooks([...storybooks, {
                        storybook_id: newStorybookRef.key,
                        storybook_name: storybookName,
                        storybook_profile_photo: downloadURL,
                        user_id: user.uid,
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
                        // settings function here
                    }}
                    color="green"
                />
            </View>
            <View style={styles.subsection}>
                {storybooks.length === 0 ? (
                    <Text style={styles.noStorybooksText}>You don't have any storybooks</Text>
                ) : (
                    storybooks.map((storybook, index) => (
                        <View key={index}>
                            <Text>{storybook.storybook_name}</Text>
                            {/* Add other storybook details here */}
                        </View>
                    ))
                )}
            </View>
            <Button
                title="Add"
                onPress={() => setModalVisible(true)}
            />
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
                        <Button
                            title={storybookProfilePhoto ? storybookProfilePhoto : "Pick Storybook Photo"}
                            onPress={handlePickImage}
                        />
                        <Button
                            title="Add"
                            onPress={handleAddStorybook}
                        />
                        <Button
                            title="Cancel"
                            onPress={() => setModalVisible(false)}
                        />
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
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    subsection: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        margin: 10,
        marginTop: 30,
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
        width: "90%", // Set width to 90% of device width
        height: "80%", // Set height to 80% of device height
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
    fixedWidthButtonContainer: {
        width: 100, // Set a fixed width for the button
    },
});

export default StorybookScreen;