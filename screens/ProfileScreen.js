import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('Adrian Torres'); // Estado inicial del nombre de usuario
  const [newUserName, setNewUserName] = useState(userName); // Estado para almacenar el nuevo nombre temporalmente

  const handleEditName = () => {
    setUserName(newUserName); // Actualiza el nombre de usuario
    setModalVisible(false);   // Cierra el modal
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          source={require('../assets/profile-picture.png')} // Cambia esta ruta si es necesario
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userName}</Text>
        <TouchableOpacity style={styles.editIcon} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="pencil" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="account" size={24} color="#8f539b" />
          <Text style={styles.optionText}>Información personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="email" size={24} color="#8f539b" />
          <Text style={styles.optionText}>Celular, correo y dirección</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="lock" size={24} color="#8f539b" />
          <Text style={styles.optionText}>Seguridad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="file-document" size={24} color="#8f539b" />
          <Text style={styles.optionText}>Términos y Condiciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem}>
          <MaterialCommunityIcons name="logout" size={24} color="#8f539b" />
          <Text style={styles.optionText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para editar el nombre */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nombre</Text>
            <TextInput
              value={newUserName}
              onChangeText={setNewUserName}
              style={styles.input}
              placeholder="Escribe tu nuevo nombre"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditName}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8f539b',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  profileSection: {
    backgroundColor: '#8f539b',
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  editIcon: {
    position: 'absolute',
    right: 30,
    top: 40,
    backgroundColor: '#8f539b',
    padding: 8,
    borderRadius: 20,
  },
  optionsSection: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 20,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileScreen;
