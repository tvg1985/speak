import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue, remove, push, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { UserIdContext } from './UserIdContext'; // Assuming you have a UserIdContext that provides the logged-in user

const SettingsScreen = () => {
  const {userId, userRole, userName} = useContext(UserIdContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [dependents, setDependents] = useState([]);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [newDependent, setNewDependent] = useState({ email: '', password: '', confirmPassword: '', user_name: '' });
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const dependentsRef = ref(db, 'users');
    const handleData = snap => {
      if (snap.val()) {
        const dependentsData = Object.values(snap.val()).filter(user => user.parent_id === userId);
        setDependents(dependentsData);
      }
    };
    onValue(dependentsRef, handleData, { onlyOnce: true });
  }, []);

  const handleAddDependent = () => {
    // Add new dependent to Firebase Realtime Database
    const db = getDatabase();
    const newDependentRef = push(ref(db, 'users'));
    set(newDependentRef, { ...newDependent, parent_id: userId, role: 'child' });
    setModalVisible(false);
    setNewDependent({ email: '', password: '', confirmPassword: '', user_name: '' });
  };

  const handleDeleteDependent = () => {
    // Delete selected dependent from Firebase Realtime Database
    const db = getDatabase();
    const dependentRef = ref(db, 'users/' + selectedDependent.id);
    remove(dependentRef);
    setSelectedDependent(null);
  };

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => navigation.goBack()} />
      <Button title="Logout" onPress={() => { /* Add logout functionality here */ }} />
      <Text style={styles.header}>{userName.toUpperCase()}</Text>
      <Text style={styles.role}>Role: {userRole}</Text>
      <Text style={styles.subsectionHeader}>Dependents</Text>
      {dependents.length > 0 ? (
        <FlatList
          data={dependents}
          renderItem={({ item }) => (
            <View style={styles.dependentContainer}>
              <Text style={styles.dependentName}>{item.user_name}</Text>
              <Button title="Delete" onPress={() => setSelectedDependent(item)} />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noDependentsText}>You have no dependent accounts</Text>
      )}
      <Button title="Add" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible}>
        <TextInput placeholder="Email" value={newDependent.email} onChangeText={(text) => setNewDependent({ ...newDependent, email: text })} />
        <TextInput placeholder="Password" value={newDependent.password} onChangeText={(text) => setNewDependent({ ...newDependent, password: text })} />
        <TextInput placeholder="Confirm Password" value={newDependent.confirmPassword} onChangeText={(text) => setNewDependent({ ...newDependent, confirmPassword: text })} />
        <TextInput placeholder="User Name" value={newDependent.user_name} onChangeText={(text) => setNewDependent({ ...newDependent, user_name: text })} />
        <Button title="Add" onPress={handleAddDependent} />
        <Button title="Cancel" onPress={() => setModalVisible(false)} />
      </Modal>
      {selectedDependent && (
        <Modal visible={true}>
          <Text>Are you sure you want to delete this user?</Text>
          <Button title="Yes" onPress={handleDeleteDependent} />
          <Button title="No" onPress={() => setSelectedDependent(null)} />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  role: {
    fontSize: 18,
    marginBottom: 16,
  },
  subsectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dependentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#bbb',
  },
  dependentName: {
    fontSize: 16,
  },
  noDependentsText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default SettingsScreen;