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
import { FaEdit, FaTrash, FaImage, FaPlus, FaTimes } from "react-icons/fa";

const GestionArticulos = () => {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainSource, setMainSource] = useState(""); // Fuente principal
  const [additionalSources, setAdditionalSources] = useState([]); // Fuentes adicionales
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);

  // Cargar artículos desde Firebase
  const loadArticles = async () => {
    const articlesSnapshot = await getDocs(collection(db, "articles"));
    const articlesList = articlesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setArticles(articlesList);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Crear un nuevo artículo
  const handleCreateArticle = async () => {
    if (!title || !description || !content || !mainPhoto || !author || !mainSource) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const photoRef = ref(storage, `articles/${Date.now()}_${mainPhoto.name}`);
      await uploadBytes(photoRef, mainPhoto);
      const photoURL = await getDownloadURL(photoRef);

      await addDoc(collection(db, "articles"), {
        title,
        description,
        content,
        author,
        mainPhoto: photoURL,
        mainSource,
        additionalSources,
        publicationDate: Timestamp.fromDate(new Date()),
        editDate: null,
        userId: auth.currentUser.uid,
        creationDate: Timestamp.fromDate(new Date()),
      });

      alert("Artículo creado exitosamente");
      loadArticles();
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear artículo:", error);
      alert("Hubo un error al crear el artículo.");
    }
  };

  // Seleccionar un artículo para editar
  const handleSelectArticle = (articleItem) => {
    setSelectedArticle(articleItem);
    setTitle(articleItem.title);
    setDescription(articleItem.description);
    setContent(articleItem.content);
    setAuthor(articleItem.author);
    setMainSource(articleItem.mainSource || "");
    setAdditionalSources(articleItem.additionalSources || []);
    setEditMode(true);
    setShowArticleModal(true);
  };

  // Eliminar un artículo
  const handleDeleteArticle = async (articleId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      try {
        await deleteDoc(doc(db, "articles", articleId));
        alert("Artículo eliminado exitosamente");
        loadArticles();
      } catch (error) {
        console.error("Error al eliminar artículo:", error);
        alert("Hubo un error al eliminar el artículo.");
      }
    }
  };

  // Guardar cambios en el artículo editado
  const handleSaveArticleEdit = async () => {
    if (!selectedArticle) return;

    try {
      const articleRef = doc(db, "articles", selectedArticle.id);
      await updateDoc(articleRef, {
        title,
        description,
        content,
        author,
        mainSource,
        additionalSources,
        editDate: Timestamp.fromDate(new Date()),
      });

      alert("Artículo actualizado exitosamente");
      loadArticles();
      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar artículo:", error);
      alert("Hubo un error al actualizar el artículo.");
    }
  };

  // Limpiar el formulario y cerrar el modal
  const handleCloseModal = () => {
    setSelectedArticle(null);
    setTitle("");
    setDescription("");
    setContent("");
    setAuthor("");
    setMainPhoto(null);
    setMainSource("");
    setAdditionalSources([]);
    setEditMode(false);
    setShowArticleModal(false);
  };

  // Manejar el cierre del modal al hacer clic fuera del contenido
  const handleOutsideClick = (e) => {
    if (e.target.className.includes("modal-background")) {
      setShowArticleModal(false);
    }
  };

  // Agregar una nueva fuente adicional
  const addSource = () => {
    setAdditionalSources([...additionalSources, ""]);
  };

  // Remover una fuente adicional
  const removeSource = (index) => {
    setAdditionalSources((prevSources) =>
      prevSources.filter((_, i) => i !== index)
    );
  };

  // Manejar cambios en una fuente adicional
  const handleSourceChange = (value, index) => {
    const newSources = [...additionalSources];
    newSources[index] = value;
    setAdditionalSources(newSources);
  };

  return (
    <div className="gestion-articulos">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Artículos</h2>
      <button
        className="btn btn-primary mb-6 flex items-center"
        onClick={() => {
          setEditMode(false);
          setShowArticleModal(true);
        }}
      >
        <FaPlus className="mr-2" /> Agregar Artículo
      </button>

      {/* Lista de artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <div
            key={a.id}
            className="card bg-base-100 shadow-lg rounded-lg dark:bg-base-300"
          >
            <img
              src={a.mainPhoto}
              alt={a.title}
              className="rounded-t-lg h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{a.description}</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleSelectArticle(a)}
                  className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white mx-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteArticle(a.id)}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white mx-2"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar/editar artículo */}
      {showArticleModal && (
        <div
        className="modal modal-open modal-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={handleOutsideClick}
        >
          <div className="modal-box dark:bg-base-300 relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* Botón de cierre en la esquina superior derecha */}
            <button
              className="absolute w-5 top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              onClick={handleCloseModal}
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editMode ? "Editar Artículo" : "Nuevo Artículo"}
            </h3>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white h-24"
            ></textarea>
            <textarea
              placeholder="Contenido"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white h-48"
            ></textarea>
            <input
              type="text"
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="file"
              onChange={(e) => setMainPhoto(e.target.files[0])}
              className="file-input file-input-bordered mb-3 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <input
              type="text"
              placeholder="Fuente principal"
              value={mainSource}
              onChange={(e) => setMainSource(e.target.value)}
              className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
            <h4 className="text-md font-semibold mb-2">Fuentes adicionales:</h4>
            {additionalSources.map((source, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={source}
                  onChange={(e) => handleSourceChange(e.target.value, index)}
                  className="input input-bordered flex-1 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <button
                  className="btn btn-error btn-xs ml-2"
                  onClick={() => removeSource(index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              className="btn btn-secondary mb-3 flex items-center"
              onClick={addSource}
            >
              <FaPlus className="mr-2" /> Agregar Fuente
            </button>
            <button
              className={`btn btn-${
                editMode ? "success" : "primary"
              } w-full mt-3`}
              onClick={editMode ? handleSaveArticleEdit : handleCreateArticle}
            >
              {editMode ? "Guardar Cambios" : "Crear Artículo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionArticulos;
