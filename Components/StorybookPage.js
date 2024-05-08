import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, Button} from 'react-native';
import {getDatabase, ref, onValue, query, orderByChild, equalTo} from 'firebase/database';
import {useNavigation} from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import {getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL} from "firebase/storage";

const {width, height} = Dimensions.get("window");

function StorybookPage({route}) {
    const {storybook, userId} = route.params;
    console.log('storybook', storybook);
    const navigation = useNavigation();
    const [storybookPages, setStorybookPages] = useState([]);

    useEffect(() => {
        if (storybookPages.length > 0) {
            const db = getDatabase();
            const storybookPagesRef = ref(db, 'storybook_pages');
            const q = query(storybookPagesRef, orderByChild('storybook_id'), equalTo(storybook.storybook_id));
            const unsubscribe = onValue(q, (snapshot) => {
                const data = snapshot.val();
                const pages = Object.values(data).filter(page => page.user_id === userId);
                setStorybookPages(pages);
            });

            return () => {
                unsubscribe();
            };
        }
    }, [storybook.storybook_id, userId, storybookPages]);

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
                    onPress={() => navigation.navigate('SettingsScreen')}
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
                                    onPress={() => playAudio(item.page_audio)}
                                >
                                    <Image source={{uri: item.page_photo}} style={{width: 100, height: 100}}/>
                                    <View>
                                        <Text style={styles.centeredText}>{item.storybook_page_id}</Text>
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
                <Button
                    title="Add Page"
                    onPress={() => {/* Add your navigation or function here */
                    }}
                />
                    </View>
                <View styles={styles.buttonWrapper}>
                <Button
                    title="Play All Pages"
                    onPress={() => {/* Add your navigation or function here */
                    }}
                />
                </View>
            </View>
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
});

export default StorybookPage;