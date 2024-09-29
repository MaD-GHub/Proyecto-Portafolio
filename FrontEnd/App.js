import * as React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, StyleSheet, TextInput, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import AhorroScreen from './screens/AhorroScreen';
import ProfileScreen from './screens/ProfileScreen';
import DatosScreen from './screens/DatosScreen';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Importa DateTimePicker

const Tab = createBottomTabNavigator();

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
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: '#8f539b',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#eeeeee',
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

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
          } else if (route.name === 'Usuario') {
            return <AntDesign name="user" size={size} color={color} />;
          }
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#8f539b',
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
      <Tab.Screen 
  name="Inicio" 
  options={{ headerShown: false }}  // Oculta el encabezado
>
  {() => <HomeScreen transactions={transactions} setTransactions={setTransactions} />}
</Tab.Screen>
      <Tab.Screen name="Ahorro" component={AhorroScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Agregar"
        component={HomeScreen}
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
      <Tab.Screen name="Usuario" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [transactionType, setTransactionType] = React.useState('Ingreso');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false); // Estado para mostrar el picker
  const [transactions, setTransactions] = React.useState([]);

  const ingresoCategorias = ['Salario', 'Venta de producto'];
  const egresoCategorias = ['Comida y Bebidas', 'Vestuario', 'Alojamiento', 'Salud', 'Transporte', 'Educación'];

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Ocultar el picker después de seleccionar la fecha
    if (selectedDate) {
      setDate(selectedDate); // Actualizar la fecha seleccionada
    }
  };

  const handleAddTransaction = () => {
    const parsedAmount = parseFloat(amount);

    // Validación del monto y categoría
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
      date: date.toLocaleDateString(), // Usamos la fecha seleccionada
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
    setCategory('');
    setDate(new Date()); // Restablecemos la fecha por defecto
    closeModal();
  };

  return (
    <NavigationContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <HomeTabs openModal={openModal} transactions={transactions} setTransactions={setTransactions} />

        {/* Modal para agregar una nueva transacción */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Añadir nueva transacción</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'Ingreso' ? styles.activeButton : {}]}
                  onPress={() => {
                    setTransactionType('Ingreso');
                    setCategory(''); // Restablecer categoría
                  }}
                >
                  <Text style={styles.buttonText}>
                    Ingreso 💰
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, transactionType === 'Egreso' ? styles.activeButton : {}]}
                  onPress={() => {
                    setTransactionType('Egreso');
                    setCategory(''); // Restablecer categoría
                  }}
                >
                  <Text style={styles.buttonText}>
                    Egreso 💸
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Ingrese monto"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, ''); // Solo permite números
                  setAmount(numericValue);
                }}
                style={styles.input}
              />

              {/* Selector de Categoría */}
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

              {/* Botón para mostrar el selector de fecha */}
              <Button title="Seleccionar Fecha" onPress={() => setShowDatePicker(true)} />
              <Text style={styles.dateText}>Fecha seleccionada: {date.toLocaleDateString()}</Text>

              {/* Muestra el selector de fecha solo si el estado lo permite */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleAddTransaction} style={styles.confirmButton}>
                  <Text style={styles.confirmText}>Confirmar ✅</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeText}>Cerrar ❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  typeButton: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: '#cccccc',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#8f539b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: 250,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  dateText: {
    marginTop: 10,
    fontSize: 16,
  },
});
