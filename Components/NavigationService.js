import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import Login from "./Login";
import Register from "./Register";
import Forgot from "./Forgot";
import Reset from "./Reset";

const Stack = createStackNavigator();

export default function NavigationService() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Home" component={HomeScreen}/>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="Register" component={Register}/>
                <Stack.Screen name="Forgot" component={Forgot}/>
                <Stack.Screen name="Reset" component={Reset}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}