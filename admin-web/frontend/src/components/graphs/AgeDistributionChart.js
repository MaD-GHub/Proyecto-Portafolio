import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; // Usamos Chart.js para los gráficos
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Importa Firebase para acceder a la colección de usuarios

const AgeDistributionChart = () => {
  const [ageData, setAgeData] = useState([]);
  const [financialHealthFilter, setFinancialHealthFilter] = useState('all'); // Filtro por salud financiera
  const [ageRangeFilter, setAgeRangeFilter] = useState({ min: 14, max: 100 }); // Filtro por rango de edad
  const [filteredUsersCount, setFilteredUsersCount] = useState(0); // Contador de usuarios filtrados

  useEffect(() => {
    const fetchAgeData = async () => {
      // Inicializamos Firestore
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      // Filtramos los datos de los usuarios según el filtro de salud financiera
      const filteredUsers = usersSnapshot.docs.filter((doc) => {
        const financialHealth = doc.data().financialHealth;
        return financialHealthFilter === 'all' || financialHealth === financialHealthFilter;
      });

      // Contamos el número de usuarios después del filtro de salud financiera
      setFilteredUsersCount(filteredUsers.length);

      // Procesamos los datos para calcular las edades
      const userAges = filteredUsers.map((doc) => {
        const birthDate = doc.data().birthDate;
        const age = calculateAge(new Date(birthDate)); // Calculamos la edad a partir de birthDate
        return age;
      });

      // Filtrar las edades según el rango de edad seleccionado
      const filteredAges = userAges.filter(age => age >= ageRangeFilter.min && age <= ageRangeFilter.max);

      // Procesamos las edades individuales (de 14 a 100)
      const ageCounts = getAgeCounts(filteredAges);
      setAgeData(ageCounts);
    };

    fetchAgeData();
  }, [financialHealthFilter, ageRangeFilter]); // Dependemos de los filtros

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth();
    if (
      month < birthDate.getMonth() ||
      (month === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Función para contar los usuarios por cada edad entre 14 y 100
  const getAgeCounts = (ages) => {
    const ageCounts = Array(101).fill(0); // Creamos un array para edades de 0 a 100
    ages.forEach((age) => {
      if (age >= 14 && age <= 100) {
        ageCounts[age] += 1; // Incrementamos el conteo para la edad correspondiente
      }
    });
    return ageCounts.slice(14); // Devolvemos solo las edades de 14 a 100
  };

  // Preparamos los datos para el gráfico
  const chartData = {
    labels: Array.from({ length: 87 }, (_, i) => i + 14), // Las edades de 14 a 100
    datasets: [
      {
        label: "Número de usuarios por edad",
        data: ageData, // Datos procesados
        backgroundColor: "rgba(75,192,192,0.6)", // Color de las barras
        borderColor: "rgba(75,192,192,1)", // Color del borde de las barras
        borderWidth: 1,
      },
    ],
  };

  // Manejo del filtro de salud financiera
  const handleFinancialHealthChange = (e) => {
    setFinancialHealthFilter(e.target.value);
  };

  // Manejo del filtro de rango de edad
  const handleAgeRangeChange = (e) => {
    const { name, value } = e.target;
    setAgeRangeFilter(prevState => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2>Distribución de Usuarios por Edad</h2>

      <div className="filters" style={{ display: "flex", alignItems: "center" }}>
        {/* Filtros */}
        <div>
          <label>Filtrar por Salud Financiera:</label>
          <select onChange={handleFinancialHealthChange} value={financialHealthFilter}>
            <option value="all">Todos</option>
            <option value="muy_mal">Muy Mal</option>
            <option value="mal">Mal</option>
            <option value="media">Media</option>
            <option value="semimaxima">Semimaxima</option>
            <option value="maxima">Maxima</option>
          </select>
        </div>

        {/* Información adicional */}
        <div style={{ marginLeft: "20px", fontSize: "16px" }}>
          <p><strong>Total de usuarios filtrados:</strong> {filteredUsersCount}</p>
        </div>
      </div>

      {/* Gráfico de Distribución por Edad */}
      <div style={{ width: "700px", height: "500px" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Edad",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Número de Usuarios",
                },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AgeDistributionChart;
