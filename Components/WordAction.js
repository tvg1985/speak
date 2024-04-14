import React from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import {UserIdContext} from "./UserIdContext";

const { width, height } = Dimensions.get('window');

function WordAction({ navigation }) {
    const { userId } = React.useContext(UserIdContext);

    console.log('userId:', userId);

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <Button
                    title="Home"
                    onPress={() => navigation.navigate('Home')}
                    color="green"
                />
                <Button
                    title="Settings"
                    onPress={() => {
                        // settings function here
                    }}
                    color="green"
                />
            </View>
            <View style={styles.subsectionsContainer}>
                <View style={styles.subsection}>
                    <Text style={styles.header}>Word Actions:</Text>
                    <Button
                        title="Add"
                        onPress={() => {
                            // add function here
                        }}
                        color="blue"
                    />
                </View>
                <View style={styles.subsection}>
                    <Text style={styles.header}>Categories:</Text>
                    <Button
                        title="Add"
                        onPress={() => {
                            // add function here
                        }}
                        color="blue"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    subsectionsContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginTop: 60,
    },
    subsection: {
        width: width * 0.8, // 80% of screen width
        alignItems: 'center',
        marginVertical: 10,
        borderColor: '#d3d3d3', // added border color
        borderWidth: 1, // added border width
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default WordAction;