import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Button,
    Modal,
    TextInput
} from 'react-native';
import {getDatabase, ref, onValue, query, orderByChild, equalTo, push, set, remove} from 'firebase/database';
import {useNavigation} from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import {getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import * as DocumentPicker from "expo-document-picker";
import {Audio} from 'expo-av';

const {width, height} = Dimensions.get("window");

function StorybookPage({route}) {
    const {storybook, userId, userRole, parentId} = route.params;
    console.log('storybook', storybook);
    const navigation = useNavigation();
    const [storybookPages, setStorybookPages] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [pageNumber, setPageNumber] = useState('');
    const [photo, setPhoto] = useState('');
    const [audio, setAudio] = useState('');
    const [photos, setPhotos] = useState([]);
    const [audios, setAudios] = useState([]);
    const [photoButtonTitle, setPhotoButtonTitle] = useState('Pick Photo');
    const [audioButtonTitle, setAudioButtonTitle] = useState('Pick Audio');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);

    useEffect(() => {
    const userIdToFetch = userRole === 'child' ? parentId : userId;
    const db = getDatabase();
    const storybookPagesRef = ref(db, 'storybook_pages');
    const q = query(storybookPagesRef, orderByChild('user_id'), equalTo(userIdToFetch));
    const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val();
        const pages = data ? Object.values(data).filter(page => page.storybook_id === storybook.storybook_id) : [];
        const sortedPages = pages.sort((a, b) => a.page_number - b.page_number);
        setStorybookPages(sortedPages);
    });

    return () => {
        unsubscribe();
    };
}, [storybook.storybook_id, userId, userRole, parentId]);

    const handlePickPhoto = async () => {
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
                    setPhoto(uri);
                    setPhotoButtonTitle(fileName);
                } else {
                    alert("Photo must be in PNG or JPG format");
                }
            }
        } catch (error) {
            console.error("Error picking image: ", error);
        }
    };

    const handlePickAudio = async () => {
        const validMimeTypes = [
            "audio/mpeg",
            "audio/wav",
            "audio/mp3",
            "audio/x-wav",
            "audio/x-mp3",
            "audio/mp4",
            "audio/x-m4a",
        ];

        let result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
        });
        console.log("Audio file picker result: ", result);

        if (!result.cancelled && result.assets && result.assets[0].uri) {
            let uri = result.assets[0].uri;
            let mimeType = result.assets[0].mimeType;

            if (validMimeTypes.includes(mimeType)) {
                console.log("audio valid, with mime type: ", mimeType);
                setAudio(uri);
                const fileName = result.assets[0].name;
                setAudioButtonTitle(fileName);
            }
        } else {
            console.log(
                "No audio file was selected or an error occurred. Result: ",
                result,
            );
        }
    };
    let soundObject = null;
    let currentAudioFile = null;

    const playAudio = async (audioFile) => {
        // If the user touches the same page again, stop the audio.
        if (audioFile === currentAudioFile) {
            if (soundObject) {
                await soundObject.stopAsync();
                soundObject = null;
                currentAudioFile = null;
            }
        } else {
            // If a different page is touched, stop the current audio and start the new one.
            if (soundObject) {
                await soundObject.stopAsync();
                soundObject = null;
            }

            soundObject = new Audio.Sound();
            try {
                await soundObject.loadAsync({uri: audioFile});
                await soundObject.playAsync();
                currentAudioFile = audioFile;
            } catch (error) {
                console.error("Error playing audio: ", error);
            }
        }
    };

    const handleAddPage = async () => {
        if (!pageNumber || !photo || !audio) {
            alert('Please fill in all fields');
            return;
        }

        const blobPhoto = await getBlobFromUri(photo);
        const blobAudio = await getBlobFromUri(audio);

        const storage = getStorage();
        const uploadRefPhoto = storageRef(storage, `storybook_pages_photos/${Date.now()}`);
        const uploadTaskPhoto = uploadBytesResumable(uploadRefPhoto, blobPhoto);

        const uploadRefAudio = storageRef(storage, `storybook_pages_audios/${Date.now()}`);
        const uploadTaskAudio = uploadBytesResumable(uploadRefAudio, blobAudio);

        uploadTaskPhoto.on('state_changed', snapshot => {
        }, error => {
        }, () => {
            getDownloadURL(uploadTaskPhoto.snapshot.ref).then((downloadURLPhoto) => {
                uploadTaskAudio.on('state_changed', snapshot => {
                }, error => {
                }, () => {
                    getDownloadURL(uploadTaskAudio.snapshot.ref).then((downloadURLAudio) => {
                        const newPageRef = push(ref(getDatabase(), 'storybook_pages'));
                        set(newPageRef, {
                            storybook_page_id: newPageRef.key,
                            page_audio: downloadURLAudio,
                            page_number: pageNumber,
                            page_photo: downloadURLPhoto,
                            storybook_id: storybook.storybook_id,
                            user_id: userId,
                        });
                    });
                });
            });
        });

        setModalVisible(false);
        setPageNumber('');
        setPhoto('');
        setAudio('');
        setPhotoButtonTitle('Pick Photo');
        setAudioButtonTitle('Pick Audio');
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
    const resetForm = () => {
        setPageNumber('');
        setPhoto('');
        setAudio('');
        setPhotoButtonTitle('Pick Photo');
        setAudioButtonTitle('Pick Audio');
    };

    const handleDeletePage = () => {
        const db = getDatabase();
        const pageRef = ref(db, 'storybook_pages/' + selectedPage.storybook_page_id);
        remove(pageRef);
        setDeleteModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button
                    title="Storybook"
                    onPress={() => navigation.navigate('Storybook')}
                    color='green'
                />
                <Button
                    title="Settings"
                    onPress={() => navigation.navigate('Settings')}
                    color='green'
                />
            </View>
            <Text style={styles.pagesTitle}>{storybook.storybook_name}</Text>
            <View style={styles.subsectionContainer}>
                <View style={styles.subsection}>
                    {storybookPages.length === 0 ? (
                        <Text style={styles.noPhotosText}>You haven't added any pages to this story</Text>
                    ) : (
                        <FlatList
                            data={storybookPages}
                            renderItem={({item, index}) => (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('StorybookDetail', {page: item})}
                                    onLongPress={() => {
                                        if (userRole === 'parent') {
                                        setSelectedPage(item);
                                        setDeleteModalVisible(true)
                                    }}
                                    }
                                >
                                    <Image source={{uri: item.page_photo}} style={{width: 100, height: 100}}/>
                                    <View>
                                        <Text style={styles.centeredText}>{item.page_number}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.storybook_page_id}
                            numColumns={2}
                        />
                    )}
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    {userRole === 'parent' && (
                    <Button
                        title="Add Page"
                        onPress={() => setModalVisible(true)}
                    />
                        )}
                </View>
                <View styles={styles.buttonWrapper}>
                    <Button
                        title="Play All Pages"
                        onPress={() => {
                            navigation.navigate('StorybookDetail', {pages: storybookPages})
                        }}
                    />
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                style={styles.modal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>Page Number:</Text>
                        <TextInput
                            placeholder="Page Number"
                            value={pageNumber}
                            onChangeText={setPageNumber}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <View style={styles.inputContainer}>
                            <Text>Pick Photo:</Text>
                            <Button
                                title={photoButtonTitle}
                                onPress={handlePickPhoto}
                                style={styles.button}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text>Pick Audio:</Text>
                            <Button
                                title={audioButtonTitle}
                                onPress={handlePickAudio}
                                style={styles.button}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Add"
                                onPress={handleAddPage}
                                style={styles.button}
                            />
                            <Button
                                title="Cancel"
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                                color="red"
                                style={styles.button}
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
                        <Text>Are you sure you want to delete this page?</Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Yes"
                                onPress={handleDeletePage}
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
    // ... existing styles ...
    container: {flex: 1},

    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    pagesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center', // Center the text
        marginTop: 20, // Move it below the buttons
    },
    subsection: {
        width: '80%', // 80% of screen width
        alignItems: "center", // Center items vertically
        justifyContent: "center", // Center items horizontally
        marginVertical: 10,
        borderColor: "#d3d3d3", // added border color
        borderWidth: 1, // added border width
        marginTop: 20, // Move it a little below the pagesTitle
        alignSelf: 'center', // Center the subsection within its parent container
    },
    noPhotosText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 15,
        margin: 10,
    },
    centeredText: {
        textAlign: 'center',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 20,
    },
    buttonWrapper: {
        marginHorizontal: 10, // Add space between the buttons
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
});

export default StorybookPage;