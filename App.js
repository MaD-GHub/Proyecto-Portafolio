import * as React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import AhorroScreen from './screens/AhorroScreen';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20, // Ajusta la posición vertical del botón
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: '#8f539b',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#eeeeee',
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Ahorro') {
            iconName = focused ? 'piggy-bank' : 'piggy-bank-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Datos') {
            return <AntDesign name="linechart" size={size} color={color} />;
          } else if (route.name === 'Usuario') {
            return <AntDesign name="user" size={size} color={color} />;
          }
        },
        tabBarShowLabel: true, // Muestra las etiquetas debajo de los íconos
        tabBarActiveTintColor: '#8f539b',
        tabBarInactiveTintColor: '#6d6d6d',
        tabBarStyle: {
          position: 'absolute',
          bottom: 10,
          left: 16,
          right: 16,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 20,
          height: 90,
          paddingBottom: 10,
          shadowColor: '#7F5DF0',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'QuattrocentoSans-Regular', // Fuente aplicada a las etiquetas
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ahorro" component={AhorroScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Agregar"
        component={HomeScreen} // Pantalla que se abrirá al hacer clic en el botón central
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Text style={{ color: 'white', fontSize: 28 }}>+</Text>
            </CustomTabBarButton>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen name="Datos" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Usuario" component={HomeScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Ajusta el offset si es necesario
      >
        <HomeTabs />
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}
