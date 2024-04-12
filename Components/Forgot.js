import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';
import { get, ref,child } from 'firebase/database';
import { db } from '../Firebase/config';

function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');

const resetSubmit = () => {
    if (username === '' || email === '') {
        setMessage('Username and Email are required');
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        setMessage('Email is not valid');
        return;
    }

    // Convert the email to lowercase and trim it // Replace '.' with ',' in the email
    const lowerCaseEmail = email.toLowerCase().trim();
    const emailKey = lowerCaseEmail.replace(/\./g, ',');

    // Create a reference to the 'users' node in the database
    const usersRef = ref(db, 'users/');

    // Use the child() method to get a reference to the child node with the key as the username
    const userRef = child(usersRef, username.toLowerCase().trim()); // use the exact username as input

    // Use the get() method to retrieve the data at the reference

    get(userRef)
        .then((snapshot) => {
            console.log(snapshot.val());
            if (snapshot.exists()) { // if snapshot exists, username exists
                const dbEmail = snapshot.val().email;
                if (dbEmail) {
                    const lowerDbEmail = dbEmail.toLowerCase().trim().replace(',', '.');
                    if (lowerDbEmail === lowerCaseEmail) {
                        // Navigate to the 'Reset' screen with the username
                        navigation.navigate('Reset', { username: username, email: emailKey.toLowerCase().trim()});
                    } else {
                        setMessage('Email does not match');
                    }
                } else {
                    console.error("Error: Email not found in database for user: ", username);
                }
            } else {
                setMessage('User does not exist');
            }
        })
        .catch((error) => {
            console.error("Error checking user: ", error);
        });
};
    return (
        <View style={styles.container}>
            <Text>Please enter the username and email associated with your account</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
            />
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
            />
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <View style={styles.buttonContainer}>
                <Button
                    title="Submit"
                    onPress={resetSubmit}
                    color="green"
                />
                <Button
                    title="Cancel"
                    onPress={() => navigation.navigate('Login')}
                    color="red"
                />
            </View>
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
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    message: {
        color: 'blue',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '40%',
    },
});

export default ForgotPassword;