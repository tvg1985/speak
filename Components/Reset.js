import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';

function ResetPassword() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const resetSubmit = async () => {
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            // This is a placeholder. Replace this with your actual function to reset the password in your database.
            await resetPassword(code, password);
        } catch (error) {
            setErrorMessage(error.message);
            return;
        }

        // Navigate to the login screen (or wherever you want to go after successfully resetting the password)
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Enter Code"
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
                    onPress={resetSubmit}
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