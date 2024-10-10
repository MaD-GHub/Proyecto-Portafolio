import * as React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, StyleSheet, TextInput, ActivityIndicator, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebase'; 
import HomeScreen from './screens/HomeScreen';
import AhorroScreen from './screens/AhorroScreen';
import ActualidadScreen from './screens/ActualidadScreen';
import DatosScreen from './screens/DatosScreen';
import StartScreen from './screens/StartScreen';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import ProfileScreen from './screens/ProfileScreen';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Tab Navigator para la barra flotante
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Botón personalizado en la barra flotante
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#511496', '#885fd8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#eeeeee',
        }}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Componente vacío para la pantalla "Agregar"
function EmptyComponent() {
  return <View />;
}

// Pantalla de Tabs (barra flotante)
function HomeTabs({ openModal, transactions, setTransactions }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Ahorro') {
            iconName = focused ? 'piggy-bank' : 'piggy-bank-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Datos') {
            return <AntDesign name="linechart" size={size} color={color} />;
          } else if (route.name === 'Actualidad') {
            return <MaterialCommunityIcons name="newspaper" size={size} color={color} />;
          }
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#511496',
        tabBarInactiveTintColor: '#6d6d6d',
        tabBarStyle: {
          position: 'absolute',
          bottom: 10,
          left: 16,
          right: 16,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 20,
          height: 90,
          paddingBottom: 10,
          shadowColor: '#7F5DF0',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'QuattrocentoSans-Regular',
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ahorro" component={AhorroScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Agregar"
        component={EmptyComponent} // Usa el componente vacío en lugar de una función en línea
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} onPress={openModal}>
              <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
            </CustomTabBarButton>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen name="Datos" component={DatosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Actualidad" component={ActualidadScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// Aplicación principal
export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [transactionType, setTransactionType] = React.useState('Ingreso');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const slideAnim = React.useRef(new Animated.Value(600)).current;

  // Estado para verificar si el usuario está autenticado y cargando
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const ingresoCategorias = ['Salario', 'Venta de producto'];
  const egresoCategorias = ['Comida y Bebidas', 'Vestuario', 'Alojamiento', 'Salud', 'Transporte', 'Educación'];

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Ocultar el picker después de seleccionar la fecha
    if (selectedDate) {
      setDate(selectedDate); // Actualizar la fecha seleccionada
    }
  };

  const handleAddTransaction = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }
    if (!category) {
      alert('Por favor seleccione una categoría.');
      return;
    }

    const newTransaction = {
      id: Math.random().toString(),
      type: transactionType,
      amount: parsedAmount,
      category,
      date: date.toLocaleDateString(), 
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
    setCategory('');
    setDate(new Date()); 
    closeModal();
  };

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#673072" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Stack.Navigator initialRouteName={user ? 'HomeTabs' : 'StartScreen'}>
          <Stack.Screen name="HomeTabs" options={{ headerShown: false }}>
            {(props) => (
              <HomeTabs {...props} openModal={openModal} transactions={transactions} setTransactions={setTransactions} />
            )}
          </Stack.Screen>
          <Stack.Screen name="StartScreen" component={StartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>

        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Seleccione tipo de transacción</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'Ingreso' ? styles.activeButton : {}]}
                  onPress={() => {
                    setTransactionType('Ingreso');
                    setCategory('');
                  }}
                >
                  <Text style={styles.buttonText}>Ingreso</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'Egreso' ? styles.activeButton : {}]}
                  onPress={() => {
                    setTransactionType('Egreso');
                    setCategory('');
                  }}
                >
                  <Text style={styles.buttonText}>Egreso</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Ingrese cantidad</Text>
              <TextInput
                placeholder="Ingrese monto"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setAmount(numericValue);
                }}
                style={styles.inputBox}
              />

              <Text style={styles.sectionTitle}>Seleccione Categoría</Text>
              <View style={styles.inputBox}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione categoría" value="" />
                  {transactionType === 'Ingreso'
                    ? ingresoCategorias.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                      ))
                    : egresoCategorias.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                      ))}
                </Picker>
              </View>

              <Text style={styles.sectionTitle}>Seleccione Fecha</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <MaterialCommunityIcons name="calendar" size={24} color="#555" />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleAddTransaction} style={styles.confirmButton}>
                  <Text style={styles.confirmText}>Confirmar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Modal>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    padding: 25,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#8f539b',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: '#cccccc',
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#8f539b',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 16,
  },
});
