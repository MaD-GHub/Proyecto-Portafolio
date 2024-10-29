// App.js
import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebase";
import HomeScreen from "./screens/HomeScreen";
import AhorroScreen from "./screens/AhorroScreen";
import ActualidadScreen from "./screens/ActualidadScreen";
import DatosScreen from "./screens/DatosScreen";
import StartScreen from "./screens/StartScreen";
import LoginScreen from "./screens/Login";
import RegisterScreen from "./screens/Register";
import SimulacionScreen from "./screens/SimulacionScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#511496", "#885fd8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#eeeeee",
        }}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function HomeTabs({ openModal, transactions, setTransactions }) {
  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      "Eliminar transacción",
      "¿Estás seguro de que quieres eliminar esta transacción?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "transactions", transactionId));
              setTransactions((prevTransactions) =>
                prevTransactions.filter((item) => item.id !== transactionId)
              );
              console.log("Transacción eliminada con éxito");
            } catch (error) {
              console.error("Error al eliminar la transacción:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Ahorro") {
            iconName = focused ? "piggy-bank" : "piggy-bank-outline";
            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "Datos") {
            return <AntDesign name="linechart" size={size} color={color} />;
          } else if (route.name === "Actualidad") {
            return (
              <MaterialCommunityIcons
                name="newspaper"
                size={size}
                color={color}
              />
            );
          }
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#511496",
        tabBarInactiveTintColor: "#6d6d6d",
        tabBarStyle: {
          position: "absolute",
          bottom: 10,
          left: 16,
          right: 16,
          elevation: 0,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          height: 90,
          paddingBottom: 10,
          shadowColor: "#7F5DF0",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "QuattrocentoSans-Regular",
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        options={{ headerShown: false }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="Ahorro"
        component={AhorroScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Agregar"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ color: "white", fontSize: 28 }}>+</Text>
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} onPress={openModal}>
              <Text style={{ color: "white", fontSize: 28 }}>+</Text>
            </CustomTabBarButton>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Datos"
        component={DatosScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Actualidad"
        component={ActualidadScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [transactionType, setTransactionType] = React.useState("Ingreso");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState(""); // Campo de descripción
  const [isFixed, setIsFixed] = React.useState("No"); // Nuevo estado para tipo fijo
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const slideAnim = React.useRef(new Animated.Value(600)).current;

  const ingresoCategorias = ["Salario", "Venta de producto"];
  const gastoCategorias = [
    "Comida y Bebidas",
    "Vestuario",
    "Alojamiento",
    "Salud",
    "Transporte",
    "Educación",
  ];
  const [isInstallment, setIsInstallment] = React.useState(false);
  const [installmentCount, setInstallmentCount] = React.useState(1); // Estado para las cuotas

  // Cambiar entre Ingreso y Gasto y resetear cuotas si es Ingreso
  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    if (type === "Ingreso") {
      setIsInstallment(false); // Resetear el estado de cuotas si es ingreso
    }
  };
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
      // Reiniciar el estado del formulario al cerrar el modal
      setAmount("");
      setCategory("");
      setDescription("");
      setIsFixed("No"); // Reiniciar el campo de fijo
      setDate(new Date());
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const [billingDay, setBillingDay] = React.useState(1); // Día de facturación por defecto: 1

  const handleAddTransaction = async () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingrese un monto válido.");
      return;
    }
    if (!category) {
      alert("Por favor seleccione una categoría.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Por favor inicie sesión.");
      return;
    }

    let firstInstallmentDate = new Date(date); // Empezamos con la fecha de compra

    // Si la compra es después del día de facturación, mover la primera cuota al siguiente mes
    if (isInstallment && firstInstallmentDate.getDate() > billingDay) {
      firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
    }

    const newTransaction = {
      type: transactionType,
      amount: parsedAmount,
      category: category,
      description: description,
      isFixed: isFixed,
      isRecurrent: isFixed === "Fijo",
      isInstallment: isInstallment,
      installmentCount: isInstallment ? installmentCount : null, // Asegúrate de que el número de cuotas se guarde correctamente
      billingDay: billingDay, // Guardamos el día de facturación
      installmentStartDate: firstInstallmentDate.toISOString(),
      selectedDate: date.toISOString(),
      creationDate: new Date().toLocaleDateString(),
      userId: user.uid,
    };

    try {
      const docRef = await addDoc(
        collection(db, "transactions"),
        newTransaction
      );
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        { id: docRef.id, ...newTransaction },
      ]);
      closeModal();
    } catch (error) {
      console.error("Error al añadir transacción: ", error);
    }
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#673072" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Stack.Navigator initialRouteName={user ? "HomeTabs" : "StartScreen"}>
          <Stack.Screen name="HomeTabs" options={{ headerShown: false }}>
            {(props) => (
              <HomeTabs
                {...props}
                openModal={openModal}
                transactions={transactions}
                setTransactions={setTransactions}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StartScreen"
            component={StartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SimulacionScreen"
            component={SimulacionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nueva Transacción</Text>

              {/* Selector de Ingreso/Gasto */}
              <View style={styles.segmentedControlContainer}>
                <TouchableOpacity
                  style={[
                    styles.segmentedControlButton,
                    transactionType === "Ingreso" &&
                      styles.segmentedControlButtonActive,
                  ]}
                  onPress={() => setTransactionType("Ingreso")}
                >
                  <Text
                    style={[
                      styles.segmentedControlText,
                      transactionType === "Ingreso" &&
                        styles.segmentedControlTextActive,
                    ]}
                  >
                    Ingreso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentedControlButton,
                    transactionType === "Gasto" &&
                      styles.segmentedControlButtonActive,
                  ]}
                  onPress={() => setTransactionType("Gasto")}
                >
                  <Text
                    style={[
                      styles.segmentedControlText,
                      transactionType === "Gasto" &&
                        styles.segmentedControlTextActive,
                    ]}
                  >
                    Gasto
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Campo de monto */}
              <TextInput
                placeholder="Ingrese monto"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
                style={styles.inputBox}
              />

              {/* Picker de Categorías */}
              <View style={styles.inputBox2}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione categoría" value="" />
                  {transactionType === "Ingreso"
                    ? ingresoCategorias.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                      ))
                    : gastoCategorias.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                      ))}
                </Picker>
              </View>

              {/* Campo de descripción */}
              <TextInput
                placeholder="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                style={styles.inputBox}
              />

              {/* Picker para tipo fijo, variable o en cuotas (solo para Gastos) */}
              {/* Picker para tipo de gasto (fijo/variable/cuotas) */}
              {/* Picker para seleccionar si es fijo, variable o en cuotas */}
              <View style={styles.inputBox2}>
                <Picker
                  selectedValue={isFixed}
                  onValueChange={(itemValue) => {
                    setIsFixed(itemValue);
                    // Solo si es Cuotas se habilita la lógica de cuotas
                    setIsInstallment(itemValue === "Cuotas");
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione tipo" value="No" />
                  <Picker.Item label="Fijo" value="Fijo" />
                  <Picker.Item label="Variable" value="Variable" />
                  {/* Cuotas solo aparece para Gasto */}
                  {transactionType === "Gasto" && (
                    <Picker.Item label="Cuotas" value="Cuotas" />
                  )}
                </Picker>
              </View>

              {/* Mostrar solo si es en cuotas y tipo Gasto */}
              {isInstallment && transactionType === "Gasto" && (
                <View style={styles.inputBox2}>
                  <Picker
                    selectedValue={installmentCount}
                    onValueChange={(itemValue) =>
                      setInstallmentCount(itemValue)
                    }
                    style={styles.picker}
                  >
                    {/* Opciones ampliadas de cuotas */}
                    <Picker.Item label="3 cuotas" value={3} />
                    <Picker.Item label="6 cuotas" value={6} />
                    <Picker.Item label="12 cuotas" value={12} />
                    <Picker.Item label="18 cuotas" value={18} />
                    <Picker.Item label="24 cuotas" value={24} />
                  </Picker>
                </View>
              )}

              {isInstallment && transactionType === "Gasto" && (
                <Text style={styles.installmentText}>
                  Cada cuota será de: {(amount / installmentCount).toFixed(2)}{" "}
                  CLP
                </Text>
              )}

              {/* Selector de fecha */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color="#511496"
                />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>

              {isInstallment && transactionType === "Gasto" && (
                <View>
                  <Text style={styles.textFacturacion}>
                    Día de facturación de la tarjeta
                  </Text>
                  <View style={styles.inputBox2}>
                    {/* El texto de Día de facturación de la tarjeta */}

                    <Picker
                      selectedValue={billingDay}
                      onValueChange={(itemValue) => setBillingDay(itemValue)}
                      style={styles.picker}
                    >
                      {[...Array(31)].map((_, index) => (
                        <Picker.Item
                          key={index}
                          label={`Día ${index + 1}`}
                          value={index + 1}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              {/* Aquí va tu DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Botón de Confirmar */}
              <LinearGradient
                colors={["#511496", "#885FD8"]}
                style={styles.pickerContainer}
              >
                <TouchableOpacity
                  onPress={handleAddTransaction}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmText}>Confirmar</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro con 50% de opacidad
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#673072",
    paddingRight: 15,
    paddingTop: 7,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673072",
    marginBottom: 20,
    fontWeight: "bold",
  },
  segmentedControlContainer: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  installmentText: {
    fontSize: 16,
    color: "#673072",
    marginTop: -4, // Para separar del Picker
    textAlign: "center",
    marginBottom: 13,
    fontWeight: "bold",
  },

  pickerContainer: {
    backgroundColor: "#fff",
    padding: 10,
    paddingLeft: 25,
    paddingRight: 25,
    marginBottom: 17,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 25,
    fontWeight: "bold",
  },
  segmentedControlButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textFacturacion: {
    fontSize: 16,
    color: "#673072",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  segmentedControlButtonActive: {
    backgroundColor: "#511496",
  },
  segmentedControlText: {
    color: "#6d6d6d",
    fontSize: 14,
    fontWeight: "bold",
  },
  segmentedControlTextActive: {
    color: "#fff",
  },
  inputBox2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 2,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
    borderColor: "#f0f0f0",
    borderWidth: 1,
  },
  picker: {
    height: 20,
    width: "100%",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
  },
  dateText: {
    marginLeft: 10,
    color: "#555",
    fontSize: 16,
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
