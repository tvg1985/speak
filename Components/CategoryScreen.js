import React, {useEffect, useState} from 'react';
import {View, FlatList, Image, TouchableOpacity, Text, Button, StyleSheet} from 'react-native';
import {getDatabase, ref as dbRef, onValue, query, orderByChild, equalTo, get, remove} from 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {Audio} from "expo-av";

function CategoryScreen({route}) {
    const {userId, categoryName} = route.params;
    const [photos, setPhotos] = useState([]);
    const navigation = useNavigation();

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
                <FlatList
                    data={photos}
                    renderItem={({item, index}) => (
                        <TouchableOpacity onPress={() => playAudio(item.audio_file)}>
                            <Image source={{uri: item.photo}} style={{width: 100, height: 100}}/>
                            <View>
                                <Text style={styles.centeredText}>{item.photo_name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.photo_name}
                    numColumns={2}
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
});
export default CategoryScreen;