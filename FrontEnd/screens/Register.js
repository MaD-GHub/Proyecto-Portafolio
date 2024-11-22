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
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

// Lista de regiones y comunas de Chile (completo)
const regionesYComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara", "Colchane", "Camiña"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Taltal", "Sierra Gorda", "Calama", "San Pedro de Atacama", "Ollagüe", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Huasco", "Alto del Carmen", "Freirina"],
  "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Los Vilos", "Salamanca", "Andacollo", "La Higuera", "Paiguano", "Vicuña"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "Quillota", "La Calera", "Nogales", "Hijuelas", "La Cruz", "Limache", "Olmué", "San Felipe", "Putaendo", "Santa María", "Llaillay", "Catemu", "Panquehue", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "Isla de Pascua", "Juan Fernández"],
  "Región Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Machalí", "Graneros", "Doñihue", "Codegua", "Olivar", "Coinco", "Coltauco", "Quinta de Tilcoco", "Rengo", "Malloa", "Requínoa", "San Vicente", "Pichidegua", "Peumo", "Las Cabras", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Pumanque", "Santa Cruz", "Pichilemu", "Marchihue", "Navidad", "Litueche", "La Estrella"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Chillán Viejo", "El Carmen", "Pinto", "San Ignacio", "Coihueco", "San Carlos", "Ñiquén", "San Fabián", "Bulnes", "Quillón", "San Nicolás", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco", "Yungay", "Pemuco"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"],
  "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Llanquihue", "Los Muermos", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Puerto Natales", "Torres del Paine"],
};

  const handleRegister = async () => {
    if (!region || !comuna) {
      Alert.alert("Error", "Por favor selecciona tu región y comuna.");
      return;
    }
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
        region,
        comuna, // Agrega región y comuna al registro
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

          <View>
            <LinearGradient colors={['#511496', '#885FD8']} style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.pickerTextStyle}
              >
                <Picker.Item label="Seleccione su género" value="" />
                <Picker.Item label="Masculino" value="masculino" />
                <Picker.Item label="Femenino" value="femenino" />
                <Picker.Item label="No informar" value="no_informar" />
              </Picker>
            </LinearGradient>
          </View>

          <LinearGradient colors={['#511496', '#885FD8']} style={styles.pickerContainer}>
            <Picker
              selectedValue={region}
              onValueChange={(itemValue) => {
                setRegion(itemValue);
                setComuna(''); // Reinicia comuna al cambiar la región
              }}
              style={styles.pickerTextStyle}
            >
              <Picker.Item label="Seleccione su región" value="" />
              {Object.keys(regionesYComunas).map((region, index) => (
                <Picker.Item key={index} label={region} value={region} />
              ))}
            </Picker>
          </LinearGradient>

          {region && (
            <LinearGradient colors={['#511496', '#885FD8']} style={styles.pickerContainer}>
              <Picker
                selectedValue={comuna}
                onValueChange={(itemValue) => setComuna(itemValue)}
                style={styles.pickerTextStyle}
              >
                <Picker.Item label="Seleccione su comuna" value="" />
                {regionesYComunas[region].map((comuna, index) => (
                  <Picker.Item key={index} label={comuna} value={comuna} />
                ))}
              </Picker>
            </LinearGradient>
          )}

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
    backgroundColor: '#fff',
    padding: 0,
    marginBottom: 17,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 25,
  },
  pickerTextStyle: {
    color: '#fff',
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
