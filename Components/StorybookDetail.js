import React, {useEffect, useState} from 'react';
import {View, Image, Text, StyleSheet, Dimensions, Button, ScrollView} from 'react-native';
import {Audio} from 'expo-av';
import {Swipeable} from "react-native-gesture-handler";

const {width, height} = Dimensions.get("window");

function StorybookPageDetail({route, navigation}) {
    let {page, pages} = route.params;
    if (!Array.isArray(pages)) {
        pages = [page];
    }


    let soundObject = new Audio.Sound();
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const currentPage = pages ? pages[0] : page;
    const [isImageLoading, setImageLoading] = useState(true);

    console.log('current page: ', currentPage)

    if (!currentPage || !currentPage.page_photo || !currentPage.page_number) {
        return <Text>Error: Page data is missing!</Text>;
    }

    useEffect(() => {
        (async () => {
            try {
                await soundObject.loadAsync({uri: pages[currentPageIndex].page_audio});
                await soundObject.playAsync();
            } catch (error) {
                console.error("Error playing audio: ", error);
            }
        })();

        return () => {
            soundObject.unloadAsync();
        };
    }, [currentPageIndex]);

    const handleSwipeLeft = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    if (pages) {
        // If pages is an array, use swipe functionality
        return (
            <ScrollView
                horizontal
                pagingEnabled
                onScroll={event => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    if (newIndex !== currentPageIndex) {
                        setCurrentPageIndex(newIndex);
                    }
                }}
                scrollEventThrottle={16}
            >
                {pages.map((page, index) => (
                    <View style={styles.container} key={index}>
                        <Image source={{uri: page.page_photo}} style={styles.image}/>
                        <Button title="Back" onPress={() => navigation.goBack()} style={styles.backButton}/>
                        <Text style={styles.text}>{page.page_number}</Text>
                    </View>
                ))}
            </ScrollView>
        );
    } else {
        // If pages is a single object, just display the page and play the audio
        return (
            <View style={styles.container}>
                <Image source={{uri: currentPage.page_photo}} style={styles.image}/>
                <Text style={styles.text}>{currentPage.page_number}</Text>
                <Button title="Back" onPress={() => navigation.goBack()} style={styles.backButton}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 60,

    },
    image: {
        width: width * 0.7, // Set width to 100% of the device's screen width
        height: height * 0.7, // Increase height to 70% of the device's screen height
        resizeMode: 'contain',

    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    backButton: {

        marginBottom: 0, // Add some margin at the bottom to move the button below the image
    },
});

export default StorybookPageDetail;