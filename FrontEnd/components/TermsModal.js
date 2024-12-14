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
            1. Introducción
            {'\n\n'}
            Bienvenido a Finawise, una aplicación creada como proyecto académico por estudiantes de Ingeniería en Informática de Duoc UC, sede San Bernardo. Finawise está diseñada para proporcionar herramientas de gestión financiera personal y familiar. Al usar esta aplicación, aceptas los términos y condiciones descritos a continuación.
              {'\n\n'}
              2. Naturaleza del Proyecto
              {'\n\n'}
Finawise es un desarrollo académico y no constituye una herramienta comercial. La aplicación es gratuita, no tiene fines lucrativos y está destinada exclusivamente a propósitos educativos y de demostración técnica.
              {'\n\n'}
              3. Recolección y Uso de Datos
              {'\n\n'}
3.1 Datos Recopilados:
{'\n\n'}
Información personal: nombre, correo electrónico, y salario.
{'\n'}
Transacciones financieras: fechas, montos y categorías.
{'\n'}
Datos de uso: interacción del usuario con la aplicación.
{'\n\n'}
3.2 Uso de los Datos:
{'\n\n'}
Los datos recolectados son utilizados únicamente para proveer las funcionalidades de la aplicación y realizar análisis internos de mejora.
{'\n\n'}
3.3 Almacenamiento y Seguridad:
{'\n\n'}
Los datos son almacenados en Firebase, una plataforma que cumple con altos estándares de seguridad.

La información está protegida mediante cifrado y solo es accesible por los desarrolladores para fines académicos.
{'\n\n'}
4. Obligaciones del Usuario
{'\n\n'}
4.1 Requisitos de Uso:
{'\n\n'}
Proveer información exacta y actualizada al registrarse.

Usar la aplicación únicamente para fines personales y educativos.
{'\n\n'}
4.2 Restricciones:
{'\n\n'}
Está prohibido realizar intentos de acceso no autorizado a la base de datos.

No se permite el uso de la aplicación para actividades ilegales o dañinas.
{'\n\n'}
5. Limitación de Responsabilidad
{'\n\n'}
5.1 Uso de la Información:
{'\n\n'}
Finawise es una herramienta académica y no garantiza precisión absoluta en los análisis financieros.
{'\n\n'}
5.2 Disponibilidad del Servicio:
{'\n\n'}
La disponibilidad de la aplicación puede verse interrumpida por mantenimiento o problemas técnicos.
{'\n\n'}
5.3 Decisiones Financieras:
{'\n\n'}
Las decisiones basadas en la información de Finawise son responsabilidad exclusiva del usuario.
{'\n\n'}
6. Propiedad Intelectual
{'\n\n'}
6.1 Derechos sobre el Proyecto:
{'\n\n'}
Los desarrolladores de Finawise tienen derechos sobre el contenido y código del proyecto, conforme a las leyes de propiedad intelectual de Chile aplicables a obras académicas y de software.
{'\n\n'}
6.2 Restricciones de Uso:
{'\n\n'}
No se permite usar el nombre, logotipo o elementos de la marca sin autorización escrita.
{'\n\n'}
7. Modificaciones
{'\n\n'}
7.1 Actualización de Términos:
{'\n\n'}
Los términos y condiciones pueden ser modificados en cualquier momento. Los usuarios serán notificados en caso de cambios significativos.
{'\n\n'}
8. Contacto
{'\n\n'}
8.1 Soporte Técnico:
{'\n\n'}
Para consultas o problemas relacionados con la aplicación, puedes contactarnos mediante la sección de Solicitudes ubicada en el Menu de Usuario de Finawise.
{'\n\n'}
9. Aceptación
{'\n\n'}
Al usar la aplicación, confirmas que has leído, entendido y aceptado estos términos y condiciones.
{'\n\n'}
10. Ley Aplicable
{'\n\n'}
Estos términos se rigen por las leyes de Chile. Cualquier disputa será resuelta conforme a la legislación chilena.
{'\n\n'}
Gracias por utilizar Finawise. Este proyecto refleja nuestro esfuerzo por aprender y aplicar tecnologías innovadoras.
              {'\n\n'}
              
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
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  scrollContainer: {
    maxHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 0,
  },
  button: {
    marginTop: 20,
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
