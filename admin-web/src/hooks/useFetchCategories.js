import { useState, useEffect } from "react";
import { fetchCategories } from "../services/categoryService";

const useFetchCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  return { categories, loading };
};

export default useFetchCategories;
