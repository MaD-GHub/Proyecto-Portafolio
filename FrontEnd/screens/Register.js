import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Asegúrate de instalarlo

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthDateString, setBirthDateString] = useState('');
  const [gender, setGender] = useState('');
  const [hasJob, setHasJob] = useState(false);
  const [salary, setSalary] = useState('');
  const [salaryDay, setSalaryDay] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        birthDate: birthDate.toISOString(), // Guarda la fecha como string
        gender,
        hasJob,
        salary: hasJob ? salary : null,
        salaryDay: hasJob ? salaryDay : null,
        email: user.email,
      });

      Alert.alert("Te has Registrado con éxito");
      navigation.replace('Login');
    } catch (error) {
      alert(error.message);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      setBirthDateString(selectedDate.toLocaleDateString()); // Guarda la fecha en formato local
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={['#8f539b', '#d495ed']} style={styles.container}>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.subtitle}>Completa tus datos</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("StartScreen")}>
          <Text style={styles.backButtonText}>⬅ Volver</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Nombre" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Apellido" value={lastName} onChangeText={setLastName} />

        {/* Campo de fecha de nacimiento */}
        <TouchableOpacity style={styles.input} onPress={showDatepicker}>
          <Text>{birthDateString || "Fecha de Nacimiento"}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Selector de género */}
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Seleccione su género" value="" />
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Femenino" value="femenino" />
          <Picker.Item label="No informar" value="no_informar" />
        </Picker>

        <TouchableOpacity onPress={() => setHasJob(!hasJob)}>
          <Text style={styles.checkboxText}>{hasJob ? '✅' : '⬜'} ¿Tienes trabajo?</Text>
        </TouchableOpacity>

        {hasJob && (
          <>
            <TextInput style={styles.input} placeholder="Sueldo mensual" value={salary} onChangeText={setSalary} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Día de pago del mes (01-31)" value={salaryDay} onChangeText={setSalaryDay} keyboardType="numeric" />
          </>
        )}

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
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
