import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mapa de regiones y comunas
const regionesYComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara", "Colchane", "Camiña"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Taltal", "Sierra Gorda", "Calama", "San Pedro de Atacama", "Ollagüe", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Huasco", "Alto del Carmen", "Freirina"],
  "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Los Vilos", "Salamanca", "Andacollo", "La Higuera", "Paiguano", "Vicuña"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "Quillota", "La Calera", "Nogales", "Hijuelas", "La Cruz", "Limache", "Olmué", "San Felipe", "Putaendo", "Santa María", "Llaillay", "Catemu", "Panquehue", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "Isla de Pascua", "Juan Fernández"],
  "Región Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor", "San Bernardo", "Buin"],
  "O'Higgins": ["Rancagua", "Machalí", "Graneros", "Doñihue", "Codegua", "Olivar", "Coinco", "Coltauco", "Quinta de Tilcoco", "Rengo", "Malloa", "Requínoa", "San Vicente", "Pichidegua", "Peumo", "Las Cabras", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Pumanque", "Santa Cruz", "Pichilemu", "Marchihue", "Navidad", "Litueche", "La Estrella"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Chillán Viejo", "El Carmen", "Pinto", "San Ignacio", "Coihueco", "San Carlos", "Ñiquén", "San Fabián", "Bulnes", "Quillón", "San Nicolás", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Treguaco", "Yungay", "Pemuco"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"],
  "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Llanquihue", "Los Muermos", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Puerto Natales", "Torres del Paine"],
};

const IncomeByCommuneGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("Todos");
  const [selectedCommunes, setSelectedCommunes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const transactionsCollection = collection(db, "transactions");

        // Obtener usuarios
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          region: doc.data().region,
          commune: doc.data().comuna,
        }));

        // Obtener transacciones de tipo "Ingreso"
        const transactionsQuery = query(transactionsCollection, where("type", "==", "Ingreso"));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactions = transactionsSnapshot.docs.map((doc) => doc.data());

        // Filtrar y calcular ingresos promedio por comuna
        const incomeByCommune = {};
        transactions.forEach((transaction) => {
          const user = users.find((u) => u.userId === transaction.userId);
          if (user && user.commune) {
            const commune = user.commune;
            if (!incomeByCommune[commune]) {
              incomeByCommune[commune] = { totalIncome: 0, count: 0 };
            }
            incomeByCommune[commune].totalIncome += transaction.amount;
            incomeByCommune[commune].count += 1;
          }
        });

        const labels = Object.keys(incomeByCommune);
        const data = Object.values(incomeByCommune).map(
          (item) => item.totalIncome / item.count
        );

        setChartData({
          labels,
          datasets: [
            {
              label: "Ingresos Promedio por Comuna (CLP)",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegionChange = (event) => {
    const region = event.target.value;
    setSelectedRegion(region);
    setSelectedCommunes([]); // Reset communes when region changes
  };

  const handleCommuneChange = (event) => {
    const communes = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedCommunes(communes);
  };

  const filteredData = () => {
    if (selectedRegion === "Todos" && selectedCommunes.length === 0) {
      return chartData;
    }

    const filteredLabels = chartData.labels.filter((label) => {
      const matchesRegion = selectedRegion === "Todos" || label.includes(selectedRegion);
      const matchesCommune = selectedCommunes.length === 0 || selectedCommunes.includes(label);
      return matchesRegion && matchesCommune;
    });

    const filteredDataset = chartData.datasets[0].data.filter((_, index) =>
      filteredLabels.includes(chartData.labels[index])
    );

    return {
      labels: filteredLabels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: filteredDataset,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Ingresos Promedio por Comuna",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Comuna",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Ingresos Promedio (CLP)",
        },
      },
    },
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="graph-container-analytics">
      <div className="filter-container">
        <label htmlFor="region">Selecciona la región:</label>
        <select id="region" onChange={handleRegionChange} value={selectedRegion}>
          <option value="Todos">Todas</option>
          {Object.keys(regionesYComunas).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <label htmlFor="commune">Selecciona las comunas:</label>
        <select
          id="commune"
          multiple
          onChange={handleCommuneChange}
          disabled={selectedRegion === "Todos"}
        >
          {(selectedRegion === "Todos" ? chartData.labels : regionesYComunas[selectedRegion] || []).map((commune) => (
            <option key={commune} value={commune}>
              {commune}
            </option>
          ))}
        </select>
      </div>

      <Bar data={filteredData()} options={options} />
    </div>
  );
};

export default IncomeByCommuneGraph;
