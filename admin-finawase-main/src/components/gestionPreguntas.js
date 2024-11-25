import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaEdit, FaTrash, FaTimes, FaPlus, FaMinus } from "react-icons/fa";

const GestionPreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [incorrectAnswers, setIncorrectAnswers] = useState([""]);
  const [photo, setPhoto] = useState(null);
  const [selectedPregunta, setSelectedPregunta] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Cargar preguntas desde Firebase
  const loadPreguntas = async () => {
    const preguntasSnapshot = await getDocs(collection(db, "preguntas"));
    const preguntasList = preguntasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPreguntas(preguntasList);
  };

  useEffect(() => {
    loadPreguntas();
  }, []);

  // Crear una nueva pregunta
  const handleCreatePregunta = async () => {
    if (!question || !correctAnswer || incorrectAnswers.some((ans) => !ans)) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      let photoURL = null;
      if (photo) {
        const photoRef = ref(storage, `preguntas/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      await addDoc(collection(db, "preguntas"), {
        question,
        correctAnswer,
        incorrectAnswers,
        photo: photoURL,
        publicationDate: Timestamp.fromDate(new Date()),
        editDate: null,
        userId: auth.currentUser.uid,
      });

      alert("Pregunta creada exitosamente");
      loadPreguntas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear la pregunta:", error);
      alert("Hubo un error al crear la pregunta.");
    }
  };

  // Seleccionar una pregunta para editar
  const handleSelectPregunta = (pregunta) => {
    setSelectedPregunta(pregunta);
    setQuestion(pregunta.question);
    setCorrectAnswer(pregunta.correctAnswer);
    setIncorrectAnswers(pregunta.incorrectAnswers);
    setEditMode(true);
    setShowModal(true);
  };

  // Guardar cambios en la pregunta editada
  const handleSavePreguntaEdit = async () => {
    if (!selectedPregunta) return;

    try {
      const preguntaRef = doc(db, "preguntas", selectedPregunta.id);
      await updateDoc(preguntaRef, {
        question,
        correctAnswer,
        incorrectAnswers,
        editDate: Timestamp.fromDate(new Date()),
      });

      alert("Pregunta actualizada exitosamente");
      loadPreguntas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar la pregunta:", error);
      alert("Hubo un error al actualizar la pregunta.");
    }
  };

  // Eliminar una pregunta
  const handleDeletePregunta = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      try {
        await deleteDoc(doc(db, "preguntas", preguntaId));
        alert("Pregunta eliminada exitosamente");
        loadPreguntas();
      } catch (error) {
        console.error("Error al eliminar la pregunta:", error);
        alert("Hubo un error al eliminar la pregunta.");
      }
    }
  };

  // Cerrar modal y limpiar campos
  const handleCloseModal = () => {
    setSelectedPregunta(null);
    setQuestion("");
    setCorrectAnswer("");
    setIncorrectAnswers([""]);
    setPhoto(null);
    setEditMode(false);
    setShowModal(false);
  };

  // Manejar el cierre del modal al hacer clic fuera del contenido
  const handleOutsideClick = (e) => {
    if (e.target.className.includes("modal-background")) {
      setShowModal(false);
    }
  };

  // Agregar una alternativa incorrecta
  const addIncorrectAnswer = () => {
    setIncorrectAnswers([...incorrectAnswers, ""]);
  };

  // Eliminar una alternativa incorrecta
  const removeIncorrectAnswer = (index) => {
    const newAnswers = incorrectAnswers.filter((_, i) => i !== index);
    setIncorrectAnswers(newAnswers);
  };

  return (
    <div className="gestion-preguntas">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Preguntas</h2>
      <button onClick={() => setShowModal(true)} className="btn btn-primary mb-4">
        Agregar Nueva Pregunta
      </button>

      {/* Listado de preguntas */}
      <div className="overflow-x-auto">
        <table className="table w-full bg-base-100 shadow-lg rounded-lg dark:bg-base-300">
          <thead>
            <tr>
              <th>Pregunta</th>
              <th>Fecha de Publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {preguntas.map((pregunta) => (
              <tr key={pregunta.id} className="hover:bg-base-200 dark:hover:bg-base-400">
                <td>{pregunta.question}</td>
                <td>{pregunta.publicationDate.toDate().toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleSelectPregunta(pregunta)} className="btn btn-sm btn-ghost text-blue-500">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeletePregunta(pregunta.id)} className="btn btn-sm btn-ghost text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar pregunta */}
      {showModal && (
        <div
          className="modal modal-open modal-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleOutsideClick}
        >
          <div
            className="modal-box dark:bg-base-300 relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cierre en la esquina superior derecha */}
            <button
              className="absolute w-5 top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              onClick={handleCloseModal}
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">{editMode ? "Editar Pregunta" : "Nueva Pregunta"}</h3>
            <input
              type="text"
              placeholder="Pregunta"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="text"
              placeholder="Respuesta Correcta"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />

            {/* Alternativas incorrectas con opción para agregar/eliminar */}
            {incorrectAnswers.map((answer, index) => (
              <div key={index} className="flex items-center mb-3">
                <input
                  type="text"
                  placeholder={`Respuesta Incorrecta ${index + 1}`}
                  value={answer}
                  onChange={(e) =>
                    setIncorrectAnswers([
                      ...incorrectAnswers.slice(0, index),
                      e.target.value,
                      ...incorrectAnswers.slice(index + 1),
                    ])
                  }
                  className="input input-bordered w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <button
                  onClick={() => removeIncorrectAnswer(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FaMinus />
                </button>
              </div>
            ))}
            <button onClick={addIncorrectAnswer} className="btn btn-outline btn-secondary w-full mb-3">
              <FaPlus className="mr-2" /> Agregar Alternativa Incorrecta
            </button>

            <input
              type="file"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="file-input file-input-bordered mb-3 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            {editMode ? (
              <>
                <button onClick={handleSavePreguntaEdit} className="btn btn-primary w-full mb-3">
                  Guardar Cambios
                </button>
                <button onClick={handleCloseModal} className="btn btn-secondary w-full mb-3">
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={handleCreatePregunta} className="btn btn-primary w-full mb-3">
                Crear Pregunta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPreguntas;
