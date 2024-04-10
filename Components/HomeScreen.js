import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View, Image} from 'react-native'; // Im
import Login from "./Login";
import React from 'react';

function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
        <Text>Home Screen</Text>
        <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
        />
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
});

export default HomeScreen;