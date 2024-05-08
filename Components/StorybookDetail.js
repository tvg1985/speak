import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { Audio } from 'expo-av';

function StorybookPageDetail({ route, navigation }) {
    const { page } = route.params;
    let soundObject = new Audio.Sound();

    useEffect(() => {
        (async () => {
            try {
                await soundObject.loadAsync({ uri: page.page_audio });
                await soundObject.playAsync();
            } catch (error) {
                console.error("Error playing audio: ", error);
            }
        })();

        return () => {
            soundObject.unloadAsync();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Image source={{ uri: page.page_photo }} style={styles.image} resizeMode="contain" />
            <Button title="Back" onPress={() => navigation.goBack()} style={styles.backButton} />
            <Text style={styles.text}>{page.page_number}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image: {
        width: Dimensions.get('window').width * 0.7,
        height: Dimensions.get('window').height * 0.7,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1,
    },
});

export default StorybookPageDetail;