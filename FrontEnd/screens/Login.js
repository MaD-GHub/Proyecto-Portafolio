import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../firebase"; // Asegúrate de que la ruta sea correcta
import { signInWithEmailAndPassword } from "firebase/auth"; // Importa el método correcto de Firebase

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa ambos campos");
      return;
    }
    setLoading(true);
    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Usuario autenticado:", user.uid); // Verificar si el usuario fue autenticado

      // Redirigir a la pantalla Home después de un inicio de sesión exitoso
      navigation.navigate("HomeTabs");
    } catch (error) {
      Alert.alert("Error", error.message); // Mostrar el mensaje de error si algo falla
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#8f539b", "#d495ed"]} style={styles.container}>
      {/* Botón de regresar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("StartScreen")}
      >
        <Text style={styles.backButtonText}>⬅ Volver</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../assets/images/Logo_finawise.png")}
        style={styles.logo}
      />

      <Text className="text-white" style={styles.title}>
        Hola
      </Text>
      <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ddd"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ddd"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerLink}>
          No tienes una cuenta? Regístrate Ahora
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 18,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    color: "white",
  },
  forgotPassword: {
    textAlign: "right",
    color: "white",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#673072",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
  },
  registerLink: {
    textAlign: "center",
    color: "white",
    marginTop: 20,
  },
});
