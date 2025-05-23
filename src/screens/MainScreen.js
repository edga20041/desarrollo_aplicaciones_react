import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
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
      setRefreshEntregas(prev => !prev);
    }, [])
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
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
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
    }
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" translucent />
        <View style={styles.container}>
          <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
          source={require('../../assets/avatar.png')}
          style={styles.avatar}
           />
          </TouchableOpacity>
            <Text style={styles.greeting}>
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>{greeting}</Text>
              <Text style={{ color: '#F27121' }}> {userName}!</Text>
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.customButton, showEntregas && styles.activeButton]}
              onPress={() => {
                setShowEntregas(true);
                setShowHistorial(false);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={showEntregas ? ['#E94057', '#F27121'] : ['#fff', '#fff']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buttonText, showEntregas && { color: '#fff' }]}>Ver Entregas</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customButton, showHistorial && styles.activeButton]}
              onPress={() => {
                setShowEntregas(false);
                setShowHistorial(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={showHistorial ? ['#E94057', '#F27121'] : ['#fff', '#fff']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buttonText, showHistorial && { color: '#fff' }]}>Ver Historial</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.fragmentContainer}>
            {showEntregas && <EntregasPendientes refresh={refreshEntregas} />}
            {showHistorial && <HistorialEntregas />}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#2d3a4b22',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
    gap: 10,
  },
  customButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#2d3a4b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activeButton: {
    elevation: 4,
    shadowOpacity: 0.18,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {
    color: '#2d3a4b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fragmentContainer: {
    flex: 1,
    width: '100%',
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
    borderColor: '#E94057',
    elevation: 2,
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#E94057',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MainScreen;