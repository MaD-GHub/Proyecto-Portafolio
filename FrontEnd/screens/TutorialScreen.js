import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import registerActivity from "../components/registerActivity";

const TutorialScreen = () => {
  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "TutorialScreen",
        description: 'Usuario visita la página de tutoriales.', 
        });
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Elimina el segundo título y deja solo el del header */}
      <LinearGradient
        colors={['#511496', '#885FD8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Guías y Tutoriales</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Secciones detalladas sin título repetido */}
        <Text style={styles.sectionTitle}>Inicio</Text>
        <Text style={styles.paragraph}>
          En la sección de **Inicio**, verás un resumen de tus finanzas con gráficos que muestran tus ahorros y gastos. Aquí puedes ver tu progreso mensual y tus metas financieras.
        </Text>

        <Text style={styles.sectionTitle}>Ahorro</Text>
        <Text style={styles.paragraph}>
          La sección de **Ahorro** te permite llevar un registro detallado de tus metas financieras. Puedes crear objetivos de ahorro y hacer un seguimiento del dinero que has guardado.
        </Text>

        <Text style={styles.sectionTitle}>Datos</Text>
        <Text style={styles.paragraph}>
          En **Datos**, accede a informes detallados de tus ingresos y gastos. Puedes filtrar por categorías, fechas, o tipo de gasto para obtener una visión clara de tus finanzas.
        </Text>

        <Text style={styles.sectionTitle}>Actualidad</Text>
        <Text style={styles.paragraph}>
          La sección de **Actualidad** te permite estar informado con noticias actualizadas y artículos financieros que te ayudarán a mejorar tus conocimientos.
        </Text>

        <Text style={styles.sectionTitle}>Agregar Transacción</Text>
        <Text style={styles.paragraph}>
          Para agregar una nueva transacción, presiona el botón **+** en la parte inferior de la pantalla. Ingresa la cantidad, categoría, descripción, y selecciona la fecha. Puedes marcar la transacción como **fija** si es recurrente.
        </Text>

        <Text style={styles.sectionTitle}>Perfil</Text>
        <Text style={styles.paragraph}>
          En el **Perfil**, puedes actualizar tu información personal, cambiar tu foto de perfil, y ver un resumen de tu actividad financiera.
        </Text>

        <Text style={styles.sectionTitle}>Configuración</Text>
        <Text style={styles.paragraph}>
          Desde la sección **Configuración**, puedes ajustar tus preferencias de notificación, idioma, y seguridad. Asegúrate de revisar las opciones para personalizar tu experiencia.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
});

export default TutorialScreen;
