// utils/utils.js

// Función para formatear fecha en formato legible
export const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Fecha inválida";
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return parsedDate.toLocaleDateString("es-CL", options);
  };
  
  // Función para formatear a CLP
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Función para obtener la fecha de hoy
  export const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  