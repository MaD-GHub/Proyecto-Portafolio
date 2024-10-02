import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase'; // Asegúrate de que la ruta sea correcta
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Importa doc y setDoc

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [hasJob, setHasJob] = useState(false);
  const [salary, setSalary] = useState('');
  const [salaryDay, setSalaryDay] = useState('');

  // Función para manejar el registro
  const handleRegister = async () => {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos adicionales en Firestore usando doc y setDoc
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        birthDate,
        gender,
        hasJob,
        salary: hasJob ? salary : null,  // Si tiene trabajo, guarda salario, si no, null
        salaryDay: hasJob ? salaryDay : null,  // Si tiene trabajo, guarda el día de salario, si no, null
        email: user.email,
      });

      // Redirigir al login después del registro exitoso
      navigation.replace('Login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={['#8f539b', '#d495ed']} style={styles.container}>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.subtitle}>Completa tus datos</Text>

        {/* Formulario de registro */}
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de Nacimiento (dd/mm/yyyy)"
          value={birthDate}
          onChangeText={setBirthDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Género"
          value={gender}
          onChangeText={setGender}
        />

        {/* Checkbox para indicar si tiene trabajo */}
        <TouchableOpacity onPress={() => setHasJob(!hasJob)}>
          <Text style={styles.checkboxText}>{hasJob ? '✅' : '⬜'} ¿Tienes trabajo?</Text>
        </TouchableOpacity>

        {/* Campos adicionales si tiene trabajo */}
        {hasJob && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Sueldo mensual"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Día de pago del mes"
              value={salaryDay}
              onChangeText={setSalaryDay}
              keyboardType="numeric"
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    color: 'white',
  },
  registerButton: {
    backgroundColor: '#673072',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  loginLink: {
    textAlign: 'center',
    color: 'white',
    marginTop: 20,
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
});
