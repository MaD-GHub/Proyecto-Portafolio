// src/screens/Categorias.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, setDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import withAdminAuth from "../components/withAdminAuth";
import { FaTrash, FaEdit } from "react-icons/fa";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState({ id: "", nombre: "", descripcion: "" });
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [categoriaEditada, setCategoriaEditada] = useState({ nombre: "", descripcion: "" });

  const cargarCategorias = async () => {
    try {
      const categoriasCollection = collection(db, "categorias");
      const categoriasSnapshot = await getDocs(categoriasCollection);
      const categoriasList = categoriasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategorias(categoriasList);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const agregarCategoria = async () => {
    try {
      const categoriaRef = doc(db, "categorias", nuevaCategoria.id);
      await setDoc(categoriaRef, { nombre: nuevaCategoria.nombre, descripcion: nuevaCategoria.descripcion });
      setNuevaCategoria({ id: "", nombre: "", descripcion: "" });
      cargarCategorias();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      await deleteDoc(doc(db, "categorias", id));
      cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  const actualizarCategoria = async () => {
    try {
      await updateDoc(doc(db, "categorias", editandoCategoria.id), categoriaEditada);
      setEditandoCategoria(null);
      setCategoriaEditada({ nombre: "", descripcion: "" });
      cargarCategorias();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  return (
    <div className="dashboard-container flex flex-col lg:flex-row">
      <Sidebar />

      <div className="main-content p-6 w-full">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Administración de Categorías
        </h1>

        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="ID de la categoría"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mr-2"
            value={nuevaCategoria.id}
            onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, id: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nombre de la categoría"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mr-2"
            value={nuevaCategoria.nombre}
            onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descripción de la categoría"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mr-2"
            value={nuevaCategoria.descripcion}
            onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })}
          />
          <button
            className="btn btn-primary bg-purple-500 hover:bg-purple-700 text-white"
            onClick={agregarCategoria}
          >
            Agregar
          </button>
        </div>

        <div className="card bg-base-100 shadow-lg mt-6 p-6">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">No se encontraron categorías</td>
                </tr>
              ) : (
                categorias.map((categoria) => (
                  <tr key={categoria.id} className="border-b">
                    <td className="px-6 py-4">{categoria.id}</td>
                    <td className="px-6 py-4">
                      {editandoCategoria && editandoCategoria.id === categoria.id ? (
                        <input
                          type="text"
                          value={categoriaEditada.nombre}
                          onChange={(e) => setCategoriaEditada({ ...categoriaEditada, nombre: e.target.value })}
                          className="input input-bordered w-full"
                        />
                      ) : (
                        categoria.nombre
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editandoCategoria && editandoCategoria.id === categoria.id ? (
                        <input
                          type="text"
                          value={categoriaEditada.descripcion}
                          onChange={(e) => setCategoriaEditada({ ...categoriaEditada, descripcion: e.target.value })}
                          className="input input-bordered w-full"
                        />
                      ) : (
                        categoria.descripcion
                      )}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      {editandoCategoria && editandoCategoria.id === categoria.id ? (
                        <button
                          className="btn btn-primary bg-purple-500 hover:bg-purple-700 text-white"
                          onClick={actualizarCategoria}
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setEditandoCategoria(categoria);
                            setCategoriaEditada({ nombre: categoria.nombre, descripcion: categoria.descripcion });
                          }}
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button className="text-red-500 hover:text-red-700" onClick={() => eliminarCategoria(categoria.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Categorias);
