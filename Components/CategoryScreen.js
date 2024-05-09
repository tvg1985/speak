import React, {useEffect, useState} from 'react';
import {
    Dimensions,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    Text,
    Button,
    StyleSheet,
    Modal
} from 'react-native';
import {
    getDatabase,
    ref as dbRef,
    onValue,
    query,
    orderByChild,
    equalTo,
    get,
    push,
    set,
    remove
} from 'firebase/database';
import {getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import {useNavigation} from '@react-navigation/native';
import {Audio} from "expo-av";
import {Picker} from "@react-native-picker/picker";
import {useForm, Controller} from "react-hook-form";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from "expo-document-picker";
import {UserIdContext} from "./UserIdContext";

const {width, height} = Dimensions.get("window");


function CategoryScreen({route}) {
    const {userId, categoryName} = route.params;
    const {userRole, parentId} = React.useContext(UserIdContext);
    const [photos, setPhotos] = useState([]);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [addActionModalVisible, setAddActionModalVisible] = useState(false);
    const [newPhoto, setNewPhoto] = useState({
        photo: '',
        photo_name: '',
        audio_file: '',
        // Add any other fields you need for a photo
    });
    const [photoFileName, setPhotoFileName] = useState("");
    const {control, handleSubmit, formState: {errors}} = useForm();
    const [audioFileName, setAudioFileName] = useState("");

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        const db = getDatabase();
        const photosRef = dbRef(db, "photos");
        const userIdToFetch = userRole === 'child' ? parentId : userId;

        try {
            const photosQuery = query(
                photosRef,
                orderByChild("user_id"),
                equalTo(userIdToFetch),
            );
            onValue(photosQuery, (snapshot) => {
                const photosData = snapshot.val();
                if (photosData) {
                    const photosArray = Object.entries(photosData)
                        .map(([id, data]) => ({id, ...data}))
                        .filter(photo => photo.category_id === categoryName);
                    setPhotos(photosArray);
                }
            });
        } catch (error) {
            console.error("Error fetching photos: ", error);
        }
    };

    let soundObject = null;
    const playAudio = async (audioFile) => {
        // If a sound is currently playing, stop it.
        if (soundObject) {
            await soundObject.stopAsync();
            soundObject = null;
        }

        // Start playing the audio
        soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync({uri: audioFile});
            await soundObject.playAsync();
        } catch (error) {
            console.error("Error playing audio: ", error);
        }
    };
    const handleLongPressPhoto = (photo) => {
        if (userRole === 'parent') {
            setSelectedPhoto(photo);
            setModalVisible(true);
        }
    };

    const handleDeletePhoto = async () => {
        console.log("handleDeletePhoto called"); // Debugging line
        console.log("selectedPhoto.id: ", selectedPhoto.id); // Debugging line

        const db = getDatabase();
        const photoRef = dbRef(db, `photos/${selectedPhoto.id}`);
        try {
            await remove(photoRef);
        } catch (error) {
            console.error("Error deleting photo: ", error);
            return;
        }

        // Fetch photos again after a photo is deleted
        fetchPhotos();
        handleCancelDelete();
    };
    const handleCancelDelete = () => {
        setSelectedPhoto(null);
        setModalVisible(false);
    };
    const handleAddAction = () => {
        setAddActionModalVisible(true);
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
                    setNewPhoto(prevState => ({
                        ...prevState,
                        photo: uri,
                        photo_name: fileName,
                    }));
                    setPhotoFileName(fileName);
                } else {
                    console.error("Photo must be in PNG or JPG format");
                }
            }
        } catch (error) {
            console.error("Error picking image: ", error);
        }
    };
    const handlePickAudioFile = async () => {
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

        if (!result.cancelled && result.assets && result.assets[0].uri) {
            let uri = result.assets[0].uri;
            let mimeType = result.assets[0].mimeType;

            if (validMimeTypes.includes(mimeType)) {
                setNewPhoto(prevState => ({
                    ...prevState,
                    audio_file: uri,
                }));
                console.log('name: ',);
                setAudioFileName(result.assets[0].name);

            } else {
                console.error("Audio file must be in MP3, WAV, or M4A format");
            }
        } else {
            console.error("No audio file was selected or an error occurred", result);
        }
    };
    const handleAddPhoto = handleSubmit(async (data) => {
        try {
            const {photo_name} = data;

            if (!photo_name.trim()) {
                console.error("Photo Name is required");
                return;
            }

            let photoRef;
            let photoSnapshot = null;
            let photoURL;
            if (!newPhoto.photo) {
                console.error("Photo is required");
                return;
            } else {
                const photoBlob = await fetch(newPhoto.photo).then(r => r.blob());

                const storage = getStorage();
                photoRef = storageRef(storage, `photos/${photo_name}`);
                photoSnapshot = await uploadBytesResumable(photoRef, photoBlob);
                photoURL = await getDownloadURL(photoSnapshot.ref);
            }

            let audioRef;
            let audioSnapshot = null;
            let audioURL;
            if (!newPhoto.audio_file) {
                console.error("Audio File is required");
                return;
            } else {
                const audioBlob = await fetch(newPhoto.audio_file).then(r => r.blob());

                const storage = getStorage();
                audioRef = storageRef(storage, `audio/${photo_name}`);
                audioSnapshot = await uploadBytesResumable(audioRef, audioBlob);
                audioURL = await getDownloadURL(audioSnapshot.ref);
            }

            if (!photoSnapshot || !audioSnapshot) {
                console.error("Error uploading files to Firebase Storage");
                return;
            }

            if (!photoURL || !audioURL) {
                console.error("Error getting download URLs");
                return;
            }

            const newPhotoData = {
                photo_name: photo_name,
                photo: photoURL,
                user_id: userId,
                category_id: categoryName,
                audio_file: audioURL,
            };

            const db = getDatabase();
            const photosRef = dbRef(db, 'photos');
            const newPhotoRef = push(photosRef);
            await set(newPhotoRef, newPhotoData);

            setNewPhoto({
                photo: '',
                photo_name: '',
                audio_file: '',
            });
            setAddActionModalVisible(false);

            fetchPhotos();
        } catch (error) {
            console.error("Error in handleAddPhoto: ", error);
        }
    });
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button
                    title="Word Action"
                    onPress={() => navigation.navigate('WordAction', {userId})}
                    color="green"
                />
                <Button
                    title="Settings"
                    onPress={() => console.log('Settings button pressed')}
                    color="green"
                />
            </View>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <View style={styles.subsection}>
                {photos.length === 0 ? (
                    <Text style={styles.noPhotosText}>There are no actions in this category</Text>
                ) : (
                    <FlatList
                        data={photos}
                        renderItem={({item, index}) => (
                            <TouchableOpacity
                                onPress={() => playAudio(item.audio_file)}
                                onLongPress={() => handleLongPressPhoto(item)}
                            >
                                <Image source={{uri: item.photo}} style={{width: 100, height: 100}}/>
                                <View>
                                    <Text style={styles.centeredText}>{item.photo_name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.photo_name}
                        numColumns={2}
                    />
                )}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.addActionModalView}>
                            <Text style={styles.modalText}>Are you sure you want to delete this photo?</Text>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Yes"
                                    onPress={handleDeletePhoto}
                                    color="red"
                                />
                                <Button
                                    title="No"
                                    onPress={handleCancelDelete}
                                    color="blue"
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={styles.addActionButtonContainer}>
                {userRole === 'parent' && (
                <Button
                    title="Add Action"
                    color="blue"
                    onPress={handleAddAction}
                />
                    )}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={addActionModalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Add a new action</Text>

                        <Controller
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Photo Name"
                                />
                            )}
                            name="photo_name"
                            rules={{required: true}} // Add your validation rules here
                        />
                        {errors.photo_name && <Text>This is required.</Text>}

                        <View style={styles.inputContainer}>
                            <Text>Photo File:</Text>
                            <Button style={styles.modalButtonContainer}
                                    title={photoFileName ? photoFileName : "Pick Photo"}
                                    onPress={handlePickImage}
                                    color="blue"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text>Audio File:</Text>
                            <Button style={styles.modalButtonContainer}
                                    title={audioFileName ? audioFileName : "Pick Audio"}
                                    onPress={handlePickAudioFile}
                                    color="blue"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            {/* Make sure the category field is pre-filled with the current category and disabled */}
                            <Text>Category:</Text>
                            <TextInput
                                value={categoryName}
                                editable={false}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Add"
                                onPress={handleAddPhoto}
                                color="green"
                            />
                            <Button
                                title="Cancel"
                                onPress={() => setAddActionModalVisible(false)}
                                color="red"
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
    }
    ,
    centeredText: {
        textAlign: 'center',
        fontWeight:
            'bold',
    }
    ,
    buttonContainer: {
        flexDirection: 'row',
        justifyContent:
            'space-between',
        padding:
            10,
    }
    ,
    categoryTitle: {
        fontSize: 20,
        fontWeight:
            'bold',
        textAlign:
            'center',
        marginVertical:
            10,
    }
    ,
    subsection: {
        borderColor: 'gray',
        borderWidth:
            1,
        borderRadius:
            10,
        padding:
            10,
        margin:
            10,
    }
    ,

    centeredView: {
        flex: 1,
        justifyContent:
            "center",
        alignItems:
            "center",
        marginTop:
            22
    }
    ,
    modalView: {
        margin: 20,
        backgroundColor:
            "white",
        borderRadius:
            20,
        padding:
            35,
        alignItems:
            "center",
        shadowColor:
            "#000",
        shadowOffset:
            {
                width: 0,
                height:
                    2
            }
        ,
        shadowOpacity: 0.25,
        shadowRadius:
            4,
        elevation:
            5
    }
    ,
    modalText: {
        marginBottom: 15,
        textAlign:
            "center"
    }
    ,
    noPhotosText: {
        textAlign: 'center',
        color:
            'gray',
        fontSize:
            18,
        marginTop:
            20,
    }
    ,
    addActionButtonContainer: {
        marginTop: 20,
        width:
            '30%',
        alignSelf:
            'center',
    },
    addActionModalView: {
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
    modalButtonContainer: {
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
    input: {
        width: "60%", // Reduce width to 60% to fit in the modal
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
    },
});
export default CategoryScreen;