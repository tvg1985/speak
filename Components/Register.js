import React, {useState, useEffect} from 'react';
import {Dimensions, Button, StyleSheet, Text, View, TextInput, Alert} from 'react-native';
import {db} from '../Firebase/config';
import {ref, set, get} from "firebase/database";
import * as Crypto from 'expo-crypto';
import {v4 as uuid} from 'uuid';
import * as Random from 'expo-random';
import {v4 as uuidv4} from 'uuid';
import CryptoJS from 'crypto-js';
const {width, height} = Dimensions.get("window");



function Register({navigation}) {
    console.log('Register function called');
    const [form, setForm] = useState({
        user_name: '',
        password: '',
        confirmPassword: '',
        email: '',
        role: 'parent',
        parent_id: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({
                user_name: '',
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

        if (form.user_name === '') {
            tempErrors.user_name = 'Username is required';
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
        console.log('Testing uuidv4 function:', uuidv4());
        console.log('register function called');
        console.log('form:', form);
        console.log('errors:', errors);

        if (validateForm()) {
            console.log('Form is valid');
            const user_id = uuidv4();
            console.log('UUID test:', uuidv4()); // Test the uuidv4 function
            console.log('Before logging user_id'); // Check if this log is reached
            console.log('User ID:', user_id); // Log user_id
            // Replace '.' with ',' in the email
            const emailKey = form.email.replace(/\./g, ',');

            // Create a reference to the 'users' node in the database
            const usersRef = ref(db, 'users/' + user_id);

            // Changes here
            try {
                const snapshot = await get(usersRef);
                if (snapshot.exists()) {
                    console.log('User already exists');
                    // If user already exists, set error message and provide suggestions
                    setErrors({
                        user_name: 'Username already exists',
                        suggestions: [
                            form.user_name.toLowerCase() + '1',
                            form.user_name.toLowerCase() + '2',
                            form.user_name.toLowerCase() + '3',
                        ],
                    });
                } else {
                    console.log('User does not exist, creating new user');
                    // If user does not exist, create new user
                    try {
                        const hashedPassword = await CryptoJS.SHA256(form.password).toString();
                        console.log('Hashed password:', hashedPassword);
                        console.log('Starting Firebase operation');
                        set(usersRef, {
                            user_name: form.user_name.toLowerCase(),
                            password: hashedPassword,
                            email: emailKey, // Store the modified email in the database
                            role: form.role,
                            parent_id: form.parent_id,
                        }).then(() => {
                            console.log('User created successfully');
                            Alert.alert("You are successfully registered");
                            console.log('Navigating to Login');
                            navigation.navigate('Login');
                        }).catch((error) => {
                            console.error('Error creating user:', error);
                        });
                    } catch (error) {
                        console.error('Error hashing password:', error);
                    }
                }
            } catch (error) {
                console.error('Error getting user:', error);
            }
        } else {
            console.log('Form is not valid');
        }
    }
    const formFields = [
        {name: 'user_name', placeholder: 'Username'},
        {name: 'password', placeholder: 'Password', secureTextEntry: true},
        {name: 'confirmPassword', placeholder: 'Confirm Password', secureTextEntry: true},
        {name: 'email', placeholder: 'Email'},
    ];


    return (
        <View style={styles.container}>
            {formFields.map((field, index) => (
                <TextInput
                    key={index}
                    style={styles.input}
                    value={form[field.name]}
                    onChangeText={value => setForm({...form, [field.name]: value})}
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
        paddingLeft: 15,
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