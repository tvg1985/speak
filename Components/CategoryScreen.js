import React, {useEffect, useState} from 'react';
import {Dimensions,View, FlatList, Image, TouchableOpacity, Text, Button, StyleSheet, Modal} from 'react-native';
import {getDatabase, ref as dbRef, onValue, query, orderByChild, equalTo, get, remove} from 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {Audio} from "expo-av";
const {width, height} = Dimensions.get("window");


function CategoryScreen({route}) {
    const {userId, categoryName} = route.params;
    const [photos, setPhotos] = useState([]);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);


    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        const db = getDatabase();
        const photosRef = dbRef(db, "photos");
        const photosQuery = query(
            photosRef,
            orderByChild("user_id"),
            equalTo(userId),
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
        setSelectedPhoto(photo);
        setModalVisible(true);
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
                        <View style={styles.modalView}>
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
                <Button
                    title="Add Action"
                    color="blue"
                    onPress={() => console.log('Add Action button pressed')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredText: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    subsection: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        margin: 10,
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    noPhotosText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 18,
        marginTop: 20,
    },
    addActionButtonContainer: {
        marginTop: 20,
        width: '30%',
        alignSelf: 'center',
    },
});
export default CategoryScreen;