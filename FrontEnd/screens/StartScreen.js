import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font'; // No olvides importar el módulo de fuentes

export default function StartScreen() {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false); // Estado para las fuentes cargadas
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal

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

      {/* Botón para abrir el modal */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
      >
        <Text className="mb-5 top-32 bottom-0" style={{ fontFamily: "QuattrocentoSans-Bold", fontSize: 18, color: "white", textDecorationLine: 'underline'}}>Términos y condiciones</Text>
      </TouchableOpacity>

      {/* Modal con los términos y condiciones */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>Términos y Condiciones</Text>
              <Text style={styles.modalText}>
                Esta aplicación, FinaWise, está actualmente en desarrollo y forma parte del proyecto final para la carrera de Ingeniería en Informática del Instituto Profesional DUOC UC, sede San Bernardo, Chile. 
              </Text>
              <Text style={styles.modalText}>
                El propósito de esta app es ayudar a los usuarios a gestionar sus finanzas personales mediante el registro de ingresos, egresos y la generación de reportes financieros. 
              </Text>
              <Text style={styles.modalText}>
                Es importante señalar que la app no está completamente finalizada, ya que aún se encuentra en fase de desarrollo. Los datos ingresados por los usuarios no serán compartidos con terceros y su manejo es estrictamente académico.
              </Text>
              <Text style={styles.modalText}>
                Como parte del proceso de desarrollo, se recopilarán comentarios y sugerencias para mejorar las funcionalidades. Actualmente, faltan algunas implementaciones y ajustes, que serán abordados en la etapa final de la presentación del proyecto.
              </Text>
              <Text style={styles.modalText}>
                Al utilizar esta aplicación, aceptas que está en una etapa preliminar y que puede contener errores o funcionalidades no operativas. Los desarrolladores no se hacen responsables por cualquier inconveniente derivado del uso de la aplicación en su estado actual.
              </Text>
              <Text style={styles.modalText}>
                Gracias por participar en este proyecto académico. Tu uso y retroalimentación son esenciales para la mejora de la aplicación antes de su presentación final.
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    width: 140,
    height: 124,
    marginBottom: 180,
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
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalContent: {
    maxHeight: 400,
  },
  modalTitle: {
    fontFamily: 'QuattrocentoSans-Bold',
    fontSize: 22,
    color: '#511496',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontFamily: 'QuattrocentoSans-Regular',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'justify',
  },
  closeButton: {
    backgroundColor: '#511496',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'QuattrocentoSans-Bold',
  },
});
