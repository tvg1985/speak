import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Modal, TextInput } from 'react-native';
import {UserIdContext} from "./UserIdContext";

const { width, height } = Dimensions.get('window');

function WordAction({ navigation }) {
    const { userId } = React.useContext(UserIdContext);

    const [modalVisible, setModalVisible] = useState(false);
    const [photoName, setPhotoName] = useState('');
    const [photo, setPhoto] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [audioFile, setAudioFile] = useState('');

    const addAction = () => {
        // Handle the form submission here
        // For example, make an API call to add a new photo

        // Close the modal
        setModalVisible(false);
    };

    const actionCancel = () => {
        // Clear the form
        setPhotoName('');
        setPhoto('');
        setCategoryId('');
        setAudioFile('');

        // Close the modal
        setModalVisible(false);
    };

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
                        title="Add Action"
                        onPress={() => setModalVisible(true)}
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={actionCancel}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            value={photoName}
                            onChangeText={setPhotoName}
                            placeholder="Photo Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={photo}
                            onChangeText={setPhoto}
                            placeholder="Photo"
                        />
                        <TextInput
                            style={styles.input}
                            value={categoryId}
                            onChangeText={setCategoryId}
                            placeholder="Category ID"
                        />
                        <TextInput
                            style={styles.input}
                            value={audioFile}
                            onChangeText={setAudioFile}
                            placeholder="Audio File"
                        />
                        <Button
                            title="Add"
                            onPress={addAction}
                            color="blue"
                        />
                        <Button
                            title="Cancel"
                            onPress={actionCancel}
                            color="red"
                        />
                    </View>
                </View>
            </Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
});

export default WordAction;