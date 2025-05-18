import { View, Text, Button, StyleSheet, Alert,SafeAreaView,TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState  } from 'react';
import EntregasPendientes from '../Components/EntregasPendientes';
import HistorialEntregas from '../Components/HistorialEntregas';


const MainScreen = () => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [showEntregas, setShowEntregas] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [refreshEntregas, setRefreshEntregas] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
      setRefreshEntregas(prev => !prev); //Refresca la lista de entregas
    }, [])
  );

   useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('No autenticado', 'Por favor, inicia sesión.');
        navigation.replace('Login');
      }
    };
    checkAuthentication();
    
    const fetchUserName = async () => {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'Usuario');
    };
    fetchUserName();
    const getGreeting = () => {
      const now = new Date();
      // Hora de Buenos Aires (UTC-3)
      const hour = now.getUTCHours() - 3 < 0 ? now.getUTCHours() + 21 : now.getUTCHours() - 3;
      if (hour >= 6 && hour < 12) return '¡Buenos días';
      if (hour >= 12 && hour < 20) return '¡Buenas tardes';
      return '¡Buenas noches';
    };
    setGreeting(getGreeting());
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userName');
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/avatar.png')} 
            style={styles.avatar}
          />
          <Text style={styles.greeting}>{greeting} {userName}!</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.customButton} onPress={() => {setShowEntregas(true); setShowHistorial(false);}}>
            <Text style={styles.buttonText}>Ver Entregas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.customButton} onPress={() => {setShowEntregas(false); setShowHistorial(true);}}>
            <Text style={styles.buttonText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          {showEntregas && <EntregasPendientes refresh={refreshEntregas} />}
          {showHistorial && <HistorialEntregas />}
        </View>
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    padding: 20,
    paddingTop: 0, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  greeting: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'left', 
    marginTop: 0, 
    marginBottom: 0 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  customButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2d3a4b',
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#2d3a4b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutContainer: {
    width: '100%',
    marginTop: 'auto', 
    marginBottom: 20,  
  },
  logoutButton: {
     backgroundColor: '#fff',         
  borderRadius: 20,
  paddingVertical: 14,
  alignItems: 'center',
  borderWidth: 2,                  
  borderColor: '#black',  
  },
  logoutText: {
    color: '#black',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MainScreen;