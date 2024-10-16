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
  Modal,
  ScrollView,
} from 'react-native';
import * as Font from 'expo-font';
import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const NoHayNoticiaImage = require('../assets/Nonoticia.png');

const ActualidadScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Valor Mercado');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [modalVisible, setModalVisible] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0); // Contador para respuestas correctas
  const [showResult, setShowResult] = useState(false); // Mostrar el resultado del quiz

  // Términos financieros importantes
  const financialTerms = [
    { term: 'Activo', definition: 'Cualquier recurso con valor económico que una persona o empresa posee.' },
    { term: 'Pasivo', definition: 'Obligaciones financieras que una persona o empresa debe a otras.' },
    { term: 'Capital', definition: 'Dinero o activos que se utilizan para generar ingresos o invertir.' },
    { term: 'Tasa de interés', definition: 'El costo de pedir prestado dinero, generalmente expresado como un porcentaje anual.' },
    { term: 'Liquidez', definition: 'La facilidad con la que se puede convertir un activo en efectivo sin afectar su precio.' },
    { term: 'Riesgo', definition: 'La posibilidad de que ocurra una pérdida financiera.' },
    { term: 'Diversificación', definition: 'Estrategia de inversión que distribuye el capital en diferentes activos para minimizar riesgos.' },
    { term: 'Inversiones', definition: 'Colocación de capital en proyectos o activos con la expectativa de generar ganancias.' },
    { term: 'Ahorro', definition: 'Parte de los ingresos que no se consume y se reserva para usos futuros.' },
    { term: 'Deuda', definition: 'Cantidad de dinero que se debe a una entidad o individuo.' },
    { term: 'Flujo de caja', definition: 'Movimiento neto de efectivo dentro y fuera de una empresa o persona.' },
    { term: 'Crédito', definition: 'Capacidad de una persona o empresa para pedir prestado dinero.' },
    { term: 'Tasa de retorno', definition: 'Beneficio o ganancia obtenida de una inversión.' },
    { term: 'Presupuesto', definition: 'Plan financiero que estima ingresos y gastos para un período de tiempo.' },
    { term: 'Amortización', definition: 'Proceso de pagar una deuda en cuotas a lo largo del tiempo.' },
  ];

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
    } else if (selectedTab === 'Educación' && modalVisible === 'quizzes') {
      generateRandomQuiz();
    }
  }, [selectedTab, modalVisible]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mindicador.cl/api');
      const data = await response.json();
      setMarketData([
        { 
          name: 'UF', 
          value: data.uf.valor, 
          date: data.uf.fecha, 
          image: require('../assets/flags/chile.png') 
        },
        { 
          name: 'Dólar', 
          value: data.dolar.valor, 
          date: data.dolar.fecha, 
          image: require('../assets/flags/usa.png') 
        },
        { 
          name: 'Euro', 
          value: data.euro.valor, 
          date: data.euro.fecha, 
          image: require('../assets/flags/europe.png') 
        },
        { 
          name: 'Bitcoin', 
          value: data.bitcoin.valor, 
          date: data.bitcoin.fecha, 
          image: require('../assets/flags/bitcoin.png') 
        },
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
      const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&country=cl&category=business`);
      const data = await response.json();
      setNewsData(data.results);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar preguntas aleatorias
  const generateRandomQuiz = () => {
    const quizQuestions = [
      {
        question: '¿Qué es un activo?',
        options: ['Recurso económico', 'Deuda adquirida', 'Crédito a favor'],
        correctAnswer: 'Recurso económico',
      },
      {
        question: '¿Qué es un pasivo?',
        options: ['Deuda', 'Ingreso', 'Activo'],
        correctAnswer: 'Deuda',
      },
      {
        question: '¿Qué es el capital?',
        options: ['Inversiones', 'Dinero o activos', 'Deuda'],
        correctAnswer: 'Dinero o activos',
      },
      {
        question: '¿Qué es la tasa de interés?',
        options: ['Precio del dinero', 'Deuda adquirida', 'Inversión realizada'],
        correctAnswer: 'Precio del dinero',
      },
      {
        question: '¿Qué es la liquidez?',
        options: ['Capacidad de pago', 'Deuda', 'Facilidad para convertir a efectivo'],
        correctAnswer: 'Facilidad para convertir a efectivo',
      },
      {
        question: '¿Qué es el riesgo?',
        options: ['Pérdida financiera', 'Ganancia', 'Crédito solicitado'],
        correctAnswer: 'Pérdida financiera',
      },
      {
        question: '¿Qué es la diversificación?',
        options: ['Distribución de capital', 'Tener varios créditos', 'Deuda bancaria'],
        correctAnswer: 'Distribución de capital',
      },
    ];

    const shuffledQuestions = quizQuestions.sort(() => 0.5 - Math.random());
    setQuizData(shuffledQuestions.slice(0, 7));
  };

  const handleSelectOption = (questionIndex, selectedOption) => {
    const updatedQuizData = quizData.map((quiz, index) => {
      if (index === questionIndex) {
        return { ...quiz, selectedOption };
      }
      return quiz;
    });
    setQuizData(updatedQuizData);
  };

  // Manejar el envío de respuestas del quiz
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizData.forEach((quiz) => {
      if (quiz.selectedOption === quiz.correctAnswer) {
        correctCount++;
      }
    });
    setCorrectAnswers(correctCount);
    setShowResult(true);
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#511496" />;
  }

  // Renderiza los datos del mercado
  const renderMarketItem = ({ item, index }) => {
    const gradients = [
      ["#6A0DAD", "#F071A1"],
      ["#1FCAB1", "#348AC7"],
      ["#FF8A00", "#FF3D00"],
      ["#F071A1", "#6A0DAD"],
    ];

    return (
      <LinearGradient colors={gradients[index % gradients.length]} style={styles.marketCard}>
        <FontAwesome5 name="money-bill-wave" size={24} color="#fff" />
        <Text style={styles.marketName}>{item.name}</Text>
        <Text style={styles.marketValue}>${item.value.toFixed(2)}</Text>
        <Text style={styles.marketDate}>Fecha: {new Date(item.date).toLocaleDateString()}</Text>
      </LinearGradient>
    );
  };

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

  // Renderiza el contenido de Educación Financiera
  const renderEducationItem = ({ item, index }) => {
    const gradients = [
      ["#6A0DAD", "#F071A1"],
      ["#1FCAB1", "#348AC7"],
      ["#FF8A00", "#FF3D00"],
      ["#F071A1", "#6A0DAD"],
    ];

    return (
      <TouchableOpacity onPress={() => setModalVisible(item.title.toLowerCase())}>
        <LinearGradient colors={gradients[index % gradients.length]} style={[styles.educationCard]}>
          <MaterialIcons name={item.icon} size={40} color="white" />
          <Text style={styles.educationTitle}>{item.title}</Text>
          <Text style={styles.educationSubtitle}>{item.subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Datos para las tarjetas de educación financiera
  const educationData = [
    { title: 'Artículos', subtitle: 'Explora artículos sobre finanzas', icon: 'article' },
    { title: 'Vídeos', subtitle: 'Aprende con videos interactivos', icon: 'play-circle-outline' },
    { title: 'Quizzes', subtitle: 'Prueba tu conocimiento', icon: 'quiz' },
    { title: 'Glosario', subtitle: 'Términos financieros importantes', icon: 'book' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Actualidad</Text>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Valor Mercado' && styles.activeTab]}
          onPress={() => setSelectedTab('Valor Mercado')}
        >
          <Text style={[styles.tabText, selectedTab === 'Valor Mercado' && styles.activeTabText]}>Mercado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Noticias' && styles.activeTab]}
          onPress={() => setSelectedTab('Noticias')}
        >
          <Text style={[styles.tabText, selectedTab === 'Noticias' && styles.activeTabText]}>Noticias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Educación' && styles.activeTab]}
          onPress={() => setSelectedTab('Educación')}
        >
          <Text style={[styles.tabText, selectedTab === 'Educación' && styles.activeTabText]}>Educación</Text>
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

      {/* Modal para cada apartado de educación financiera */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible !== null}
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(null)}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.modalTitle}>{modalVisible?.charAt(0).toUpperCase() + modalVisible?.slice(1)}</Text>
              {modalVisible === 'glosario' && (
                financialTerms.map((term, index) => (
                  <View key={index} style={styles.termCard}>
                    <Text style={styles.termTitle}>{term.term}</Text>
                    <Text style={styles.termDefinition}>{term.definition}</Text>
                  </View>
                ))
              )}
              {modalVisible === 'quizzes' && quizData.length > 0 && (
                <>
                  {quizData.map((quiz, index) => (
                    <View key={index} style={styles.termCard}>
                      <Text style={styles.quizQuestion}>{quiz.question}</Text>
                      {quiz.options.map((option, optionIndex) => (
                        <TouchableOpacity
                          key={optionIndex}
                          style={[
                            styles.optionButton,
                            quiz.selectedOption === option && styles.selectedOptionButton,
                          ]}
                          onPress={() => handleSelectOption(index, option)}
                        >
                          <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
                    <Text style={styles.submitButtonText}>Enviar respuestas</Text>
                  </TouchableOpacity>
                  {showResult && (
                    <Text style={styles.resultText}>Respuestas correctas: {correctAnswers} de {quizData.length}</Text>
                  )}
                </>
              )}
              {modalVisible === 'quizzes' && quizData.length === 0 && (
                <Text style={styles.modalTitle}>No hay quizzes disponibles.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    padding: 10,
    elevation: 3,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  closeIcon: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'center',
  },
  termCard: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f4f9ff',
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  termTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#511496',
    marginBottom: 5,
  },
  termDefinition: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333',
  },
  quizQuestion: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#511496',
    marginBottom: 5,
  },
  optionButton: {
    backgroundColor: '#f4f9ff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOptionButton: {
    backgroundColor: '#6A0DAD',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#511496',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
  resultText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#511496',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ActualidadScreen;
