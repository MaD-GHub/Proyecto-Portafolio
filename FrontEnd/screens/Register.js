import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; 
import { FontAwesome5 } from '@expo/vector-icons'; 

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
        birthDate: birthDate.toISOString(),
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
      setBirthDateString(selectedDate.toLocaleDateString());
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* Header con degradado y logo */}
        <LinearGradient colors={['#511496', '#885FD8']} style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Logo_finawise_blanco_shadowpurple.png')}
              style={styles.logo}
            />
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('StartScreen')}>
          <FontAwesome5 name="angle-left" size={24} color="#fff" />
          </TouchableOpacity> 
        </LinearGradient>

        {/* Formulario flotante */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Regístrate</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Apellido" value={lastName} onChangeText={setLastName} />

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

          <View >
          <LinearGradient colors={['#511496', '#885FD8']} style={styles.pickerContainer}>
          <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.pickerTextStyle} // Custom text style
            >
            
              <Picker.Item label="Seleccione su género" value="" />
              <Picker.Item label="Masculino" value="masculino" />
              <Picker.Item label="Femenino" value="femenino" />
              <Picker.Item label="No informar" value="no_informar" />
            </Picker>
          </LinearGradient>
          </View>

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
            <LinearGradient colors={['#511496', '#885FD8']} style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Registrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>¿Ya tienes una cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginTop: -140,

  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: 'center',
    marginTop: -175,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#511496',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerContainer: {
    backgroundColor: '#fff', // Background for the picker container
    padding: 0,
    marginBottom: 17,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 25, // Full rounded corners
  },
  pickerTextStyle: {
    color: '#fff', // Text color of the picker items
    paddingHorizontal: 10, // Padding inside the picker for spacing
  },
  registerButton: {
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 5,
    paddingLeft: 35,
    paddingRight: 35,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
  },
  loginLink: {
    textAlign: 'center',
    color: '#511496',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  checkboxText: {
    color: '#511496',
    fontSize: 16,
    marginBottom: 15,
  },
  
});

