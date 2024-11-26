// src/screens/SugerenciasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import registerActivity from "../components/RegisterActivity";


const SugerenciasScreen = () => {
  const navigation = useNavigation();
  const [sugerencia, setSugerencia] = useState('');
  const [loading, setLoading] = useState(false);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "SugerenciasScreen",
        description: 'Usuario visita la página para enviar sugerencias.', 
        });
    }
  }, []);

  // Función para manejar la creación de una sugerencia
  const handleEnviarSugerencia = async () => {
    if (!sugerencia.trim()) {
      Alert.alert("Error", "Por favor, escribe una sugerencia antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'suggestions'), {
          userId: user.uid,
          userName: user.displayName || "Usuario",
          suggestion: sugerencia,
          createdAt: Timestamp.fromDate(new Date())
        });
        Alert.alert("Gracias", "Tu sugerencia ha sido enviada correctamente.");
        setSugerencia('');
      }
    } catch (error) {
      console.error("Error al enviar sugerencia:", error);
      Alert.alert("Error", "Hubo un problema al enviar tu sugerencia. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={30} color="#885fd8" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Enviar Sugerencia</Text>

      {/* Texto introductorio */}
      <Text style={styles.description}>
        En esta sección puedes enviarnos tus sugerencias para ayudarnos a mejorar la aplicación.
        Tu opinión es valiosa, ya sea para reportar errores, proponer mejoras o brindar retroalimentación.
      </Text>

      {/* Entrada de sugerencias */}
      <TextInput
        style={styles.input}
        placeholder="Escribe tu sugerencia aquí..."
        placeholderTextColor="#aaa"
        multiline
        value={sugerencia}
        onChangeText={setSugerencia}
      />

      {/* Botón para enviar sugerencia o indicador de carga */}
      {loading ? (
        <ActivityIndicator size="large" color="#511496" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleEnviarSugerencia}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 90,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    height: 250,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#885fd8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SugerenciasScreen;
