import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { theme } from "../styles/theme";

const FinalizarEntregaScreen = ({ route, navigation }) => {
  const { entrega_id } = route.params;
  const { isDarkMode } = useTheme();
  const currentTheme = theme[isDarkMode ? "dark" : "light"];
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleFinalizar = () => {
    Keyboard.dismiss();
    if (!codigo.trim()) {
      setMensaje("Por favor, ingresa el código recibido por mail.");
      return;
    }
    setMensaje("");
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ["#1A1A2E", "#16213E", "#0F3460"]
          : ["#FFFFFF", "#F5F5F5", "#E8E8E8"]
      }
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "right", "left", "bottom"]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.primary}
          translucent
        />
        <View style={styles.container}>
          <Text style={[styles.title, { color: currentTheme.accent }]}>Finalizar Entrega</Text>
          <Text style={[styles.text, { color: currentTheme.text }]}>Para finalizar la entrega, ingresa el código a continuación que se te envió por correo electrónico.</Text>
          <TextInput
            style={[styles.input, { borderColor: currentTheme.cardBorder, color: currentTheme.text }]}
            placeholder="Código de finalización"
            placeholderTextColor={currentTheme.placeholder}
            value={codigo}
            onChangeText={setCodigo}
            keyboardType="default"
            autoCapitalize="none"
            editable={!enviado}
          />
          {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: currentTheme.accent, opacity: enviado ? 0.6 : pressed ? 0.8 : 1 },
            ]}
            onPress={handleFinalizar}
            disabled={enviado}
          >
            <Text style={styles.buttonText}>{enviado ? "Finalizando..." : "Finalizar Entrega"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    backgroundColor: "#fff8",
  },
  mensaje: {
    color: "#E94057",
    marginBottom: 12,
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FinalizarEntregaScreen; 