import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Animated, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase'; // Importar Firebase auth y Firestore
import { useNavigation } from '@react-navigation/native'; // Para navegación después de logout
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; // Importar las funciones correctas de Firestore
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Para actualizar correo y contraseña

// Función para formatear a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const ProfileScreen = ({ route }) => {
  const { totalSaved = 0 } = route.params || {}; // Recibe el saldo desde los params
  const navigation = useNavigation(); // Para navegación después de logout

  // Estado para almacenar datos del usuario
  const [userName, setUserName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [salary, setSalary] = useState(''); // Para cambiar el sueldo del usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña actual ingresada
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]); // Estado para almacenar las transacciones del usuario

  // Nuevos estados para almacenar las actualizaciones de seguridad
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // Contraseña actual para reautenticación

  const [modalVisible, setModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);

  const slideAnim = useState(new Animated.Value(600))[0]; // Animación para ambos labels
  const mesesUso = '12 meses';
  
  let unsubscribe = null;
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.firstName);
            setFirstLastName(userData.lastName);
            setSalary(userData.salary || '');
            setEmail(user.email);
            setNewEmail(user.email);
            setNewPassword('');
            setProfileImage(userData.profileImage || null); // Asigna una imagen predeterminada si no hay
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
    if (user && currentPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch (error) {
        console.error('Error en la reautenticación:', error);
        Alert.alert('Error', 'Contraseña actual incorrecta. Por favor, inténtalo nuevamente.');
        return false;
      }
    } else {
      Alert.alert('Error', 'Por favor, ingresa tu contraseña actual para cambiar la información de seguridad.');
      return false;
    }
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

  // Función para actualizar la información personal del usuario (nombre, apellido y salario)
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          firstName: userName,
          lastName: firstLastName,
          salary: salary, // Guardamos el salario actualizado
        });
        Alert.alert('Éxito', 'La información personal ha sido actualizada correctamente.');
        closeModal();
      }
    } catch (error) {
      console.error('Error al actualizar la información personal:', error);
      Alert.alert('Error', `Error al actualizar la información personal: ${error.message}`);
    }
  };

  const calculateTotalSaved = () => {
    const ingresos = transactions
      .filter((transaction) => transaction.type === "Ingreso")
      .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

    const gastos = transactions
      .filter((transaction) => transaction.type === "Egreso")
      .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);

    return ingresos - gastos;
  };


  const [profileImage, setProfileImage] = useState(null); // Para la imagen de perfil

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas otorgar permisos para acceder a la galería.');
      return;
    }
  
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Imagen cuadrada
        quality: 1,
      });
  
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri); // Actualizamos la imagen en el estado
        await uploadProfileImage(uri); // Sube la imagen y actualiza Firestore
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };
  
  
  const uploadProfileImage = async (uri) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
  
      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);
  
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: downloadURL,
      });
  
      Alert.alert('Éxito', 'Tu foto de perfil ha sido actualizada.');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil.');
    }
  };
  
  

  // Función para cerrar sesión con confirmación
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              if (unsubscribe) {
                unsubscribe(); // Detenemos el listener cuando el usuario cierra sesión
              }
              await auth.signOut(); // Cierra sesión en Firebase Auth
              navigation.replace('StartScreen'); // Navegar a la pantalla de inicio de sesión
            } catch (error) {
              console.error("Error al cerrar sesión: ", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={30} color="white" />
      </TouchableOpacity>

    {/* Profile Info con encabezado degradado */}
    <LinearGradient
      colors={['#6A0DAD', '#511496', '#885fd8']} // Degradado de morados
      style={styles.profileSection}
    >
      <TouchableOpacity
        onPress={handlePickImage}
        activeOpacity={0.8} // Reduce la opacidad al presionar
      >
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/profile-picture.png')}
          style={styles.profileImage}
        />
        <MaterialCommunityIcons name="camera" size={24} color="#fff" style={styles.cameraIcon} />
      </TouchableOpacity>
      <Text style={styles.profileName}>{userName} {firstLastName}</Text>
      <Text style={styles.profileEmail}>{email}</Text>
    </LinearGradient>


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
          <MaterialCommunityIcons name="logout" size={24} color="#FF6347" />
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
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                style={styles.input}
                placeholder="Escribe tu nuevo nombre"
              />
              <Text style={styles.inputLabel}>Apellido</Text>
              <TextInput
                value={firstLastName}
                onChangeText={setFirstLastName}
                style={styles.input}
                placeholder="Escribe tu apellido"
              />
              <Text style={styles.inputLabel}>Sueldo</Text>
              <TextInput
                value={salary}
                onChangeText={setSalary}
                style={styles.input}
                placeholder="Cambia tu sueldo"
                keyboardType="numeric"
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
                <Text style={styles.securityDataText}>Correo actual: {email}</Text>
              </LinearGradient>
              <Text style={styles.inputLabel}>Contraseña actual</Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
                secureTextEntry
                placeholder="Ingresa tu contraseña actual"
              />
              <Text style={styles.inputLabel}>Nuevo correo</Text>
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                style={styles.input}
                placeholder="Cambia tu correo"
              />
              <Text style={styles.inputLabel}>Nueva contraseña</Text>
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
  backgroundColor: '#f4f4f8',
},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Esto añade sombra en Android
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40, // Hacer la imagen completamente redonda
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 3, // Sombra para destacar
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10, // Espacio entre la imagen y el nombre
  },
  profileEmail: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 5, // Espacio entre el nombre y el correo
  },
  
  optionsSection: {
    marginHorizontal: 20,
    marginTop: 30, // Más espacio entre el encabezado y los botones
  },
optionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 15,
  paddingHorizontal: 10,
  marginBottom: 10,
  borderRadius: 10,
  backgroundColor: '#f9f9f9',
  elevation: 1, // Para un ligero efecto de elevación
},
optionText: {
  fontSize: 16,
  marginLeft: 20,
  color: '#333',
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
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    alignSelf: 'flex-start',
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
  profileImageContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 15,
  backgroundColor: '#fff',
  borderRadius: 50,
  overflow: 'hidden',
  elevation: 3, // Sombra para destacar
},
profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
},
profileEmail: {
  color: '#aaa',
  fontSize: 14,
  marginTop: 5,
},
cameraIcon: {
  position: 'absolute',
  bottom: 10, // Ajusta según tu diseño
  right: 10,  // Ajusta según tu diseño
  backgroundColor: '#511496',
  borderRadius: 12,
  padding: 4,
  elevation: 5,
},

});

export default ProfileScreen;