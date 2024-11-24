import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaEdit, FaTrash, FaImage, FaTimes } from "react-icons/fa";

const GestionLecturas = () => {
  const [lecturas, setLecturas] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [review, setReview] = useState("");
  const [photos, setPhotos] = useState([]);
  const [selectedLectura, setSelectedLectura] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Cargar lecturas desde Firebase
  const loadLecturas = async () => {
    const lecturasSnapshot = await getDocs(collection(db, "lecturas"));
    const lecturasList = lecturasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLecturas(lecturasList);
  };

  useEffect(() => {
    loadLecturas();
  }, []);

  // Crear una nueva lectura recomendada
  const handleCreateLectura = async () => {
    if (!title || !author || !publicationDate || !review) {
      alert(
        "Los campos de título, autor, fecha de publicación y reseña son obligatorios."
      );
      return;
    }

    try {
      const photoUrls = [];
      if (photos.length > 0) {
        for (const photo of photos) {
          const photoRef = ref(storage, `lecturas/${Date.now()}_${photo.name}`);
          await uploadBytes(photoRef, photo);
          const photoURL = await getDownloadURL(photoRef);
          photoUrls.push(photoURL);
        }
      }

      await addDoc(collection(db, "lecturas"), {
        title,
        author,
        review,
        publicationDate: new Date(publicationDate),
        postDate: Timestamp.fromDate(new Date()),
        editDate: null,
        userId: auth.currentUser.uid,
        photos: photoUrls,
      });

      alert("Lectura recomendada creada exitosamente");
      loadLecturas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear la lectura:", error);
      alert("Hubo un error al crear la lectura.");
    }
  };

  // Seleccionar una lectura para editar
  const handleSelectLectura = (lectura) => {
    setSelectedLectura(lectura);
    setTitle(lectura.title);
    setAuthor(lectura.author);
    setPublicationDate(
      lectura.publicationDate.toDate().toISOString().split("T")[0]
    );
    setReview(lectura.review);
    setEditMode(true);
    setShowModal(true);
  };

  // Guardar cambios en la lectura editada
  const handleSaveLecturaEdit = async () => {
    if (!selectedLectura) return;

    try {
      const lecturaRef = doc(db, "lecturas", selectedLectura.id);
      await updateDoc(lecturaRef, {
        title,
        author,
        review,
        publicationDate: new Date(publicationDate),
        editDate: Timestamp.fromDate(new Date()),
      });

      alert("Lectura recomendada actualizada exitosamente");
      loadLecturas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar la lectura:", error);
      alert("Hubo un error al actualizar la lectura.");
    }
  };

  // Eliminar una lectura
  const handleDeleteLectura = async (lecturaId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta lectura recomendada?"
      )
    ) {
      try {
        await deleteDoc(doc(db, "lecturas", lecturaId));
        alert("Lectura eliminada exitosamente");
        loadLecturas();
      } catch (error) {
        console.error("Error al eliminar la lectura:", error);
        alert("Hubo un error al eliminar la lectura.");
      }
    }
  };

  // Cerrar modal y limpiar campos
  const handleCloseModal = () => {
    setSelectedLectura(null);
    setTitle("");
    setAuthor("");
    setPublicationDate("");
    setReview("");
    setPhotos([]);
    setEditMode(false);
    setShowModal(false);
  };

  // Manejar el cierre del modal al hacer clic fuera del contenido
  const handleOutsideClick = (e) => {
    if (e.target.className.includes("modal-background")) {
      setShowModal(false);
    }
  };

  // Manejar la selección de archivos y restringir a imágenes
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      alert("Solo se permiten archivos de imagen (JPEG, JPG, PNG).");
    }

    setPhotos(validFiles);
  };

  return (
    <div className="gestion-lecturas">
      <h2 className="text-2xl font-semibold mb-4">
        Gestión de Lecturas Recomendadas
      </h2>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-primary mb-4"
      >
        Agregar Nueva Lectura
      </button>

      {/* Listado de lecturas */}
      <div className="overflow-x-auto">
        <table className="table w-full bg-base-100 shadow-lg rounded-lg dark:bg-base-300">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Fecha de Publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lecturas.map((lectura) => (
              <tr
                key={lectura.id}
                className="hover:bg-base-200 dark:hover:bg-base-400"
              >
                <td>
                  <img
                    src={lectura.photos}
                    alt={lectura.title}
                    className="rounded-t-lg h-48 w-full object-cover"
                  />
                </td>
                <td>{lectura.title}</td>
                <td>{lectura.author}</td>
                <td>{lectura.publicationDate.toDate().toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleSelectLectura(lectura)}
                    className="btn btn-sm btn-ghost text-blue-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteLectura(lectura.id)}
                    className="btn btn-sm btn-ghost text-red-500"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar lectura */}
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

            <h3 className="text-xl font-semibold mb-4">
              {editMode ? "Editar Lectura" : "Nueva Lectura"}
            </h3>
            <label>Título</label>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <label>Autor</label>
            <input
              type="text"
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <label>Fecha de Publicación</label>
            <input
              type="date"
              placeholder="Fecha de Publicación del Libro"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <label>Reseña</label>
            <textarea
              placeholder="Reseña"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white h-32"
            ></textarea>
            <label>Fotos</label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="file-input file-input-bordered mb-3 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            {editMode ? (
              <>
                <button
                  onClick={handleSaveLecturaEdit}
                  className="btn btn-primary w-full mb-3"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary w-full mb-3"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateLectura}
                className="btn btn-primary w-full mb-3"
              >
                Crear Lectura
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionLecturas;
