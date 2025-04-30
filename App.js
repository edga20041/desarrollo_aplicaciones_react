import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Button } from 'react-native';

export default function App() {
  const handleRegister = () => {
    console.log('Registrarse presionado');
    // Navegación o acción futura
  };

  const handleLogin = () => {
    console.log('Iniciar sesión presionado');
    // Navegación o acción futura
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Registrarse" onPress={handleRegister} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Iniciar sesión" onPress={handleLogin} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
    width: 200, // Ancho fijo para los botones
  },
});

