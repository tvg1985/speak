import React, {useState} from 'react';
import {Dimensions, Button, StyleSheet, Text, View, TextInput} from 'react-native';
import {get, ref, set, update} from 'firebase/database';
import {db} from '../Firebase/config';
import * as Crypto from 'expo-crypto';

const {width, height} = Dimensions.get("window");

function ResetPassword({route, navigation}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


const resetPassword = async () => {
    const { user_id } = route.params;

    // Create a reference to the user in the database using the user_id
    const userRef = ref(db, 'users/' + user_id);


    get(userRef)
        .then(async (snapshot) => {
            if (snapshot.exists()) {
                const dbUsername = snapshot.val().user_name;
                if (dbUsername && dbUsername.toLowerCase().trim() === userName.toLowerCase().trim()) {
                    if (password === '' || confirmPassword === '') {
                        setErrorMessage('Password is required');
                        return;
                    }

                    if (password !== confirmPassword) {
                        setErrorMessage('Passwords do not match');
                        return;
                    }

                    // Hash the entered password
                    const hashedPassword = await Crypto.digestStringAsync(
                        Crypto.CryptoDigestAlgorithm.SHA256,
                        password
                    );

                    // Compare the hashed password with the one in the database
                    if (snapshot.val().password === hashedPassword) {
                        // If the passwords match, show an error message
                        setErrorMessage('Please use a new password you have not used previously');
                    } else {
                        // If the passwords don't match, hash the new password and set it in the database
                        const newHashedPassword = await Crypto.digestStringAsync(
                            Crypto.CryptoDigestAlgorithm.SHA256,
                            password
                        );
                        update(userRef, {password: newHashedPassword})
                            .then(() => {
                                // Show an alert that the password has been changed
                                alert('Password successfully changed');

                                // Flush user_id
                                route.params.user_id = null;

                                // Navigate to the 'Login' screen
                                navigation.navigate('Login');
                            })
                            .catch((error) => {
                                console.error("Error updating password: ", error);
                            });
                    }
                } else {
                    setErrorMessage('Invalid username');
                }
            } else {
                setErrorMessage('Invalid user ID');
            }
        })
        .catch((error) => {
            console.error("Error checking user: ", error);
        });
};
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter Username associated with account"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="New Password"
                secureTextEntry={true}
            />
            <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                secureTextEntry={true}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <View style={styles.buttonContainer}>
                <Button
                    title="Submit"
                    onPress={resetPassword}
                    color="green"
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
    error: {
        color: 'red',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '40%',
    },
});

export default ResetPassword;