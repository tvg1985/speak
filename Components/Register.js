import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { db } from '../Firebase/config';
import { ref, set, get } from "firebase/database";
import * as Crypto from 'expo-crypto';


function Register({ navigation }) {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        role: 'parent',
        parent_ID: null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
            });
            setErrors({});
        });

        return unsubscribe;
    }, [navigation]);

    const validateForm = () => {
        let tempErrors = {};

        if (form.username === '') {
            tempErrors.username = 'Username is required';
        }

        if (form.password === '') {
            tempErrors.password = 'Password is required';
        }

        if (form.password.length < 8) {
            tempErrors.password = 'Password must be at least 8 characters';
        }

        if (!/[A-Z]/.test(form.password) && !/[!@#$%^&*]/.test(form.password)) {
            tempErrors.password = 'Password must contain at least one capital letter\nand at least one special character';
        }

        if (form.password !== form.confirmPassword) {
            tempErrors.confirmPassword = 'Passwords do not match';
        }

        if (form.email === '') {
            tempErrors.email = 'Email is required';
        }

        if (!/\S+@\S+\.\S+/.test(form.email)) {
            tempErrors.email = 'Email is not valid';
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const register = async () => {
    if (validateForm()) {
        // Replace '.' with ',' in the email
        const emailKey = form.email.replace(/\./g, ',');

        const usersRef = ref(db, 'users/' + form.username.toLowerCase());
        get(usersRef).then(async (snapshot) => {
            if (snapshot.exists()) {
                // If user already exists, set error message and provide suggestions
                setErrors({
                    username: 'Username already exists',
                    suggestions: [
                        form.username.toLowerCase() + '1',
                        form.username.toLowerCase() + '2',
                        form.username.toLowerCase() + '3',
                    ],
                });
            } else {
                // If user does not exist, create new user
                const hashedPassword = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    form.password
                );
                set(usersRef, {
                    username: form.username.toLowerCase(),
                    password: hashedPassword,
                    email: emailKey, // Store the modified email in the database
                    role: form.role,
                    parent_ID: form.parent_ID,
                }).then(() => {
                    window.alert("You are successfully registered");
                    navigation.navigate('Login');
                }).catch((error) => {
                    console.error('Error:', error);
                });
            }
        }).catch((error) => {
            console.error('Error:', error);
        });
    }
};
    const formFields = [
        { name: 'username', placeholder: 'Username' },
        { name: 'password', placeholder: 'Password', secureTextEntry: true },
        { name: 'confirmPassword', placeholder: 'Confirm Password', secureTextEntry: true },
        { name: 'email', placeholder: 'Email' },
    ];

    return (
        <View style={styles.container}>
            {formFields.map((field, index) => (
                <TextInput
                    key={index}
                    style={styles.input}
                    value={form[field.name]}
                    onChangeText={value => setForm({ ...form, [field.name]: value })}
                    placeholder={field.placeholder}
                    secureTextEntry={field.secureTextEntry}
                />
            ))}
            {Object.keys(errors).map((key, index) => (
                errors[key] ? <Text key={index} style={styles.error}>{errors[key]}</Text> : null
            ))}
            <View style={styles.buttonContainer}>
                <Button
                    title="Register"
                    onPress={register}
                    color="green"
                />
                <Button
                    title="Cancel"
                    onPress={() => navigation.navigate('Login')}
                    color="red"
                />
            </View>
            <Text style={styles.footnote}>
                Only Parents or Guardians can sign up for this application. After initial sign up they may add
                dependents to their account.
            </Text>
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
        fontSize: 12,
        alignSelf: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '40%',
    },
    footnote: {
        color: 'red',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default Register;