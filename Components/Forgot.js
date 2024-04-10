import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';

function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const resetSubmit = () => {
        if (email === '') {
            setMessage('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setMessage('Email is not valid');
            return;
        }

        // Simulate a request to the server to send a password reset email
        setTimeout(() => {
            setMessage(`Email sent to ${email}`);
            navigation.navigate('Reset');
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Text>Please enter the email associated with your account</Text>
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