import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Animated,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Icons
import { LinearGradient } from "expo-linear-gradient"; // Para degradados
import { auth, db } from "../firebase"; // Firebase auth y Firestore
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"; // Funciones Firestore
import registerActivity from "../components/registerActivity";

export default function AhorroScreen() {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(600));
  const [goalName, setGoalName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [deductionDay, setDeductionDay] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState(null); // Estado para el ID del objetivo seleccionado
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, "savings"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userGoals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(userGoals);
      });
      return () => unsubscribe(); // Limpiar listener
    }
  }, []);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "AhorroScreen",
        description: 'Usuario visita la página Ahorro', 
        });
    }
  }, []);

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

  const openEditModal = (goal) => {
    setSelectedGoalId(goal.id);
    setGoalName(goal.goalName);
    setAmount(goal.amount.toString());
    setStartDate(new Date(goal.startDate));
    setEndDate(new Date(goal.endDate));
    setDeductionDay(goal.deductionDay);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setGoalName("");
    setAmount("");
    setStartDate(new Date());
    setEndDate(new Date());
    setDeductionDay("");
  };

  const handleAddGoal = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "savings"), {
          userId: user.uid,
          goalName,
          amount: parseFloat(amount),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          deductionDay,
          status: "En progreso",
        });
        closeModal();
        resetForm();
      } catch (error) {
        console.error("Error al añadir meta:", error);
      }
    }
  };

  const handleEditGoal = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "savings", selectedGoalId), {
          goalName,
          amount: parseFloat(amount),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          deductionDay,
        });
        closeEditModal();
      } catch (error) {
        console.error("Error al editar meta:", error);
      }
    }
  };

  const calculateMonthlySavings = (goalAmount, start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    return months > 0 ? (goalAmount / months).toFixed(2) : goalAmount;
  };

  const toggleGoalStatus = async (goalId, currentStatus) => {
    const newStatus =
      currentStatus === "En progreso" ? "Pausada" : "En progreso";
    await updateDoc(doc(db, "savings", goalId), {
      status: newStatus,
    });
  };

  const deleteGoal = (goalId) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta meta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            await deleteDoc(doc(db, "savings", goalId));
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const toggleShowGoals = () => {
    setShowAllGoals(!showAllGoals);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#511496" barStyle="light-content" />

      <View style={styles.header}>
        <MaterialCommunityIcons name="piggy-bank" size={28} color="white" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mis Metas</Text>
          <Text style={styles.headerSubtitle}>
            Tienes {goals.length} metas en progreso
          </Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={openModal}>
          <Text style={styles.payButtonText}>Agregar Meta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>{goals.length}</Text>
          <Text style={styles.statusLabel}>Todas</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "En progreso").length}
          </Text>
          <Text style={styles.statusLabel}>Activas</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "Pausada").length}
          </Text>
          <Text style={styles.statusLabel}>En pausa</Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={styles.statusNumber}>
            {goals.filter((goal) => goal.status === "Completada").length}
          </Text>
          <Text style={styles.statusLabel}>Completadas</Text>
        </View>
      </View>

      <View style={styles.goalListContainer}>
        {goals.length > 0 ? (
          <>
            <View style={styles.goalCard}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalAmount}>
                  CLP {goals[0]?.amount?.toLocaleString() || "0"}
                </Text>
                <Text style={styles.goalDates}>
                  Desde:{" "}
                  {goals[0]?.startDate
                    ? new Date(goals[0].startDate).toLocaleDateString()
                    : "N/A"}{" "}
                  - Hasta:{" "}
                  {goals[0]?.endDate
                    ? new Date(goals[0].endDate).toLocaleDateString()
                    : "N/A"}
                </Text>
                <Text style={styles.goalDates}>
                  Ahorro mensual: CLP{" "}
                  {goals[0]?.amount && goals[0]?.startDate && goals[0]?.endDate
                    ? calculateMonthlySavings(
                        goals[0].amount,
                        goals[0].startDate,
                        goals[0].endDate
                      )
                    : "0"}
                </Text>
              </View>
              <View style={styles.goalActions}>
                <TouchableOpacity
                  onPress={() => toggleGoalStatus(goals[0].id, goals[0].status)}
                >
                  <MaterialCommunityIcons
                    name={
                      goals[0].status === "En progreso"
                        ? "pause-circle-outline"
                        : "play-circle-outline"
                    }
                    size={24}
                    color={
                      goals[0].status === "En progreso" ? "orange" : "green"
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEditModal(goals[0])}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color="purple"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteGoal(goals[0].id)}>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={24}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleShowGoals}
            >
              <Text style={styles.expandButtonText}>
                {showAllGoals ? "Ver menos" : "Ver todas las metas"}
              </Text>
              <MaterialCommunityIcons
                name={showAllGoals ? "chevron-up" : "chevron-down"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>

            {showAllGoals &&
              goals.slice(1).map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalAmount}>
                      CLP {goal?.amount?.toLocaleString() || "0"}
                    </Text>
                    <Text style={styles.goalDates}>
                      Desde:{" "}
                      {goal?.startDate
                        ? new Date(goal.startDate).toLocaleDateString()
                        : "N/A"}{" "}
                      - Hasta:{" "}
                      {goal?.endDate
                        ? new Date(goal.endDate).toLocaleDateString()
                        : "N/A"}
                    </Text>
                    <Text style={styles.goalDates}>
                      Ahorro mensual: CLP{" "}
                      {goal?.amount && goal?.startDate && goal?.endDate
                        ? calculateMonthlySavings(
                            goal.amount,
                            goal.startDate,
                            goal.endDate
                          )
                        : "0"}
                    </Text>
                  </View>
                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      onPress={() => toggleGoalStatus(goal.id, goal.status)}
                    >
                      <MaterialCommunityIcons
                        name={
                          goal.status === "En progreso"
                            ? "pause-circle-outline"
                            : "play-circle-outline"
                        }
                        size={24}
                        color={
                          goal.status === "En progreso" ? "orange" : "green"
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditModal(goal)}>
                      <MaterialCommunityIcons
                        name="pencil"
                        size={24}
                        color="purple"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={24}
                        color="red"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </>
        ) : (
          <Text style={styles.noGoalsText}>No tienes metas de ahorro aún.</Text>
        )}
      </View>

      {/* Modal para añadir una nueva meta */}
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

            <Text style={styles.modalTitle}>Nueva Meta de Ahorro</Text>

            <TextInput
              placeholder="Descripción"
              value={goalName}
              onChangeText={(text) => setGoalName(text)}
              style={styles.inputBox}
            />

            <TextInput
              placeholder="Monto total (CLP)"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              style={styles.inputBox}
            />

            <TouchableOpacity
              onPress={() => setShowStartDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Inicio: {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || startDate;
                  setShowStartDate(false);
                  setStartDate(currentDate);
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowEndDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Término: {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showEndDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || endDate;
                  setShowEndDate(false);
                  setEndDate(currentDate);
                }}
              />
            )}

            <TextInput
              placeholder="Día de deducción"
              keyboardType="numeric"
              value={deductionDay}
              onChangeText={(text) =>
                setDeductionDay(text.replace(/[^0-9]/g, ""))
              }
              style={styles.inputBox}
            />

            <LinearGradient
              colors={["#511496", "#885FD8"]}
              style={styles.pickerContainer}
            >
              <TouchableOpacity
                onPress={handleAddGoal}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal para editar una meta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeEditModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Editar Meta de Ahorro</Text>

            <TextInput
              placeholder="Descripción"
              value={goalName}
              onChangeText={(text) => setGoalName(text)}
              style={styles.inputBox}
            />

            <TextInput
              placeholder="Monto total (CLP)"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              style={styles.inputBox}
            />

            <TouchableOpacity
              onPress={() => setShowStartDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Inicio: {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || startDate;
                  setShowStartDate(false);
                  setStartDate(currentDate);
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowEndDate(true)}
              style={styles.dateButton}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#511496"
              />
              <Text style={styles.dateText}>
                Fecha de Término: {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showEndDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || endDate;
                  setShowEndDate(false);
                  setEndDate(currentDate);
                }}
              />
            )}

            <TextInput
              placeholder="Día de deducción"
              keyboardType="numeric"
              value={deductionDay}
              onChangeText={(text) =>
                setDeductionDay(text.replace(/[^0-9]/g, ""))
              }
              style={styles.inputBox}
            />

            <LinearGradient
              colors={["#511496", "#885FD8"]}
              style={styles.pickerContainer}
            >
              <TouchableOpacity
                onPress={handleEditGoal}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 200,
    backgroundColor: "#f1f1f1",
  },
  header: {
    backgroundColor: "#511496",
    padding: 24,
    paddingTop: 28,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#e0e0e0",
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  payButtonText: {
    color: "#2D2D2D",
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 23,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginHorizontal: 10,
    marginTop: 12,
  },
  statusBox: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 15,
    width: 70,
  },
  statusNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D2D2D",
  },
  statusLabel: {
    fontSize: 14,
    color: "#2D2D2D",
  },
  goalListContainer: {
    marginTop: 20,
  },
  goalCard: {
    backgroundColor: "#2D2D2D",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalInfo: {
    flex: 1,
  },
  goalAmount: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  goalDates: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  goalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 90,
  },
  expandButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  expandButtonText: {
    color: "gray",
    fontSize: 16,
    marginRight: 5,
  },
  noGoalsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#673072",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    color: "#673072",
    marginBottom: 20,
    fontWeight: "bold",
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
  confirmButton: {
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});




