import React, { useState } from 'react';
import { Dimensions, Button, StyleSheet, Text, View, TextInput } from 'react-native';
import { get, ref,child } from 'firebase/database';
import { db } from '../Firebase/config';

// Get the screen dimensions
const {width, height} = Dimensions.get("window");

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

    // Convert the username to lowercase and trim it
    const lowerCaseUsername = username.toLowerCase().trim();

    // Create a reference to the 'users' node in the database
    const usersRef = ref(db, 'users/');

    // Use the get() method to retrieve the data at the reference
    get(usersRef)
        .then((snapshot) => {
            if (snapshot.exists()) { // if snapshot exists, users exist
                let userExists = false;
                snapshot.forEach((childSnapshot) => {
                    const dbEmail = childSnapshot.val().email;
                    const dbUsername = childSnapshot.val().user_name;
                    if (dbEmail && dbUsername) {
                        const lowerDbEmail = dbEmail.toLowerCase().trim().replace(',', '.');
                        const lowerDbUsername = dbUsername.toLowerCase().trim();
                        if (lowerDbEmail === lowerCaseEmail && lowerDbUsername === lowerCaseUsername) {
                            // Navigate to the 'Reset' screen with the user_id
                            navigation.navigate('Reset', { user_id: childSnapshot.key, email: emailKey });
                            userExists = true;
                            return true; // Stop looping through the snapshot
                        }
                    }
                });
                if (!userExists) {
                    setMessage('Email or Username does not match');
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
            <Text style={styles.forgotMessage}>Please enter the username/email associated with your account</Text>
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
    forgotMessage: {
        textAlign: 'center',
        fontSize: 14,
    },
});

export default ForgotPassword;