import React, { useEffect, useState } from "react";
import { fetchCategories } from "../services/categoryService";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  return (
    <div>
      <h3>Lista de Categorías</h3>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <strong>{category.nombre}</strong> - {category.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
