// src/components/GestionGlosario.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const GestionGlosario = () => {
  const [glossary, setGlossary] = useState([]);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [source, setSource] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);

  // Cargar entradas del glosario desde Firebase
  const loadGlossary = async () => {
    const glossarySnapshot = await getDocs(collection(db, "glossary"));
    const glossaryList = glossarySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGlossary(glossaryList);
  };

  useEffect(() => {
    loadGlossary();
  }, []);

  // Crear una nueva entrada en el glosario
  const handleCreateEntry = async () => {
    if (!word || !definition) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, "glossary"), {
        word,
        definition,
        source: source || null,
        sourceLink: sourceLink || null,
        userId: auth.currentUser.uid,
        publicationDate: Timestamp.fromDate(new Date()),
      });

      alert("Entrada creada exitosamente.");
      loadGlossary();
      setWord("");
      setDefinition("");
      setSource("");
      setSourceLink("");
      setShowGlossaryModal(false);
    } catch (error) {
      console.error("Error al crear entrada:", error);
      alert("Hubo un error al crear la entrada.");
    }
  };

  // Seleccionar una entrada para editar
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setWord(entry.word);
    setDefinition(entry.definition);
    setSource(entry.source || "");
    setSourceLink(entry.sourceLink || "");
    setEditMode(true);
    setShowGlossaryModal(true);
  };

  // Guardar cambios en una entrada editada
  const handleSaveEntryEdit = async () => {
    if (!selectedEntry) return;

    try {
      const entryRef = doc(db, "glossary", selectedEntry.id);
      await updateDoc(entryRef, {
        word,
        definition,
        source,
        sourceLink,
        editDate: Timestamp.fromDate(new Date()),
      });

      alert("Entrada actualizada exitosamente.");
      loadGlossary();
      setSelectedEntry(null);
      setEditMode(false);
      setShowGlossaryModal(false);
    } catch (error) {
      console.error("Error al actualizar entrada:", error);
      alert("Hubo un error al actualizar la entrada.");
    }
  };

  // Eliminar una entrada
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta entrada?")) {
      try {
        await deleteDoc(doc(db, "glossary", entryId));
        alert("Entrada eliminada exitosamente.");
        loadGlossary();
      } catch (error) {
        console.error("Error al eliminar entrada:", error);
        alert("Hubo un error al eliminar la entrada.");
      }
    }
  };

  // Filtrar el glosario por término de búsqueda
  const filteredGlossary = glossary.filter((entry) =>
    entry.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="gestion-glosario p-6">
      <h2 className="text-2xl font-semibold mb-4">Gestión del Glosario</h2>

      <div className="mb-6">
        <div className="form-control w-full max-w-md mb-4">
          <label className="label">
            <span className="label-text">Buscar palabra</span>
          </label>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <button
          className="btn btn-primary flex items-center"
          onClick={() => {
            setEditMode(false);
            setShowGlossaryModal(true);
          }}
        >
          <FaPlus className="mr-2" /> Agregar Palabra
        </button>
      </div>

      {/* Lista de entradas en formato de tabla */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Palabra</th>
              <th>Definición</th>
              <th>Fuente</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGlossary.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.word}</td>
                <td>{entry.definition}</td>
                <td>{entry.source || "N/A"}</td>
                <td>
                  {entry.publicationDate
                    ? entry.publicationDate.toDate().toLocaleString()
                    : "No disponible"}
                </td>
                <td>
                  <button
                    onClick={() => handleSelectEntry(entry)}
                    className="btn btn-sm btn-ghost text-green-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
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

      {/* Modal para agregar/editar una entrada */}
      {showGlossaryModal && (
        <div
          className="modal modal-open modal-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target.className.includes("modal-background")) {
              setShowGlossaryModal(false);
            }
          }}
        >
          <div
            className="modal-box relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute w-5 top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={() => setShowGlossaryModal(false)}
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {editMode ? "Editar Palabra" : "Nueva Palabra"}
            </h3>
            <input
              type="text"
              placeholder="Palabra"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            <textarea
              placeholder="Definición"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 h-32"
            ></textarea>
            <input
              type="text"
              placeholder="Fuente (opcional)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            <input
              type="text"
              placeholder="Enlace de la fuente (opcional)"
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            {editMode ? (
              <button
                onClick={handleSaveEntryEdit}
                className="btn btn-primary w-full"
              >
                Guardar Cambios
              </button>
            ) : (
              <button
                onClick={handleCreateEntry}
                className="btn btn-primary w-full"
              >
                Crear Entrada
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionGlosario;
