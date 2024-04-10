import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View, Image, TextInput} from 'react-native';

function Login({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        fetch('http://10.0.2.2/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // If login is successful, navigate to the Home screen
                    navigation.navigate('Home');
                } else {
                    // If login failed, show error message
                    setError(data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setError('An error occurred. Please try again.');
            });
    };
    return (
        <View style={styles.container}>
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
                Forgot username/password?
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
        </View>
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