import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {UserIdContext} from "./UserIdContext";
import HomeScreen from './HomeScreen';
import Login from "./Login";
import Register from "./Register";
import Forgot from "./Forgot";
import Reset from "./Reset";
import WordAction from "./WordAction";
import CategoryScreen from "./CategoryScreen";
import StorybookScreen from "./Storybook";
import StorybookPage from "./StorybookPage";

const Stack = createStackNavigator();

export default function NavigationService() {
    const [userId, setUserId] = React.useState(null);
    return (
        <UserIdContext.Provider value={{userId, setUserId}}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Home" component={HomeScreen}/>
                    <Stack.Screen name="Login" component={Login}/>
                    <Stack.Screen name="Register" component={Register}/>
                    <Stack.Screen name="Forgot" component={Forgot}/>
                    <Stack.Screen name="Reset" component={Reset}/>
                    <Stack.Screen name="WordAction" component={WordAction}/>
                    <Stack.Screen name="CategoryScreen" component={CategoryScreen}/>
                    <Stack.Screen name="Storybook" component={StorybookScreen}/>
                    <Stack.Screen name="StorybookPage" component={StorybookPage}/>
                </Stack.Navigator>
            </NavigationContainer>
        </UserIdContext.Provider>
    );
}