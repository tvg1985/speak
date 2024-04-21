import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Dimensions, Modal, TextInput, FlatList} from 'react-native';
import {UserIdContext} from "./UserIdContext";
import {Picker} from "@react-native-picker/picker";
import {db} from '../Firebase/config';
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {getDatabase, ref as dbRef, push, set} from "firebase/database";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {useForm, Controller} from 'react-hook-form';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import {Audio} from 'expo-av';

const {width, height} = Dimensions.get('window');

const storage = getStorage();

function WordAction({navigation}) {
    const {userId} = React.useContext(UserIdContext);
    console.log('user id: ', userId);
    const [photoName, setPhotoName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [photos, setPhotos] = useState([]); // Initialize photos state as an empty array
    const [photo, setPhoto] = useState(null);
    const [categoryId, setCategoryId] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [photoFileName, setPhotoFileName] = useState('Pick Photo');
    const [audioFileName, setAudioFileName] = useState('Pick Audio');
    const {control, handleSubmit, formState: {errors}, setValue, reset} = useForm();

    const fetchCategories = async () => {
        const categoriesRef = db.ref('categories');
        const snapshot = await categoriesRef.orderByChild('user_id').equalTo(userId).once('value');
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

            if (!photoName.trim()) {
                setErrorMessage('Photo Name is required');
                return;
            }

            if (!photo) {
                setErrorMessage('Photo is required');
                return;
            }

            if (!audioFile) {
                setErrorMessage('Audio File is required');
                return;
            }

            const photoRef = ref(storage, `photos/${photoName}`);
            const audioRef = ref(storage, `audio/${photoName}`);

            await uploadBytes(photoRef, photo);
            await uploadBytes(audioRef, audioFile);

            const photoURL = await getDownloadURL(photoRef);
            const audioURL = await getDownloadURL(audioRef);

            const newPhoto = {
                photo_name: photoName,
                photo: photoURL,
                user_id: userId,
                category_id: categoryId || '', // If categoryId is not provided, use an empty string
                audio_file: audioURL,
            };

            const photosRef = dbRef(db, 'photos');
            const newPhotoRef = push(photosRef);
            await set(newPhotoRef, newPhoto);

            handleCancel();
        } catch (error) {
            console.error("Error in handleAdd: ", error);
        }
    };
    const handleCancel = () => {
        setPhotoName('');
        setPhoto(null);
        setCategoryId('');
        setAudioFile(null);
        setPhotoFileName('Pick Photo'); // Reset the photo file name
        setAudioFileName('Pick Audio'); // Reset the audio file name
        setModalVisible(false);
        reset();
    };

    const handlePickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
            });

            console.log("Image picker result: ", result);

            if (!result.cancelled && result.assets && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                if (typeof uri === 'string') {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        uri,
                        [{resize: {width: 300}}],
                        {compress: 0.7, format: ImageManipulator.SaveFormat.PNG}
                    );
                    setPhoto(manipResult.uri);
                    // Extract the file name from the URI
                    const fileName = manipResult.uri.split('/').pop();
                    setPhotoFileName(fileName);

                    const truncatedFileName = truncateName(fileName, 10);
                    setPhotoFileName(truncatedFileName);

                    // Log the selected photo
                    console.log("Selected photo: ", manipResult);
                }
            }
        } catch (error) {
            console.error("Error picking image: ", error);
        }
    };

    const pickAudioFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
        });

        if (!result.cancelled && result.assets && result.assets[0].uri) {
            let uri = result.assets[0].uri;
            // Add default extension if none is found
            if (!uri.endsWith('.mp3')) {
                uri += '.mp3';
            }
            console.log("Audio file is being selected: ", uri); // Log that an audio file is being selected
            setAudioFile(uri);
            // Extract the file name from the URI
            const fileName = uri.split('/').pop();
            const truncatedFileName = truncateName(fileName, 10);
            setAudioFileName(truncatedFileName);
        } else {
            console.log("No audio file was selected or an error occurred. Result: ", result);
        }
    };
    const fetchPhotos = async () => {
        console.log('userId: ', userId); // Log the userId
        const photosRef = dbRef(db, 'photos');
        const snapshot = await photosRef.orderByChild('user_id').equalTo(userId).once('value');
        const photosData = snapshot.val();
        console.log('photosData: ', photosData); // Log the photosData before filtering
        if (photosData) {
            const photosArray = Object.values(photosData).filter(photo => photo.category_id === '');
            console.log('photosArray: ', photosArray); // Log the photosArray after filtering
            setPhotos(photosArray);
        }
    };

    function truncateName(name, maxLength) {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + '...';
        }
        return name;
    }


    const playAudio = async (audioFile) => {
        const soundObject = new Audio.Sound();
        try {
            await soundObject.loadAsync({uri: audioFile});
            await soundObject.playAsync();
        } catch (error) {
            console.error("Error playing audio: ", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPhotos();
    }, []);

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
            <View style={styles.subsectionsContainer}>
                <View style={styles.subsection}>
                    <Text style={styles.header}>Word Actions:</Text>
                    <Button
                        title="Add Action"
                        onPress={handleAddAction}
                        color="blue"
                    />
                    <FlatList
                        data={photos}
                        renderItem={({item}) => (
                            <TouchableOpacity onPress={() => playAudio(item.audio_file)}>
                                <Image source={{uri: item.photo}} style={styles.photo}/>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.photo_name}
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
                        {errorMessage ? <Text style={{color: 'red'}}>{errorMessage}</Text> : null}
                        <Controller
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={value => {
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
                                        onValueChange={value => {
                                            setCategoryId(value);
                                            onChange(value);
                                        }}
                                    >
                                        {categories.map((category, index) => (
                                            <Picker.Item key={index} label={category.category_name}
                                                         value={category.category_id}/>
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
                                onPress={pickAudioFile}
                                color="blue"
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Add"
                                onPress={handleSubmit(handleAdd)}
                                color="blue"
                            />
                            <Button
                                title="Cancel"
                                onPress={handleCancel}
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
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    subsectionsContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginTop: 60,
    },
    subsection: {
        width: width * 0.8, // 80% of screen width
        alignItems: 'center',
        marginVertical: 10,
        borderColor: '#d3d3d3', // added border color
        borderWidth: 1, // added border width
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%', // Set width to 90% of device width
        height: '80%', // Set height to 80% of device height
    },
    buttonContainer: {
        flexDirection: 'row', // Arrange buttons side by side
        justifyContent: 'center', // Center buttons horizontally
        width: '100%', // Use full width of the container
        marginTop: 20, // Add some margin at the top
        marginBottom: 10, // Add some margin at the bottom
    },

    inputContainer: {
        flexDirection: 'row', // Arrange text and input field side by side
        justifyContent: 'space-between', // Add space between text and input field
        alignItems: 'center', // Vertically align items in the center
        width: '100%', // Use full width of the container
        marginBottom: 10, // Add some margin at the bottom
    },
    input: {
        width: '60%', // Reduce width to 60% to fit in the modal
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
    },
});

export default WordAction;