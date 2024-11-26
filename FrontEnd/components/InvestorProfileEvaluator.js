// InvestorProfileEvaluator.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InvestorProfileEvaluator = ({ balance, income, expenses, onProceed }) => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    determineInvestorProfile();
  }, [balance, income, expenses]);

  // Lógica para determinar el perfil de inversor
  const determineInvestorProfile = () => {
    if (expenses > income * 0.9) {
      setProfile("Gastón");
    } else if (balance <= 100000 && income > expenses) {
      setProfile("Desinteresado");
    } else if (income - expenses > 1000000) {
      setProfile("Analítico");
    } else {
      setProfile("Temeroso");
    }
  };

  const getProfileDescription = () => {
    switch (profile) {
      case "Gastón":
        return "Tienes un perfil impulsivo, con compras frecuentes y poca planificación. Te recomendamos inversiones de bajo riesgo.";
      case "Temeroso":
        return "Prefieres la seguridad y te alejas de los riesgos. Te recomendamos inversiones estables y seguras.";
      case "Desinteresado":
        return "No tienes un gran interés por las finanzas, pero con una guía puedes comenzar a invertir.";
      case "Analítico":
        return "Planificas y controlas tus finanzas. Te recomendamos una cartera diversificada para optimizar tus rendimientos.";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu perfil de inversor</Text>
      {profile ? (
        <>
          <Text style={styles.profile}>{profile}</Text>
          <Text style={styles.description}>{getProfileDescription()}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onProceed}
          >
            <Text style={styles.buttonText}>Ver recomendaciones de inversión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.loadingText}>Calculando tu perfil de inversor...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 20,
  },
  profile: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 15,
  },
  button: {
    backgroundColor: '#511496',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
});

export default InvestorProfileEvaluator;
