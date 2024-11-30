import React, { useState, useEffect } from 'react';
import { db, functions, httpsCallable } from './firebase'; // Importamos los servicios de Firebase
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'; // Añadir doc y updateDoc aquí

const TaskApp = () => {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Pendiente'); // Filtro para mostrar tareas en diferentes estados

  // Función para crear tarea
  const createTask = async () => {
    if (!taskText.trim()) return; // Evita crear tareas vacías
    setLoading(true);
    try {
      const addTaskFunction = httpsCallable(functions, "addTask");  // Llamamos a la función en el backend
      await addTaskFunction({ text: taskText });
      console.log("Tarea creada con éxito.");
      setTaskText(''); // Limpiar campo de texto
      fetchTasks(); // Refresca las tareas
    } catch (e) {
      console.error("Error al agregar tarea: ", e);
    } finally {
      setLoading(false);
    }
  };

  // Función para marcar tarea como en progreso
  const markTaskAsInProgress = async (taskId) => {
    setLoading(true);
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        status: "Progreso",
        lastUpdated: new Date(),
      });
      console.log(`Tarea ${taskId} marcada como en progreso`);
      fetchTasks(); // Refresca las tareas
    } catch (e) {
      console.error("Error al actualizar tarea: ", e);
    } finally {
      setLoading(false);
    }
  };

  // Función para marcar tarea como completada
  const markTaskAsCompleted = async (taskId) => {
    setLoading(true);
    try {
      const markCompletedFunction = httpsCallable(functions, "markTaskAsCompleted");
      await markCompletedFunction({ taskId });
      console.log(`Tarea ${taskId} marcada como completada.`);
      fetchTasks(); // Refresca las tareas
    } catch (e) {
      console.error("Error al actualizar tarea: ", e);
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
      const filteredTasks = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(filteredTasks);
      console.log(filteredTasks);
    } catch (e) {
      console.error("Error al obtener tareas: ", e);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar el filtro de tareas por estado
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchTasks(); // Llama a la función de obtención de tareas con el nuevo filtro
  };

  useEffect(() => {
    fetchTasks(); // Llamar a la función al cargar el componente
  }, [filter]); // Cambiar las tareas cuando se cambia el filtro

  return (
    <div>
      <h1>App de Tareas</h1>

      {/* Filtros para tareas */}
      <div>
        <button onClick={() => handleFilterChange('Pendiente')} disabled={loading}>Pendiente</button>
        <button onClick={() => handleFilterChange('Progreso')} disabled={loading}>En Progreso</button>
        <button onClick={() => handleFilterChange('Completada')} disabled={loading}>Completada</button>
      </div>

      {/* Formulario para crear tarea */}
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Descripción de la tarea"
      />
      <button onClick={createTask} disabled={loading}>Crear tarea</button>

      {loading && <p>Cargando...</p>}

      <hr />

      <button onClick={fetchTasks} disabled={loading}>Obtener tareas</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.text} - {task.status}
            {task.status === 'Pendiente' && (
              <button onClick={() => markTaskAsInProgress(task.id)} disabled={loading}>
                Marcar como en progreso
              </button>
            )}
            {task.status === 'Progreso' && (
              <button onClick={() => markTaskAsCompleted(task.id)} disabled={loading}>
                Marcar como completada
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskApp;
