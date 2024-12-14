
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TermsModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.title}>Términos y Condiciones</Text>
            <Text style={styles.text}>
              Este desarrollo es parte del proceso de finalización de nuestra carrera en Ingeniería en Informática en Duoc UC, sede San Bernardo. Todos los datos manejados por la aplicación están protegidos por Firebase.
              {'\n\n'}
              Todos los datos personales y transacciones se almacenan de manera segura y cifrada, garantizando la privacidad de los usuarios. La app es un proyecto final que tiene como objetivo demostrar el uso de tecnologías modernas en el desarrollo de aplicaciones móviles y la gestión de datos.
              {'\n\n'}
              Al continuar usando esta aplicación, el usuario acepta que sus datos sean procesados de acuerdo con los términos mencionados y que la app puede recolectar información relacionada con el uso para mejorar la experiencia y funcionamiento de la plataforma.
              {'\n\n'}
              Para más detalles, consulte nuestra política de privacidad.
            </Text>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  scrollContainer: {
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#885FD8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default TermsModal;
