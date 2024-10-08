import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Animated, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase'; // Importar Firebase auth y Firestore
import { useNavigation } from '@react-navigation/native'; // Para navegación después de logout
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Para obtener y actualizar los datos del usuario
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Para actualizar correo y contraseña

const ProfileScreen = ({ route }) => {
  const { totalSaved = 0 } = route.params || {};
  const navigation = useNavigation(); // Para navegación después de logout

  // Estado para almacenar datos del usuario
  const [userName, setUserName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [phone, setPhone] = useState('Sin teléfono');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('********'); // No se obtiene directamente de Firebase
  const [isLoading, setIsLoading] = useState(true);

  // Nuevos estados para almacenar las actualizaciones de seguridad
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);

  const slideAnim = useState(new Animated.Value(600))[0]; // Animación para ambos labels
  const mesesUso = '12 meses';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid)); // Obtenemos los datos del usuario desde Firestore
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.firstName);
            setFirstLastName(userData.lastName);
            setEmail(user.email);
            setPhone(userData.phone || 'Sin teléfono');
            setNewEmail(user.email); // Inicializamos el nuevo correo con el actual
            setNewPassword(''); // Inicializamos la nueva contraseña en blanco
          }
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const openSecurityModal = () => {
    setSecurityModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSecurityModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSecurityModalVisible(false);
    });
  };

  // Función para reautenticar al usuario
  const reauthenticate = async () => {
    const user = auth.currentUser;
    if (user && password) {
      const credential = EmailAuthProvider.credential(user.email, password);
      try {
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        console.error('Error en la reautenticación:', error);
        Alert.alert('Error', 'Hubo un problema con la reautenticación. Por favor, inténtalo nuevamente.');
        return false;
      }
    }
    return false;
  };

  // Función para actualizar la seguridad del usuario (correo y contraseña)
  const handleSaveSecurity = async () => {
    const user = auth.currentUser;

    // Reautenticar al usuario antes de hacer cambios críticos
    const reauthSuccess = await reauthenticate();
    if (!reauthSuccess) return;

    try {
      // Actualizar el correo si ha cambiado
      if (newEmail !== email) {
        await updateEmail(user, newEmail);
        await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
      }

      // Actualizar la contraseña si se ingresó una nueva
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      Alert.alert('Éxito', 'La información de seguridad ha sido actualizada correctamente.');
      closeSecurityModal();
    } catch (error) {
      console.error('Error al actualizar la seguridad:', error);
      Alert.alert('Error', `Error al actualizar la seguridad: ${error.message}`);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.replace('StartScreen'); // Navegar a la pantalla de inicio de sesión o pantalla inicial después del logout
      })
      .catch(error => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#511496" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          source={require('../assets/profile-picture.png')}
          style={styles.profileImage}
        />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{userName} {firstLastName} {secondLastName}</Text>
        </View>
      </View>

      {/* Saldo y Meses en una línea */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceText}>{totalSaved.toString()}</Text> 
          <Text style={styles.balanceLabel}>Saldo</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceText}>{mesesUso}</Text>
          <Text style={styles.balanceLabel}>Meses</Text>
        </View>
      </View>

      {/* Opciones de navegación */}
      <View style={styles.optionsSection}>
        <TouchableOpacity style={styles.optionItem} onPress={openModal}>
          <MaterialCommunityIcons name="account" size={24} color="#885fd8" />
          <Text style={styles.optionText}>Información personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionItem} onPress={openSecurityModal}>
          <MaterialCommunityIcons name="lock" size={24} color="#885fd8" />
          <Text style={styles.optionText}>Seguridad</Text>
        </TouchableOpacity>
        <View style={styles.optionItem}>
          <MaterialCommunityIcons name="file-document" size={24} color="#885fd8" />
          <Text style={styles.optionText}>Términos y Condiciones</Text>
        </View>
        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#885fd8" />
          <Text style={styles.optionText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para editar la información personal */}
      <Modal
        transparent={true}
        visible={modalVisible || securityModalVisible}
        animationType="none"
        onRequestClose={modalVisible ? closeModal : closeSecurityModal}
      >
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          {modalVisible && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Información Personal</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                style={styles.input}
                placeholder="Escribe tu nuevo nombre"
              />
              <TextInput
                value={firstLastName}
                onChangeText={setFirstLastName}
                style={styles.input}
                placeholder="Escribe tu primer apellido"
              />
              <TextInput
                value={secondLastName}
                onChangeText={setSecondLastName}
                style={styles.input}
                placeholder="Escribe tu segundo apellido"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {securityModalVisible && (
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#511496', '#885fd8']} // Degradado morado
                style={styles.securityHeader} // Aplicar estilo a la sección de seguridad
              >
                <Text style={styles.securityHeaderText}>Seguridad del usuario</Text>
                <Text style={styles.securityDataText}>Correo: {email}</Text>
                <Text style={styles.securityDataText}>Teléfono: {phone}</Text>
                <Text style={styles.securityDataText}>Contraseña: {password}</Text>
              </LinearGradient>
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                style={styles.input}
                placeholder="Cambia tu correo"
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                secureTextEntry
                placeholder="Cambia tu contraseña"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSecurity}>
                  <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={closeSecurityModal}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#511496',
    marginTop: 0,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileTextContainer: {
    marginLeft: 20,
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#511496',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'black',
    marginHorizontal: 10,
  },
  optionsSection: {
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
    color: '#885fd8',
    fontWeight: 'bold',
  },
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
  },
  securityHeader: {
    padding: 20,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  securityHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  securityDataText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ProfileScreen;
