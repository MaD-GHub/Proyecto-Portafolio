// ActualidadScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const NoHayNoticiaImage = require('../assets/Nonoticia.png'); // Importa la imagen de reemplazo

const ActualidadScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('Actualidad');
  const [newsType, setNewsType] = useState('Noticias'); // 'Noticias' o 'Valor Mercado'
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [otherNews, setOtherNews] = useState([]);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [newsPerPage, setNewsPerPage] = useState(5);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    if (selected === 'Actualidad') {
      if (newsType === 'Noticias') {
        fetchNews();
      } else {
        fetchMarketData();
      }
    }
  }, [selected, newsType]);

  useEffect(() => {
    // Actualiza las noticias mostradas cuando cambia 'otherNews' o 'newsPerPage'
    setDisplayedNews(otherNews.slice(0, newsPerPage));
  }, [otherNews, newsPerPage]);

  // Función para obtener las noticias de la API
  const fetchNews = async () => {
    setLoading(true);
    try {
      const apiKey = 'pub_558981038471f3f656bfac49834a162deb6af'; // Reemplaza con tu clave de API de NewsData.io
      const url = `https://newsdata.io/api/1/news?country=cl&category=business,technology&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('Datos recibidos de la API:', data);

      if (data.results && Array.isArray(data.results)) {
        let allNews = data.results;

        setNewsData(allNews);

        // Separar las noticias principales y las demás
        const topNewsItems = allNews.slice(0, 5); // Primeras 5 noticias para el carrusel
        const otherNewsItems = allNews.slice(5); // Resto de noticias

        setTopNews(topNewsItems);
        setOtherNews(otherNewsItems);

        // Restablecer las noticias mostradas
        setNewsPerPage(5);
        setDisplayedNews(otherNewsItems.slice(0, 5));
      } else if (data.errors) {
        // Manejar errores devueltos por la API
        const errorMessage = data.errors.join(', ');
        console.error('Error de la API:', errorMessage);
        Alert.alert('Error', `Error al obtener noticias: ${errorMessage}`);
        setNewsData([]);
        setTopNews([]);
        setOtherNews([]);
        setDisplayedNews([]);
      } else {
        const errorMessage = 'Error desconocido al obtener las noticias.';
        console.error('Error de la API:', errorMessage);
        Alert.alert('Error', `Error al obtener noticias: ${errorMessage}`);
        setNewsData([]);
        setTopNews([]);
        setOtherNews([]);
        setDisplayedNews([]);
      }
    } catch (error) {
      console.error('Error al obtener las noticias:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al obtener las noticias. Por favor, verifica tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener datos de mercado
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const url = `https://mindicador.cl/api`;
      const response = await fetch(url);
      const data = await response.json();

      console.log('Datos de mercado recibidos:', data);

      // Extraer los indicadores necesarios
      const marketDataArray = [
        {
          nombre: 'Unidad de Fomento (UF)',
          valor: data.uf.valor,
          fecha: data.uf.fecha,
          codigo: 'uf',
        },
        {
          nombre: 'Dólar Observado',
          valor: data.dolar.valor,
          fecha: data.dolar.fecha,
          codigo: 'dolar',
        },
        {
          nombre: 'Euro',
          valor: data.euro.valor,
          fecha: data.euro.fecha,
          codigo: 'euro',
        },
        {
          nombre: 'Bitcoin',
          valor: data.bitcoin.valor,
          fecha: data.bitcoin.fecha,
          codigo: 'bitcoin',
        },
      ];

      setMarketData(marketDataArray);
    } catch (error) {
      console.error('Error al obtener datos de mercado:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al obtener los datos de mercado. Por favor, verifica tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const newNewsPerPage = newsPerPage + 5;
    setNewsPerPage(newNewsPerPage);
    setDisplayedNews(otherNews.slice(0, newNewsPerPage));
  };

  const renderCarouselItem = ({ item }) => (
    <TouchableOpacity style={styles.carouselItem}>
      <ImageBackground
        source={item.image_url ? { uri: item.image_url } : NoHayNoticiaImage}
        style={styles.carouselImage}
      >
        <View style={styles.carouselOverlay}>
          <Text style={styles.carouselTitleText} numberOfLines={3}>
            {item.title}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={styles.newsItem}>
      <ImageBackground
        source={item.image_url ? { uri: item.image_url } : NoHayNoticiaImage}
        style={styles.newsImage}
      >
        <View style={styles.newsOverlay}>
          <Text style={styles.newsTitle}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderMarketItem = ({ item }) => (
    <View style={styles.marketItem}>
      <Text style={styles.marketName}>{item.nombre}</Text>
      <Text style={styles.marketValue}>{formatCurrency(item.valor)}</Text>
      <Text style={styles.marketDate}>Fecha: {formatDate(item.fecha)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={() => setSelected('Actualidad')}>
          <LinearGradient
            colors={selected === 'Actualidad' ? ['#511496', '#885fd8'] : ['#d3d3d3', '#d3d3d3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.toggleButton,
              selected === 'Actualidad' && styles.selectedButton,
            ]}
          >
            <Text style={[styles.toggleText, selected === 'Actualidad' && styles.selectedText]}>
              Actualidad
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelected('Educación')}>
          <LinearGradient
            colors={selected === 'Educación' ? ['#511496', '#885fd8'] : ['#d3d3d3', '#d3d3d3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.toggleButton,
              selected === 'Educación' && styles.selectedButton,
            ]}
          >
            <Text style={[styles.toggleText, selected === 'Educación' && styles.selectedText]}>
              Educación
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {selected === 'Actualidad' ? (
        <View style={styles.contentContainer}>
          {/* Toggle para tipo de contenido */}
          <View style={styles.newsTypeContainer}>
            <TouchableOpacity onPress={() => setNewsType('Noticias')}>
              <LinearGradient
                colors={newsType === 'Noticias' ? ['#511496', '#885fd8'] : ['#d3d3d3', '#d3d3d3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.toggleButton,
                  newsType === 'Noticias' && styles.selectedButton,
                ]}
              >
                <Text style={[styles.toggleText, newsType === 'Noticias' && styles.selectedText]}>
                  Noticias
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setNewsType('Valor Mercado')}>
              <LinearGradient
                colors={newsType === 'Valor Mercado' ? ['#511496', '#885fd8'] : ['#d3d3d3', '#d3d3d3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.toggleButton,
                  newsType === 'Valor Mercado' && styles.selectedButton,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    newsType === 'Valor Mercado' && styles.selectedText,
                  ]}
                >
                  Valor Mercado
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#673072" />
          ) : newsType === 'Noticias' ? (
            newsData.length === 0 ? (
              <View style={styles.noNewsContainer}>
                <Text style={styles.noNewsText}>
                  No hay noticias disponibles en este momento.
                </Text>
              </View>
            ) : (
              <>
                {/* Título ajustado */}
                <Text style={styles.mainNewsTitle}>Noticias Más Importantes</Text>

                <FlatList
                  data={topNews}
                  renderItem={renderCarouselItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  snapToAlignment="center"
                  decelerationRate="fast"
                  snapToInterval={width * 0.8 + 10}
                  contentContainerStyle={styles.carouselContainer}
                />

                <Text style={styles.sectionTitle}>Más Noticias</Text>
                <FlatList
                  data={displayedNews}
                  renderItem={renderNewsItem}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.newsList}
                />
                {displayedNews.length < otherNews.length && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={handleLoadMore}
                  >
                    <Text style={styles.loadMoreText}>Ver más</Text>
                  </TouchableOpacity>
                )}
              </>
            )
          ) : (
            // Mostrar datos de mercado
            <ScrollView contentContainerStyle={styles.marketList}>
              {marketData.map((item, index) => (
                <View key={index} style={styles.marketItem}>
                  <Text style={styles.marketName}>{item.nombre}</Text>
                  <Text style={styles.marketValue}>
                    {formatCurrency(item.valor)}
                  </Text>
                  <Text style={styles.marketDate}>
                    Fecha: {formatDate(item.fecha)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>Contenido de Educación</Text>
        </View>
      )}
    </View>
  );
};

// Función para formatear la moneda a CLP
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Función para formatear la fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  newsTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedButton: {
    borderColor: 'white',
  },
  toggleText: {
    color: '#6d6d6d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#673072',
    textAlign: 'center',
    marginTop: 20,
  },
  // Estilos para el carrusel
  carouselContainer: {
    paddingHorizontal: 10,
  },
  carouselItem: {
    width: width * 0.8,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 300, // Aumentamos la altura para mejorar la visibilidad
    justifyContent: 'center', // Centramos el contenido verticalmente
  },
  carouselOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center', // Centramos el contenido verticalmente
    alignItems: 'center', // Centramos el contenido horizontalmente
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  carouselTitleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Centramos el texto
  },
  // Título ajustado
  mainNewsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#511496',
    marginVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'left', // Alineamos el texto a la izquierda
  },
  // Estilos para la lista de noticias
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#511496',
    marginVertical: 10,
    paddingHorizontal: 10,
    textAlign: 'left', // Alineamos el texto a la izquierda
  },
  newsList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  newsItem: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  newsImage: {
    width: '100%',
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
  noNewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNewsText: {
    fontSize: 18,
    color: '#6d6d6d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadMoreButton: {
    backgroundColor: '#511496',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para los datos de mercado
  marketList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  marketItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  marketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#511496',
    marginBottom: 5,
  },
  marketValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  marketDate: {
    fontSize: 14,
    color: '#777',
  },
});

export default ActualidadScreen;
