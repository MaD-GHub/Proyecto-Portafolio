import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font'; // No olvides importar el módulo de fuentes
import TermsModal from '../components/TermsModal'; // Importa el componente del modal


export default function StartScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false); // Estado para las fuentes cargadas
  const [modalVisible, setModalVisible] = useState(false); 


  // Cargar las fuentes una sola vez
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require('../assets/fonts/ArchivoBlack-Regular.ttf'),
        "QuattrocentoSans-Bold": require('../assets/fonts/QuattrocentoSans-Bold.ttf'),
        "QuattrocentoSans-Regular": require('../assets/fonts/QuattrocentoSans-Regular.ttf'),
        "QuattrocentoSans-Italic": require('../assets/fonts/QuattrocentoSans-Italic.ttf'),
        "QuattrocentoSans-BoldItalic": require('../assets/fonts/QuattrocentoSans-BoldItalic.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  // Mostrar el ActivityIndicator mientras las fuentes están cargando
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#673072" />;
  }

  // Si las fuentes están cargadas, renderizar el contenido de la pantalla
  return (
    <LinearGradient
      colors={['#511496', '#885FD8']}
      style={styles.container}
    >
      <Image
        source={require('../assets/images/Logo_finawise_blanco.png')}
        style={styles.logo}
      />
      <Text className="mb-5" style={{ fontFamily: "QuattrocentoSans-Regular", fontSize: 25, color: "white"}}>Bienvenid@!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonOutline}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonTextOutline}>Crear Cuenta</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setModalVisible(true)} // Mostrar el modal cuando el usuario toque el enlace
      >
        <Text className="mb-5 top-32 bottom-0" style={{ fontFamily: "QuattrocentoSans-Bold", fontSize: 18, color: "white", textDecorationLine: 'underline' }}>
          Términos y condiciones.
        </Text>
      </TouchableOpacity>

      <TermsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} // Cerrar el modal
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#8f539b',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 124,
    marginBottom: 180,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontFamily: 'QuattrocentoSans-Bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
    shadowRadius: 80,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: 1
  },
  buttonText: {
    color: '#8f539b',
    fontSize: 16,
    fontFamily: 'QuattrocentoSans-Bold',
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonTextOutline: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'QuattrocentoSans-Bold',
  },
});
