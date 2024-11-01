import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons'; // Íconos para darle un toque visual
import registerActivity from "../components/registerActivity";
import { auth } from "../firebase";


const { width } = Dimensions.get('window');

// ActualidadScreen: Página principal
const ActualidadScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Valor Mercado'); // Cambiar entre Noticias, Valor Mercado, Educación
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    if (selectedTab === 'Valor Mercado') {
      fetchMarketData();
    } else if (selectedTab === 'Noticias') {
      fetchNews();
    }
  }, [selectedTab]);

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "EducaciónScreen",
        description: 'Usuario visita la página de Educación.', 
        });
    }
  }, []);

  // Función para obtener datos de mercado
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mindicador.cl/api');
      const data = await response.json();
      setMarketData([
        { name: 'UF', value: data.uf.valor, date: data.uf.fecha },
        { name: 'Dólar', value: data.dolar.valor, date: data.dolar.fecha },
        { name: 'Euro', value: data.euro.valor, date: data.euro.fecha },
        { name: 'Bitcoin', value: data.bitcoin.valor, date: data.bitcoin.fecha },
      ]);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las noticias
  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://newsdata.io/api/1/news?apikey=your_api_key');
      const data = await response.json();
      setNewsData(data.results);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza cada dato financiero
  const renderMarketItem = ({ item }) => (
    <View style={styles.marketCard}>
      <FontAwesome5 name="money-bill-wave" size={24} color="#511496" />
      <Text style={styles.marketName}>{item.name}</Text>
      <Text style={styles.marketValue}>${item.value.toFixed(2)}</Text>
      <Text style={styles.marketDate}>Fecha: {new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  // Renderiza cada noticia en formato tarjeta
  const renderNewsItem = ({ item }) => (
    <View style={styles.newsCard}>
      <ImageBackground
        source={{ uri: item.image_url }}
        style={styles.newsImage}
        imageStyle={{ borderRadius: 10 }}
      >
        <View style={styles.newsOverlay}>
          <Text style={styles.newsTitle}>{item.title}</Text>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* Botones para cambiar entre Noticias y Valor Mercado */}
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Valor Mercado' && styles.activeTab]}
          onPress={() => setSelectedTab('Valor Mercado')}
        >
          <Text style={[styles.tabText, selectedTab === 'Valor Mercado' && styles.activeTabText]}>
            <FontAwesome5 name="chart-line" size={16} /> Mercado
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Noticias' && styles.activeTab]}
          onPress={() => setSelectedTab('Noticias')}
        >
          <Text style={[styles.tabText, selectedTab === 'Noticias' && styles.activeTabText]}>
            <FontAwesome5 name="newspaper" size={16} /> Noticias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Educación' && styles.activeTab]}
          onPress={() => setSelectedTab('Educación')}
        >
          <Text style={[styles.tabText, selectedTab === 'Educación' && styles.activeTabText]}>
            <FontAwesome5 name="book" size={16} /> Educación
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#511496" />
      ) : (
        <ScrollView>
          {/* Renderizar según la pestaña seleccionada */}
          {selectedTab === 'Valor Mercado' && (
            <FlatList
              data={marketData}
              renderItem={renderMarketItem}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.marketList}
            />
          )}
          {selectedTab === 'Noticias' && (
            <FlatList
              data={newsData}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.newsList}
            />
          )}
          {selectedTab === 'Educación' && (
            <View style={styles.educationContainer}>
              <Text>Contenido Educativo Próximamente</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tabButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#511496',
  },
  tabText: {
    color: '#6d6d6d',
  },
  activeTabText: {
    color: 'white',
  },
  marketList: {
    padding: 10,
  },
  marketCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  marketValue: {
    fontSize: 16,
    color: '#511496',
    marginTop: 5,
  },
  marketDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  newsList: {
    padding: 10,
  },
  newsCard: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  newsImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  newsOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  newsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  educationContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default ActualidadScreen;
