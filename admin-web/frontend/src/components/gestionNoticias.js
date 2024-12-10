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

const GestionNoticias = () => {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainSource, setMainSource] = useState(""); // Fuente principal
  const [additionalSources, setAdditionalSources] = useState([]); // Fuentes adicionales
  const [selectedNews, setSelectedNews] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  // Cargar noticias desde Firebase
  const loadNews = async () => {
    const newsSnapshot = await getDocs(collection(db, "news"));
    const newsList = newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNews(newsList);
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Crear una nueva noticia
  const handleCreateNews = async () => {
    if (
      !title ||
      !subtitle ||
      !content ||
      !mainPhoto ||
      !author ||
      !mainSource
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const photoRef = ref(storage, `news/${Date.now()}_${mainPhoto.name}`);
      await uploadBytes(photoRef, mainPhoto);
      const photoURL = await getDownloadURL(photoRef);

      await addDoc(collection(db, "news"), {
        title,
        subtitle,
        content,
        author,
        mainPhoto: photoURL,
        mainSource,
        additionalSources, // Guardar las fuentes adicionales
        publicationDate: Timestamp.fromDate(new Date()),
        editDate: null,
        userId: auth.currentUser.uid,
        creationDate: Timestamp.fromDate(new Date()),
      });

      alert("Noticia creada exitosamente");
      loadNews();
      setTitle("");
      setSubtitle("");
      setContent("");
      setAuthor("");
      setMainPhoto(null);
      setMainSource("");
      setAdditionalSources([]);
      setShowNewsModal(false);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      alert("Hubo un error al crear la noticia.");
    }
  };

  // Seleccionar una noticia para editar
  const handleSelectNews = (newsItem) => {
    setSelectedNews(newsItem);
    setTitle(newsItem.title);
    setSubtitle(newsItem.subtitle);
    setContent(newsItem.content);
    setAuthor(newsItem.author);
    setMainSource(newsItem.mainSource || "");
    setAdditionalSources(newsItem.additionalSources || []);
    setEditMode(true);
    setShowNewsModal(true);
  };

  // Eliminar noticia de Firebase
  const handleDeleteNews = async (newsId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
      try {
        await deleteDoc(doc(db, "news", newsId));
        alert("Noticia eliminada exitosamente");
        loadNews(); // Actualiza la lista de noticias después de eliminar
      } catch (error) {
        console.error("Error al eliminar noticia:", error);
        alert("Hubo un error al eliminar la noticia.");
      }
    }
  };

  // Remover fuentes antes de agregar noticia
  const removeSource = (index) => {
    setAdditionalSources((prevSources) =>
      prevSources.filter((_, i) => i !== index)
    );
  };

  // Añadir fuentes
  const addSource = () => {
    setAdditionalSources((prevSources) => [...prevSources, ""]);
  };

  // Guardar cambios en la noticia editada
  const handleSaveNewsEdit = async () => {
    if (!selectedNews) return;

    try {
      const newsRef = doc(db, "news", selectedNews.id);
      await updateDoc(newsRef, {
        title,
        subtitle,
        content,
        author,
        mainSource,
        additionalSources, // Actualizar las fuentes adicionales
        editDate: Timestamp.fromDate(new Date()),
      });

      alert("Noticia actualizada exitosamente");
      loadNews();
      setSelectedNews(null);
      setEditMode(false);
      setShowNewsModal(false);
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      alert("Hubo un error al actualizar la noticia.");
    }
  };

  // Agregar una nueva fuente
  const handleAddSource = () => {
    setAdditionalSources([...additionalSources, ""]);
  };

  // Eliminar una fuente adicional
  const handleRemoveSource = (index) => {
    const newSources = additionalSources.filter((_, i) => i !== index);
    setAdditionalSources(newSources);
  };

  // Actualizar el valor de una fuente adicional
  const handleSourceChange = (value, index) => {
    const newSources = [...additionalSources];
    newSources[index] = value;
    setAdditionalSources(newSources);
  };

  // Cerrar modal y limpiar estado relacionado
  const handleCloseModal = () => {
    setShowNewsModal(false);
    setSelectedNews(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setAuthor("");
    setMainPhoto(null);
    setMainSource("");
    setAdditionalSources([]); // Limpia las fuentes adicionales
  };

  // Manejar el cierre del modal al hacer clic fuera del contenido
  const handleOutsideClick = (e) => {
    if (e.target.className.includes("modal-background")) {
      handleCloseModal();
    }
  };

  return (
    <div className="gestion-noticias">
      <h2 className="text-2xl font-semibold mb-4">Gestión de Noticias</h2>
      <button
        className="btn btn-primary mb-6 flex items-center"
        onClick={() => {
          setEditMode(false);
          setShowNewsModal(true);
        }}
      >
        <FaPlus className="mr-2" /> Agregar Noticia
      </button>

      {/* Historial de noticias en formato de tarjetas */}
      <div className="main-content2">
        {/* Configuración de Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {news.map((n) => (
            <div
              key={n.id}
              className="card bg-base-100 shadow-lg rounded-lg dark:bg-base-300"
            >
              <img
                src={n.mainPhoto}
                alt={n.title}
                className="rounded-t-lg h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{n.subtitle}</p>
                <p className="text-sm mb-2">{n.content.substring(0, 100)}...</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleSelectNews(n)}
                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white mx-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(n.id)}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white mx-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar/editar noticia */}
      {showNewsModal && (
        <div
          className="modal modal-open modal-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleOutsideClick}
        >
          <div
            className="modal-box dark:bg-base-300 relative w-full max-w-5xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute w-5 top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              onClick={handleCloseModal}
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editMode ? "Editar Noticia" : "Nueva Noticia"}
            </h3>

            <div className="flex-1 overflow-y-auto">
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              <input
                type="text"
                placeholder="Subtítulo"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
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
                placeholder="Fuente Principal"
                value={mainSource}
                onChange={(e) => setMainSource(e.target.value)}
                className="input input-bordered w-full mb-3 bg-white dark:bg-gray-800 text-black dark:text-white"
              />

              <div className="mb-3">
                <h4 className="text-lg font-semibold mb-2">
                  Fuentes Adicionales
                </h4>
                {additionalSources.map((source, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      placeholder={`Fuente ${index + 1}`}
                      value={source}
                      onChange={(e) =>
                        handleSourceChange(e.target.value, index)
                      }
                      className="input input-bordered w-full bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeSource(index)}
                      className="btn btn-error btn-sm ml-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSource}
                  className="btn btn-primary btn-sm mt-2"
                >
                  <FaPlus className="mr-2" /> Agregar Fuente
                </button>
              </div>
            </div>

            {/* Contenedor de los botones en la parte inferior */}
            <div className="flex flex-col items-center mt-4 space-y-3">
              {editMode ? (
                <>
                  <button
                    onClick={handleSaveNewsEdit}
                    className="btn btn-primary w-full"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="btn btn-secondary w-full"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateNews}
                  className="btn btn-primary w-full"
                >
                  Crear Noticia
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver la imagen de la noticia */}
      {showImageModal && selectedNews && (
        <div
          className="modal modal-open modal-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleOutsideClick}
        >
          <div
            className="modal-box dark:bg-base-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              onClick={() => setShowImageModal(false)}
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              Imagen de la Noticia
            </h2>
            <img
              src={selectedNews.mainPhoto}
              alt="Imagen de la Noticia"
              className="w-full mb-4 rounded-md"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="btn btn-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionNoticias;
