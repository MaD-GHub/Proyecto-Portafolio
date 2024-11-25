import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebase';  
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';  
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';  
import { FontAwesome5 } from '@expo/vector-icons';  

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal
  const [resetEmail, setResetEmail] = useState(''); // Correo ingresado en el modal
  const navigation = useNavigation();

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa ambos campos');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user.uid);  
      navigation.navigate('HomeTabs');
    } catch (error) {
      Alert.alert('Error', error.message);  
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el restablecimiento de contraseña
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico para restablecer tu contraseña.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert(
        'Correo enviado',
        'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.'
      );
      setModalVisible(false); // Cerrar el modal después de enviar el correo
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al enviar el correo. Verifica tu correo electrónico.');
      console.error(error.message);
    }
  };

  // Cargar las fuentes
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Aventra-Extrabold': require('../assets/fonts/Fontspring-DEMO-aventra-extrabold.otf'),
        'Aventra-Regular': require('../assets/fonts/Fontspring-DEMO-aventra-regular.otf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#511496', '#885FD8']} style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/Logo_finawise_blanco_shadowpurple.png')}
            style={styles.logo}
          />
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('StartScreen')}>
          <FontAwesome5 name="angle-left" size={24} color="#fff"/>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text className="pb-5 text-3xl text-center" style={styles.welcomeText}>Bienvenido</Text>
        <Text className="pb-1 pt-3 pl-2 text-sm text-left" style={styles.labelCorreo}>Correo electronico</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electronico"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="pb-1 pt-3 pl-2 text-sm text-left" style={styles.labelCorreo}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Abrir el modal al presionar */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text className="" style={styles.forgotPassword}>¿Olvidaste tu Contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <LinearGradient colors={['#511496', '#885FD8']} style={styles.loginButton}>
            <Text className="text-white px-4" style={styles.fuenteAv}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="" style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para restablecer contraseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restablecer Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor="#aaa"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
              <LinearGradient colors={['#511496', '#885FD8']} style={styles.resetButton}>
                <Text style={styles.buttonText}>Enviar correo</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
    justifyContent: 'flex-start',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  logo: {
    width: 140,
    height: 140,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 21,
  },
  fuenteAv: {
    fontFamily: 'Aventra-Regular',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 36,
    fontFamily: 'Aventra-Extrabold',
    marginTop: 10,
    color: '#511496',
    textAlign: 'center',
  },
  labelCorreo: {
    fontFamily: 'Aventra-Regular',
    color: '#511496',
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: 'center',
    marginTop: -50,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  forgotPassword: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#511496',
  },
  loginButton: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 0,
    color: 'white',
  },
  registerLink: {
    textAlign: 'center',
    color: '#511496',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#511496',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resetButton: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    color: '#511496',
    textDecorationLine: 'underline',
  },
});
