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
  SafeAreaView,
} from 'react-native';
import * as Font from 'expo-font';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient

const { width } = Dimensions.get('window');
const NoHayNoticiaImage = require('../assets/Nonoticia.png');

const ActualidadScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Valor Mercado');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Cargar fuentes personalizadas
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Inter-Bold': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        'Inter-Regular': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
        'Inter-Light': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (selectedTab === 'Valor Mercado') {
      fetchMarketData();
    } else if (selectedTab === 'Noticias') {
      fetchNews();
    }
  }, [selectedTab]);

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

  const fetchNews = async () => {
    setLoading(true);
    try {
      const apiKey = 'pub_558981038471f3f656bfac49834a162deb6af';
      const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&country=cl&category=business,technology`);
      const data = await response.json();
      setNewsData(data.results);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#511496" />;
  }

  // Renderiza los datos del mercado con gradiente
  const renderMarketItem = ({ item }) => (
    <LinearGradient colors={["#511496", "#885fd8"]} style={styles.marketCard}>
      <FontAwesome5 name="money-bill-wave" size={24} color="#fff" />
      <Text style={styles.marketName}>{item.name}</Text>
      <Text style={styles.marketValue}>${item.value.toFixed(2)}</Text>
      <Text style={styles.marketDate}>Fecha: {new Date(item.date).toLocaleDateString()}</Text>
    </LinearGradient>
  );

  // Renderiza cada noticia
  const renderNewsItem = ({ item }) => {
    const imageUrl = typeof item.image_url === 'string' ? item.image_url : null;

    return (
      <View style={styles.newsCard}>
        <ImageBackground
          source={imageUrl ? { uri: imageUrl } : NoHayNoticiaImage}
          style={styles.newsImage}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={styles.newsOverlay}>
            <Text style={styles.newsTitle}>{item.title}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  };

  // Renderiza el contenido de Educación Financiera con gradiente
  const renderEducationItem = ({ item }) => (
    <LinearGradient colors={["#511496", "#885fd8"]} style={[styles.educationCard]}>
      <MaterialIcons name={item.icon} size={40} color="white" />
      <Text style={styles.educationTitle}>{item.title}</Text>
      <Text style={styles.educationSubtitle}>{item.subtitle}</Text>
    </LinearGradient>
  );

  // Datos para las tarjetas de educación financiera
  const educationData = [
    { title: 'Artículos', subtitle: 'Explora artículos sobre finanzas', icon: 'article', backgroundColor: '#A5D6FF' },
    { title: 'Vídeos', subtitle: 'Aprende con videos interactivos', icon: 'play-circle-outline', backgroundColor: '#FFE599' },
    { title: 'Quizzes', subtitle: 'Prueba tu conocimiento', icon: 'quiz', backgroundColor: '#B2FAB4' },
    { title: 'Glosario', subtitle: 'Términos financieros importantes', icon: 'book', backgroundColor: '#FFC1E3' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Actualidad</Text>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Valor Mercado' && styles.activeTab]}
          onPress={() => setSelectedTab('Valor Mercado')}
        >
          <Text style={[styles.tabText, selectedTab === 'Valor Mercado' && styles.activeTabText]}>
            Mercado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Noticias' && styles.activeTab]}
          onPress={() => setSelectedTab('Noticias')}
        >
          <Text style={[styles.tabText, selectedTab === 'Noticias' && styles.activeTabText]}>
            Noticias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Educación' && styles.activeTab]}
          onPress={() => setSelectedTab('Educación')}
        >
          <Text style={[styles.tabText, selectedTab === 'Educación' && styles.activeTabText]}>
            Educación
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#511496" />
      ) : (
        <>
          {selectedTab === 'Valor Mercado' && (
            <FlatList
              data={marketData}
              renderItem={renderMarketItem}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.marketList}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListFooterComponent={<View style={{ height: 120 }} />}  
            />
          )}

          {selectedTab === 'Noticias' && (
            <FlatList
              data={newsData}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.newsList}
              ListFooterComponent={<View style={{ height: 120 }} />} 
            />
          )}

          {selectedTab === 'Educación' && (
            <FlatList
              data={educationData}
              renderItem={renderEducationItem}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.educationList}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ListFooterComponent={<View style={{ height: 120 }} />}  
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f9ff',
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    fontWeight: '900',
    color: '#511496',
    textAlign: 'center',
    marginVertical: 10,
    paddingTop: 25,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#ececec',
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#511496',
  },
  tabText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6d6d6d',
  },
  activeTabText: {
    color: 'white',
  },
  marketList: {
    padding: 10,
  },
  marketCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: (width / 2) - 20,
    alignItems: 'center',
  },
  marketName: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  marketValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  marketDate: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    color: '#ddd',
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
    fontFamily: 'Inter-Regular',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  educationList: {
    padding: 10,
  },
  educationCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: (width / 2) - 20,
    alignItems: 'center',
  },
  educationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  educationSubtitle: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});

export default ActualidadScreen;
