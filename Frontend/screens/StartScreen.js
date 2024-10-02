import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';

export default function StartScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);  // Definir el estado para fontsLoaded

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "ArchivoBlack-Regular": require("../assets/fonts/ArchivoBlack-Regular.ttf"),
        "QuattrocentoSans-Bold": require("../assets/fonts/QuattrocentoSans-Bold.ttf"),
        "QuattrocentoSans-Regular": require("../assets/fonts/QuattrocentoSans-Regular.ttf"),
        "QuattrocentoSans-Italic": require("../assets/fonts/QuattrocentoSans-Italic.ttf"),
        "QuattrocentoSans-BoldItalic": require("../assets/fonts/QuattrocentoSans-BoldItalic.ttf"),
      });
      setFontsLoaded(true);  // Actualizar el estado cuando las fuentes se carguen
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
      colors={['#8f539b', '#a972c1']}
      style={styles.container}
    >
      <Image
        source={require('../assets/images/Logo_finawise.png')}
        style={styles.logo}
      />
      <Text style={{ fontFamily: "ArchivoBlack-Regular", fontSize: 20, color: "black" }}>Bienvenido a Finawise</Text>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
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
