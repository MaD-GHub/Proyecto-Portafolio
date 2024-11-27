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
  Image,
} from 'react-native';
import * as Font from 'expo-font';
import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook de navegación
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import registerActivity from "../components/RegisterActivity";
import { auth } from "../firebase";

const { width } = Dimensions.get('window');
const NoHayNoticiaImage = require('../assets/Nonoticia.png');

const ActualidadScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Valor Mercado');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [bookData, setBookData] = useState([]);
  const [firebaseNewsData, setFirebaseNewsData] = useState([]); // Estado para las noticias de Firebase
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigation = useNavigation(); // Instancia de navegación
  const [articlesData, setArticlesData] = useState([]); // Lista de artículos
  const [selectedArticle, setSelectedArticle] = useState(null); // Artículo seleccionado
  const [glossaryData, setGlossaryData] = useState([]); // Lista de términos del glosario
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState(null); // Término seleccionado

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

  //Registrar actividad
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      registerActivity(user.uid, "navigate", { 
        screen: "ActualidadScreen",
        description: 'Usuario visita la página Actualidad', 
        });
    }
  }, []);

  const formatDate = (firebaseDate) => {
    if (!firebaseDate) return 'Fecha no disponible';
    const date = new Date(firebaseDate.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Cargar noticias desde Firebase
  const fetchNewsFromFirebase = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'news')); // Cambia 'news' al nombre de la colección en Firestore
      const newsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFirebaseNewsData(newsList); // Guardar noticias de Firebase en el estado correspondiente
    } catch (error) {
      console.error('Error fetching news from Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

// Cargar Articulos desde Firebase
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'articles')); // Cambia 'articles' al nombre de la colección en Firestore
      const articlesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticlesData(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  //cargar glosario desde firebase
  const fetchGlossary = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'glossary')); // Cambia 'glossary' al nombre de tu colección
      const glossaryList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGlossaryData(glossaryList);
    } catch (error) {
      console.error('Error fetching glossary terms:', error);
    } finally {
      setLoading(false);
    }
  };
  

  // Cargar datos del mercado
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
          image: require('../assets/flags/chile.png'),
        },
        {
          name: 'Dólar',
          value: data.dolar.valor,
          date: data.dolar.fecha,
          image: require('../assets/flags/usa.png'),
        },
        {
          name: 'Euro',
          value: data.euro.valor,
          date: data.euro.fecha,
          image: require('../assets/flags/europe.png'),
        },
        {
          name: 'Bitcoin',
          value: data.bitcoin.valor,
          date: data.bitcoin.fecha,
          image: require('../assets/flags/bitcoin.png'),
        },
      ]);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'lecturas'));
      const booksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookData(booksList);
    } catch (error) {
      console.error('Error fetching books from Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'Valor Mercado') {
      fetchMarketData();
    } else if (selectedTab === 'Noticias') {
      fetchNewsFromFirebase();
    } else if (selectedTab === 'Educación') {
      fetchBooks(); // Llama a la nueva función fetchBooks
    }
  }, [selectedTab]);

  useEffect(() => {
    if (modalVisible === 'artículos') {
      fetchArticles();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (modalVisible === 'glosario') {
      fetchGlossary();
    }
  }, [modalVisible]);
  

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#511496" />;
  }

  const openModal = (modalName) => {
    setModalVisible(modalName);
  };

  // Renderiza los datos del mercado
  const renderMarketItem = ({ item, index }) => {
    const gradients = [
      ['#6A0DAD', '#F071A1'],
      ['#1FCAB1', '#348AC7'],
      ['#FF8A00', '#FF3D00'],
      ['#F071A1', '#6A0DAD'],
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


// Renderiza cada noticia de Firebase
const renderFirebaseNewsItem = ({ item }) => (
  <TouchableOpacity 
    onPress={() => setSelectedNews(item)} // Abre el modal al seleccionar una noticia
    style={styles.newsCard}
  >
    <ImageBackground
      source={{ uri: item.mainPhoto || NoHayNoticiaImage }}
      style={styles.newsImage}
      imageStyle={{ borderRadius: 10 }}
    >
      <View style={styles.newsOverlay}>
        <Text style={styles.newsTitle}>{item.title}</Text>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

// Renderiza el contenido de Educación Financiera
const renderEducationItem = ({ item }) => (
  <TouchableOpacity
    onPress={() =>
      item.title === 'Lecturas Recomendadas'
        ? openModal('lecturas recomendadas')
        : openModal(item.title.toLowerCase())
    }
  >
    <LinearGradient
      colors={item.background}
      style={[styles.educationCard, styles.doubleWidth]}
    >
      <MaterialIcons name={item.icon} size={40} color="white" />
      <Text style={styles.educationTitle}>{item.title}</Text>
      <Text style={styles.educationSubtitle}>{item.subtitle}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Datos para las tarjetas de educación financiera
const educationData = [
  {
    title: 'Lecturas Recomendadas',
    subtitle: 'Explora lecturas esenciales',
    icon: 'library-books',
    background: ['#43a047', '#66bb6a'],
  },
  {
    title: 'Artículos',
    subtitle: 'Explora artículos sobre finanzas',
    icon: 'article',
    background: ['#6A0DAD', '#F071A1'],
  },
  {
    title: 'Glosario',
    subtitle: 'Términos financieros importantes',
    icon: 'book',
    background: ['#FF8A00', '#FF3D00'],
  },
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
          <>
            <FlatList
              data={firebaseNewsData.slice(0, 4)} // Mostrar las primeras 4 noticias de Firebase
              renderItem={renderFirebaseNewsItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.newsList}
              ListFooterComponent={<View style={{ height: 120 }} />}
            />
          </>
        )}

        {selectedTab === 'Educación' && (
          <>
            {/* Lecturas Recomendadas ocupa toda la fila superior */}
            <FlatList
              data={educationData}
              renderItem={renderEducationItem}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.educationList}
            />
          </>
        )}
      </>
    )}



    {/* Modal para cada apartado de educación financiera */}
<Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible !== null} // Muestra el modal si modalVisible tiene algún valor
  onRequestClose={() => setModalVisible(null)} // Cierra el modal al presionar fuera
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(null)}>
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.modalTitle}>
          {modalVisible?.charAt(0).toUpperCase() + modalVisible?.slice(1)}
        </Text>
        
        {/* Contenido del Glosario */}
        {modalVisible === 'glosario' &&
          glossaryData.map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.termItemContainer}
              onPress={() => setSelectedGlossaryTerm(term)} // Abre el modal de detalle del término
            >
              <View style={styles.termInfoContainer}>
                <Text style={styles.termWord}>{term.word}</Text>
                <Text style={styles.termDefinitionPreview}>
                  {term.definition.length > 50 ? `${term.definition.slice(0, 50)}...` : term.definition}
                </Text>
              </View>
            </TouchableOpacity>
          ))}


        {/* Contenido de Lecturas Recomendadas */}
        {modalVisible === 'lecturas recomendadas' &&
          bookData.map((book, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bookItemContainer}
              onPress={() => setSelectedBook(book)} // Al presionar, se abre el modal de detalle del libro
            >
              <Image
                source={{ uri: book.photos?.[0] || NoHayNoticiaImage }}
                style={styles.bookImage}
                resizeMode="contain"
              />
              <View style={styles.bookInfoContainer}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>Autor: {book.author}</Text>
                <Text style={styles.bookDate}>
                  Publicado: {new Date(book.publicationDate.seconds * 1000).toLocaleDateString('es-ES')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

        {/* Contenido de Artículos (si deseas incluir esta lógica) */}
        {modalVisible === 'artículos' &&
        articlesData.map((article, index) => (
          <TouchableOpacity
            key={index}
            style={styles.articleItemContainer}
            onPress={() => setSelectedArticle(article)} // Abre el modal de detalle del artículo
          >
            <Image
              source={{ uri: article.mainPhoto || NoHayNoticiaImage }}
              style={styles.articleImage}
              resizeMode="contain"
            />
            <View style={styles.articleInfoContainer}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleAuthor}>Autor: {article.author}</Text>
              <Text style={styles.articleDate}>
                Publicado: {new Date(article.publicationDate.seconds * 1000).toLocaleDateString('es-ES')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </View>
</Modal>


{/* DETALLES LIBROS :) */}
<Modal
  animationType="slide"
  transparent={true}
  visible={selectedBook !== null} // Mostrar el modal si hay un libro seleccionado
  onRequestClose={() => setSelectedBook(null)} // Cerrar modal al presionar fuera
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => setSelectedBook(null)} // Limpia el libro seleccionado al cerrar
      >
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagen del libro */}
        <Image
          source={{ uri: selectedBook?.photos?.[0] || NoHayNoticiaImage }}
          style={styles.modalImage}
          resizeMode="contain"
        />
        {/* Título del libro */}
        <Text style={styles.modalTitle}>{selectedBook?.title}</Text>
        {/* Autor */}
        <Text style={styles.modalAuthor}>Autor: {selectedBook?.author}</Text>
        {/* Fecha de publicación */}
        <Text style={styles.modalDate}>
          Publicado: {new Date(selectedBook?.publicationDate.seconds * 1000).toLocaleDateString('es-ES')}
        </Text>
        {/* Descripción */}
        <Text style={styles.modalContentText}>{selectedBook?.review}</Text>
      </ScrollView>
    </View>
  </View>
</Modal>


{/* DETALLES ARTICULOS :) */}
<Modal
  animationType="slide"
  transparent={true}
  visible={selectedArticle !== null} // Mostrar el modal si hay un artículo seleccionado
  onRequestClose={() => setSelectedArticle(null)} // Cerrar el modal al presionar fuera
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => setSelectedArticle(null)} // Limpia el artículo seleccionado al cerrar
      >
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagen principal */}
        <Image
          source={{ uri: selectedArticle?.mainPhoto || NoHayNoticiaImage }}
          style={styles.modalImage}
          resizeMode="contain"
        />
        {/* Título */}
        <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
        {/* Autor */}
        <Text style={styles.modalAuthor}>Autor: {selectedArticle?.author}</Text>
        {/* Fuente */}
        <Text style={styles.modalSource}>Fuente: {selectedArticle?.mainSource}</Text>
        {/* Fecha de publicación */}
        <Text style={styles.modalDate}>
          Publicado: {new Date(selectedArticle?.publicationDate.seconds * 1000).toLocaleDateString('es-ES')}
        </Text>
        {/* Contenido del artículo */}
        <Text style={styles.modalContentText}>{selectedArticle?.content}</Text>
      </ScrollView>
    </View>
  </View>
</Modal>



{/* Modal para mostrar el contenido de la noticia seleccionada */}
<Modal
  animationType="slide"
  transparent={true}
  visible={selectedNews !== null} // El modal está visible si hay una noticia seleccionada
  onRequestClose={() => setSelectedNews(null)} // Cerrar modal al presionar fuera de él
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => setSelectedNews(null)} // Al cerrar, establece selectedNews a null
      >
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: selectedNews?.mainPhoto || NoHayNoticiaImage }}
          style={styles.modalImage} // Imagen principal
        />
        <Text style={styles.modalTitle}>{selectedNews?.title}</Text>
        <Text style={styles.modalDate}>
          {formatDate(selectedNews?.publicationDate)}
        </Text>
        <Text style={styles.modalContentText}>{selectedNews?.content}</Text>
      </ScrollView>
    </View>
  </View>
