import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {Dimensions, Button, StyleSheet, Text, View, Image, TextInput} from 'react-native';
import { db } from '../Firebase/config';
import { ref, get } from "firebase/database";
import * as Crypto from 'expo-crypto';
import {UserIdContext} from "./UserIdContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const {width, height} = Dimensions.get("window");

function Login({ navigation }) {
    const {setUserId, setUserRole, setUserName, setParentId} = React.useContext(UserIdContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Clear state here
            setUsername('');
            setPassword('');
            setError('');
        });

        return unsubscribe;
    }, [navigation]);

   const handleSubmit = async () => {
    if (username.includes('@')) {
        setError('Please enter only the username, not an email');
        return;
    }
    const usersRef = ref(db, 'users/');
    get(usersRef).then(async (snapshot) => {
        if (snapshot.exists()) {
            let userExists = false;
            const users = snapshot.val();
            for (const userId in users) {
                const user = users[userId];
                const dbUsername = user.user_name;
                const dbPassword = user.password;
                const dbRole = user.role; // Get the user role from the database
                const dbParentId = user.parent_id; //Get the user parent ID from the database
                const hashedPassword = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    password
                );
                if (dbUsername.toLowerCase() === username.toLowerCase() && dbPassword === hashedPassword) {
                    // If login is successful, navigate to the Home screen
                    setUserId(userId);
                    setUserRole(dbRole);
                    setUserName(dbUsername);
                    setParentId(dbParentId);
                    navigation.navigate('Home');
                    userExists = true;
                    break; // Stop looping through the users
                }
            }
            if (!userExists) {
                setError('Invalid username or password');
            }
        } else {
            setError('Invalid username or password');
        }
    }).catch((error) => {
        console.error('Error:', error);
        setError('An error occurred. Please try again.');
    });
};
    return (
        <KeyboardAwareScrollView
            resetScrollToCoords={{ x: 0, y: 0 }}
            extraHeight={220}
            // extraScrollHeight={140}
            keyboardOpeningTime={200}
            contentContainerStyle={styles.container}
            scrollEnabled={true}
        >
            <Image
                source={require('../assets/unlocklogo.jpg')}
                style={styles.image}
                resizeMode="contain"
            />
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('Forgot')}
            >
                Forgot password?
            </Text>
            <View style={styles.buttonContainer}>
                <Button
                    title="Login"
                    onPress={handleSubmit}
                    color="green"
                />
                <Button
                    title="Register"
                    onPress={() => navigation.navigate('Register')}
                    color="green"
                />
            </View>
            <StatusBar style="auto" />
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 400,
        height: 400,
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    forgotPassword: {
        color: 'blue',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '40%',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        fontSize: 12,
        alignSelf: 'center',
    },
});

export default Login;