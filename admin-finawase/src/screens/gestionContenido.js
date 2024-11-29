// src/screens/gestionContenido.js
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import withAdminAuth from "../components/withAdminAuth";
import "../index.css";

const GestionContenido = () => {
  // Estados para noticias
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mainSource, setMainSource] = useState("");
  const [sources, setSources] = useState("");
  const [mainPhoto, setMainPhoto] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Estados para anuncios
  const [announcements, setAnnouncements] = useState([]);
  const [announcementContent, setAnnouncementContent] = useState("");

  // Cargar noticias desde Firebase
  const loadNews = async () => {
    const newsSnapshot = await getDocs(collection(db, "news"));
    const newsList = newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNews(newsList);
  };

  // Cargar anuncios desde Firebase
  const loadAnnouncements = async () => {
    const announcementsSnapshot = await getDocs(
      collection(db, "announcements")
    );
    const announcementsList = announcementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAnnouncements(announcementsList);
  };

  useEffect(() => {
    loadNews();
    loadAnnouncements();
  }, []);

  // Manejar la creación de una noticia
  const handleCreateNews = async () => {
    if (!title || !content || !mainPhoto) {
      alert("El título, contenido y foto principal son obligatorios");
      return;
    }

    try {
      // Subir la foto a Firebase Storage
      const photoRef = ref(storage, `news/${Date.now()}_${mainPhoto.name}`);
      await uploadBytes(photoRef, mainPhoto);
      const photoURL = await getDownloadURL(photoRef);

      // Crear el documento en Firebase Firestore
      await addDoc(collection(db, "news"), {
        title,
        content,
        mainSource,
        sources: sources.split(",").map((source) => source.trim()), // Separar múltiples fuentes
        mainPhoto: photoURL,
        publicationDate: Timestamp.fromDate(new Date()),
      });

      alert("Noticia creada exitosamente");
      loadNews(); // Recargar las noticias
      setTitle("");
      setContent("");
      setMainSource("");
      setSources("");
      setMainPhoto(null);
    } catch (error) {
      console.error("Error al crear noticia:", error); // Imprimir error detallado
      alert("Hubo un error al crear la noticia: " + error.message);
    }
  };

  // Manejar la creación de un anuncio
  const handleCreateAnnouncement = async () => {
    if (!announcementContent) {
      alert("El contenido del anuncio es obligatorio");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        content: announcementContent,
        date: Timestamp.fromDate(new Date()),
      });

      alert("Anuncio creado exitosamente");
      loadAnnouncements(); // Recargar los anuncios
      setAnnouncementContent("");
    } catch (error) {
      console.error("Error al crear anuncio:", error);
      alert("Hubo un error al crear el anuncio");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className={`main-content ${isExpanded ? "expanded" : "collapsed"}`}>
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          Gestión de Contenido
        </h1>

        {/* Sección de Noticias */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Noticias</h2>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mb-3"
          />
          <textarea
            placeholder="Contenido"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field mb-3 mx-auto w-full"
          ></textarea>
          <input
            type="text"
            placeholder="Fuente principal"
            value={mainSource}
            onChange={(e) => setMainSource(e.target.value)}
            className="input-field mb-3"
          />
          <input
            type="text"
            placeholder="Otras fuentes (separadas por comas)"
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            className="input-field mb-3"
          />
          <input
            type="file"
            onChange={(e) => setMainPhoto(e.target.files[0])}
            className="mb-3"
          />
          <button onClick={handleCreateNews} className="btn-primary mb-3">
            Crear Noticia
          </button>

          {/* Listado de Noticias */}
          <h3 className="text-xl font-semibold mb-2">Lista de Noticias</h3>
          <ul>
            {news.map((n) => (
              <li key={n.id} className="p-2 border-b border-gray-300">
                <strong>{n.title}</strong> -{" "}
                {n.publicationDate.toDate().toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>

        {/* Sección de Anuncios */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Anuncios</h2>
          <textarea
            placeholder="Contenido del anuncio"
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            className="input-field mb-3 mx-auto w-full"
          ></textarea>
          <button
            onClick={handleCreateAnnouncement}
            className="btn-primary mb-3"
          >
            Crear Anuncio
          </button>

          {/* Listado de Anuncios */}
          <h3 className="text-xl font-semibold mb-2">Lista de Anuncios</h3>
          <ul>
            {announcements.map((a) => (
              <li key={a.id} className="p-2 border-b border-gray-300">
                {a.content} - {a.date.toDate().toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(GestionContenido);
