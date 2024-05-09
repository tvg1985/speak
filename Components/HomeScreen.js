import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions} from 'react-native'; // Im
import React from 'react';
import {UserIdContext} from "./UserIdContext";


const { width, height } = Dimensions.get('window');

function HomeScreen({navigation}) {
    const {setUserId} = React.useContext(UserIdContext);
    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button
                    title="Logout"
                    onPress={() => {
                        setUserId(null);
                        navigation.navigate('Login');
                    }}
                    color="red"
                />
                <Button
                    title="Settings"
                    onPress={() => {
                       navigation.navigate('Settings');
                    }}
                    color="green"
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={() => navigation.navigate('WordAction')}>
                    <Image
                        source={require('../assets/wordAction.png')}
                        style={styles.image}
                    />
                    <Text>Word Action</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={() => navigation.navigate('Storybook')}>
                    <Image
                        source={require('../assets/storybook.jpg')}
                        style={styles.image}
                    />
                    <Text>Storybook</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
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
        marginTop: 20,
    },
    buttonContainer: {
        flex: 1, // Take up remaining space
        flexDirection: 'column', // Stack buttons vertically
        justifyContent: 'center',
        alignItems: 'center', // Center vertically
    },
    imageButton: {
        alignItems: 'center',
        margin: 5,
        borderColor: "#d3d3d3",
        borderWidth: 3,
    },
    image: {
        width: width * 0.8, // 80% of screen width
        height: height * 0.3, // 30% of screen height
        resizeMode: 'contain',
        borderColor: "#d3d3d3",
        borderWidth: 3,
    },
    text: {
        fontSize: 25,
    },
});

export default HomeScreen;