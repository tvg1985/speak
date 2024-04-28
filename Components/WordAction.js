import React, {useState, useEffect} from "react";
import {
    View,
    ScrollView,
    Text,
    Button,
    StyleSheet,
    Dimensions,
    Modal,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";
import {UserIdContext} from "./UserIdContext";
import {Picker} from "@react-native-picker/picker";
import {db} from "../Firebase/config";
import {getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";
import {
    get,
    getDatabase,
    ref as dbRef,
    push,
    set,
    onValue,
    orderByChild,
    equalTo,
    query,
    once, remove
} from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {useForm, Controller} from "react-hook-form";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import {Audio} from "expo-av";
import * as MediaLibrary from "expo-media-library";
import base64 from "react-native-base64";

const {width, height} = Dimensions.get("window");

const storage = getStorage();


function WordAction({navigation}) {
    const {userId} = React.useContext(UserIdContext);
    console.log("user id: ", userId);
    const [photoName, setPhotoName] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [photos, setPhotos] = useState([]); // Initialize photos state as an empty array
    const [photo, setPhoto] = useState(null);
    const [photoMetaData, setPhotoMetaData] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const [audioFile, setAudioFile] = useState(null);
    const [audioMetaData, setAudioMetaData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [photoFileName, setPhotoFileName] = useState("Pick Photo");
    const [audioFileName, setAudioFileName] = useState("Pick Audio");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const {
        control,
        handleSubmit,
        formState: {errors},
        setValue,
        reset,
    } = useForm();

    useEffect(() => {
        fetchCategories();
        fetchPhotos();
    }, []);

    const fetchCategories = async () => {
        const db = getDatabase();
        const categoriesRef = dbRef(db, "categories");
        const snapshot = await once(
            orderByChild(categoriesRef, "user_id").equalTo(userId),
        );
        const categoriesData = snapshot.val();
        if (categoriesData) {
            const categoriesArray = Object.values(categoriesData);
            setCategories(categoriesArray);
        }
    };

    const handleAddAction = () => {
        try {
            fetchCategories();
            setModalVisible(true);
        } catch (error) {
            console.error("Error in handleAddAction: ", error);
        }
    };

    const handleAdd = async (data) => {
        try {
            const {photoName} = data;
            console.log("Photo name in handleAdd: ", photoName);

            if (!photoName.trim()) {
                setErrorMessage("Photo Name is required");
                return;
            }

            let photoRef;
            let photoSnapshot = null;
            let photoURL;
            // Check if a photo was selected
            if (!photo) {
                setErrorMessage("Photo is required");
                return;
            }
            // upload photo to firebase storage
            else {
                const photoBlob = await getBlobFromUri(photo);

                // Upload the Blob to Firebase Storage
                photoRef = ref(storage, `photos/${photoFileName}`);
                photoSnapshot = await uploadBytes(photoRef, photoBlob, photoMetaData);
                console.log("Photo snapshot: ", photoSnapshot);
                photoURL = await getDownloadURL(photoSnapshot.ref);
                console.log("Photo URL: ", photoURL);
            }

            let audioRef;
            let audioSnapshot = null;
            let audioURL;
            if (!audioFile) {
                setErrorMessage("Audio File is required");
                return;
            } else {
                const audioBlob = await getBlobFromUri(audioFile);
                audioRef = ref(storage, `audio/${audioFileName}`);
                audioSnapshot = await uploadBytes(audioRef, audioBlob, audioMetaData);
                console.log("Audio snapshot: ", audioSnapshot);
                audioURL = await getDownloadURL(audioSnapshot.ref);
            }

            // Check if the files were uploaded successfully
            if (!photoSnapshot || !audioSnapshot) {
                setErrorMessage("Error uploading files to Firebase Storage");
                return;
            }

            // Check if the URLs are valid
            if (!photoURL || !audioURL) {
                setErrorMessage("Error getting download URLs");
                return;
            }

            const newPhoto = {
                photo_name: photoName,
                photo: photoURL,
                user_id: userId,
                category_id: categoryId || "", // If categoryId is not provided, use an empty string
                audio_file: audioURL,
            };

            const photosRef = dbRef(db, "photos");
            const newPhotoRef = push(photosRef);
            await set(newPhotoRef, newPhoto);

            handleCancel();
        } catch (error) {
            console.error("Error in handleAdd: ", error);
        }
    };

    const handleCancel = () => {
        setPhotoName("");
        setPhoto(null);
        setCategoryId("");
        setAudioFile(null);
        setPhotoFileName("Pick Photo"); // Reset the photo file name
        setAudioFileName("Pick Audio"); // Reset the audio file name
        setModalVisible(false);
        reset();
    };

    const handlePickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                const fileName = result.assets[0].fileName;
                const mimeType = result.assets[0].mimeType;

                if (mimeType === "image/png" || mimeType === "image/jpeg") {
                    let metadata = {
                        contentType: mimeType,
                    };
                    setPhoto(uri);
                    setPhotoFileName(fileName);
                    setPhotoMetaData(metadata);
                } else {
                    setErrorMessage("Photo must be in PNG or JPG format");
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
        console.log("Audio file picker result: ", result);

        if (!result.canceled && result.assets && result.assets[0].uri) {
            let uri = result.assets[0].uri;
            console.log("audio file uri: ", uri);
            let mimeType = result.assets[0].mimeType;
            //Add default extension if none is found?

            console.log("Audio file is being selected: ", uri); // Log that an audio file is being selected

            if (validMimeTypes.includes(mimeType)) {
                console.log("audio valid, with mime type: ", mimeType);
                let metadata = {
                    contentType: mimeType,
                };
                setAudioFile(uri);
                const fileName = uri.split("/").pop();
                setAudioFileName(fileName);
                setAudioMetaData(metadata);
            }
        } else {
            console.log(
                "No audio file was selected or an error occurred. Result: ",
                result,
            );
        }
    };

    // gets the blob from a uri
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

    const fetchPhotos = async () => {
        console.log("fetching photos for user: ", userId);
        const db = getDatabase();
        const photosRef = dbRef(db, "photos");
        try {
            const photosQuery = query(
                photosRef,
                orderByChild("user_id"),
                equalTo(userId),
            );
            onValue(photosQuery, (snapshot) => {
                const photosData = snapshot.val();
                if (photosData) {
                    const photosArray = Object.entries(photosData).map(([id, data]) => ({id, ...data}));
                    setPhotos(photosArray);
                }
            });
        } catch (error) {
            console.error("Error fetching photos: ", error);
        }
    };


    let soundObject = null;
    const playAudio = async (audioFile) => {

        // If a sound is currently playing, for sanity's sake, stop it.
        // one noise at a time, please.
        if (soundObject) {
            await soundObject.stopAsync();
            soundObject = null;
        } else {
            soundObject = new Audio.Sound();
            console.log("Audio file URL: ", audioFile);

            try {
                await soundObject.loadAsync({uri: audioFile});
                await soundObject.playAsync();
            } catch (error) {
                console.error("Error playing audio: ", error);
            }
        }
    };
    const deletePhoto = async () => {
        console.log("photoToDelete in deletePhoto: ", photoToDelete); // Add this line
        try {
            const db = getDatabase();
            const photoName = photoToDelete.photo_name;
            const photosRef = dbRef(db, "photos");

            // Query the Firebase Realtime Database for a photo with the same name and user id
            const photosQuery = query(
                photosRef,
                orderByChild("photo_name"),
                equalTo(photoName),
            );

            // Get the snapshot of the query
            const snapshot = await get(photosQuery);

            // If a photo is found, delete it from the Firebase Realtime Database
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    if (childSnapshot.val().user_id === userId) {
                        const photoDbRef = dbRef(db, `photos/${childSnapshot.key}`);
                        remove(photoDbRef);
                    }
                });

                // Close the modal and reset photoToDelete
                setDeleteModalVisible(false);
                setPhotoToDelete(null);
            } else {
                console.log(`No photo found with name: ${photoName}`);
            }
        } catch (error) {
            console.error("Error deleting photo: ", error);
        }
    };
    const handleLongPress = (item) => {
        console.log("photoToDelete: ", item); // Add this line
        setPhotoToDelete(item);
        setDeleteModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button
                    title="Home"
                    onPress={() => navigation.navigate("Home")}
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
            <View style={styles.subsectionsContainer}>
                <View style={styles.subsection}>
                    <Text style={styles.header}>Word Actions:</Text>
                    <Button title="Add Action" onPress={handleAddAction} color="blue"/>
                    <FlatList
                        data={photos}
                        renderItem={({item, index}) => (
                            <TouchableOpacity onPress={() => playAudio(item.audio_file)}
                                              onLongPress={() => handleLongPress(item, index)}>
                                <Image source={{uri: item.photo}} style={styles.photo}/>
                                <View style={styles.centeredText}>
                                    <Text>{item.photo_name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.photo_name}
                        numColumns={2}
                    />
                </View>
                <View style={styles.subsection}>
                    <Text style={styles.header}>Categories:</Text>
                    <Button
                        title="Add"
                        onPress={() => {
                            // add function here
                        }}
                        color="blue"
                    />
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {errorMessage ? (
                            <Text style={{color: "red"}}>{errorMessage}</Text>
                        ) : null}
                        <Controller
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={(value) => {
                                        setPhotoName(value);
                                        onChange(value);
                                    }}
                                    value={photoName}
                                    placeholder="Photo Name"
                                />
                            )}
                            name="photoName"
                            rules={{required: true}}
                            defaultValue=""
                        />
                        {errors.photoName && <Text>This is required.</Text>}
                        <View style={styles.inputContainer}>
                            <Text>Photo File:</Text>
                            <Button
                                title={photoFileName ? photoFileName : "Pick Photo"}
                                onPress={handlePickImage}
                                color="blue"
                            />
                        </View>
                        {categories.length > 0 ? (
                            <Controller
                                control={control}
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Picker
                                        selectedValue={value}
                                        onValueChange={(value) => {
                                            setCategoryId(value);
                                            onChange(value);
                                        }}
                                    >
                                        {categories.map((category, index) => (
                                            <Picker.Item
                                                key={index}
                                                label={category.category_name}
                                                value={category.category_id}
                                            />
                                        ))}
                                    </Picker>
                                )}
                                name="categoryId"
                                defaultValue=""
                            />
                        ) : null}
                        <View style={styles.inputContainer}>
                            <Text>Audio File:</Text>
                            <Button
                                title={audioFileName ? audioFileName : "Pick Audio"}
                                onPress={handlePickAudioFile}
                                color="blue"
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Add"
                                onPress={handleSubmit(handleAdd)}
                                color="blue"
                            />
                            <Button title="Cancel" onPress={handleCancel} color="red"/>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>Are you sure you want to delete this photo?</Text>
                        <View style={styles.buttonContainer}>
                            <Button title="Yes" onPress={deletePhoto} color="red"/>
                            <Button title="No" onPress={() => setDeleteModalVisible(false)} color="blue"/>
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
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-between",
    },
    topButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 10,
        marginTop: 10,
    },
    subsectionsContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        marginTop: 60,
    },
    subsection: {
        width: width * 0.8, // 80% of screen width
        alignItems: "center",
        marginVertical: 10,
        borderColor: "#d3d3d3", // added border color
        borderWidth: 1, // added border width
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
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
    input: {
        width: "60%", // Reduce width to 60% to fit in the modal
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
    },
    photo: {
        borderWidth: 1,
        borderColor: "red",
        width: width * 0.2, // specify a width
        height: 100, // specify a height
        backgroundColor: "gray", // add a gray background
        margin: 5,
    },
    centeredText: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WordAction;
