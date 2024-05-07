import React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';

function StorybookScreen({navigation}) {
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
        marginTop: 20,
    },
    // Add other styles as needed
});

export default StorybookScreen;