</Modal>

<Modal
  animationType="slide"
  transparent={true}
  visible={selectedGlossaryTerm !== null} // Mostrar el modal si hay un término seleccionado
  onRequestClose={() => setSelectedGlossaryTerm(null)} // Cerrar el modal al presionar fuera
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => setSelectedGlossaryTerm(null)} // Limpia el término seleccionado al cerrar
      >
        <AntDesign name="close" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Palabra del glosario */}
        <Text style={styles.modalTitle}>{selectedGlossaryTerm?.word}</Text>
        {/* Definición */}
        <Text style={styles.modalDefinition}>{selectedGlossaryTerm?.definition}</Text>
        {/* Fecha de publicación */}
        <Text style={styles.modalDate}>
          Publicado: {new Date(selectedGlossaryTerm?.publicationDate.seconds * 1000).toLocaleDateString('es-ES')}
        </Text>
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
    width: '100%', // Asegura que ocupe el ancho completo
    alignItems: 'center',
  },
  doubleWidth: {
    width: '100%', // Este estilo ahora ocupa todo el ancho y se puede aplicar a cada elemento
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
  bookList: {
    padding: 10,
  },
  bookCard: {
    flexDirection: 'row', // Para que la imagen y texto se alineen de lado a lado
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  smallBookImage: {
    width: 50, // Tamaño adecuado para la imagen
    height: 70, // Ajustar la altura también
    borderRadius: 5,
    marginRight: 15, // Espacio entre la imagen y el texto
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center', // Centra el texto verticalmente
  },
  bookTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'left',
  },
  bookAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginTop: 5, // Añadir espacio entre el título y el autor
  },
  labelText: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#511496',
    textAlign: 'center',
    marginVertical: 10,
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalContentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingHorizontal: 10,
    textAlign: 'justify',
    marginBottom: 10,
  },
  bookDate: {
    fontFamily: 'Inter-Light',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  bookReview: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    textAlign: 'justify',
  },
  bookItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  bookImage: {
    width: 80,
    height: 100,
    borderRadius: 5,
    marginRight: 15,
  },
  bookInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  bookAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  bookDate: {
    fontFamily: 'Inter-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  articleItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  articleImage: {
    width: 80,
    height: 100,
    borderRadius: 5,
    marginRight: 15,
  },
  articleInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  articleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'left',
  },
  articleAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginTop: 5,
  },
  articleDate: {
    fontFamily: 'Inter-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  modalSource: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  termItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  termInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  termWord: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'left',
  },
  termDefinitionPreview: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    marginTop: 5,
  },
  modalDefinition: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
  },
  
});

export default ActualidadScreen;
