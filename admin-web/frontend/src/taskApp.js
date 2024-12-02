import React, { useState, useEffect } from "react";
import { db, functions, httpsCallable } from "./firebase"; // Importamos los servicios de Firebase
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; // Firestore

const TaskApp = () => {
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Pendiente");

  // Función para crear tarea
  const createTask = async () => {
    if (!taskText.trim()) return; // Evita crear tareas vacías
    setLoading(true);
    try {
      const addTaskFunction = httpsCallable(functions, "addTask"); // Llama a la función en el backend
      const response = await addTaskFunction({ text: taskText });
      console.log("Tarea creada con éxito:", response.data);
      setTaskText(""); // Limpia el campo de texto
      fetchTasks(); // Actualiza las tareas
    } catch (error) {
      console.error("Error al agregar tarea:", error.message || error);
    } finally {
      setLoading(false);
    }
  };
  

  // Función para cambiar el estado de una tarea
  const updateTaskStatus = async (taskId, newStatus) => {
    setLoading(true);
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        lastUpdated: new Date(),
      });
      console.log(`Tarea ${taskId} actualizada a estado: ${newStatus}`);
      fetchTasks();
    } catch (error) {
      console.error("Error al actualizar tarea:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener tareas filtradas por estado
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "tasks"), where("status", "==", filter));
      const querySnapshot = await getDocs(q);
      const tasksList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setTasks(tasksList);
    } catch (error) {
      console.error("Error al obtener tareas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtro
  useEffect(() => {
    fetchTasks();
  }, [filter]);

  return (
    <div>
      <h1>App de Tareas</h1>
      <div>
        <button onClick={() => setFilter("Pendiente")} disabled={loading}>
          Pendiente
        </button>
        <button onClick={() => setFilter("Progreso")} disabled={loading}>
          En Progreso
        </button>
        <button onClick={() => setFilter("Completada")} disabled={loading}>
          Completada
        </button>
      </div>
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Descripción de la tarea"
      />
      <button onClick={createTask} disabled={loading}>
        Crear Tarea
      </button>
      {loading && <p>Cargando...</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.text} - {task.status}
            {task.status === "Pendiente" && (
              <button onClick={() => updateTaskStatus(task.id, "Progreso")}>
                Marcar como En Progreso
              </button>
            )}
            {task.status === "Progreso" && (
              <button onClick={() => updateTaskStatus(task.id, "Completada")}>
                Marcar como Completada
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskApp;
