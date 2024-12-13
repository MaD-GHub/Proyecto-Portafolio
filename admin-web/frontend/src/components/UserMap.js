import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { db } from '../firebase'; // Asegúrate de importar Firebase Firestore correctamente
import { collection, getDocs } from 'firebase/firestore';
import 'leaflet/dist/leaflet.css';
import personIcon from '../img/person-solid.svg'; // Asegúrate de que esta ruta sea correcta

// Personalizar el ícono del marcador
const customIcon = new L.Icon({
  iconUrl: personIcon, // Carga el icono correctamente
  iconSize: [25, 25],
  iconAnchor: [12, 24], // Alineación del icono para centrarse en el marcador
  popupAnchor: [0, -20],
});

const UserMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userLocations = usersSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (data.location && data.location.latitude && data.location.longitude) {
              return {
                id: doc.id,
                ...data.location,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                gender: data.gender,
              };
            }
            return null;
          })
          .filter((location) => location !== null); // Filtra los documentos sin ubicación
        setLocations(userLocations);
      } catch (error) {
        console.error('Error fetching user locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={[-33.45, -70.65]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <p><strong>Nombre:</strong> {location.firstName} {location.lastName}</p>
                <p><strong>Email:</strong> {location.email}</p>
                <p><strong>Género:</strong> {location.gender}</p>
                <p><strong>IP:</strong> {location.ipAddress}</p>
                <p><strong>Ciudad:</strong> {location.city}</p>
                <p><strong>Región:</strong> {location.region}</p>
                <p><strong>País:</strong> {location.country}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UserMap;
