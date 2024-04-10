import React, { useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput } from 'react-native';

function Register({ navigation }) {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
    });
    const [errors, setErrors] = useState({});

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

    const register = () => {
    if (validateForm()) {
        fetch(' http://10.0.2.2:8082/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        })
            .then(response => response.json())
            .then(data => {
                // If registration is successful, navigate to the Login screen
                if (data.success) {
                    navigation.navigate('Login');
                } else {
                    // Handle registration failure here
                    console.error('Registration failed:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                console.log('Form:', form);
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