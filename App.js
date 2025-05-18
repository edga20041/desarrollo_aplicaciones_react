import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as Animatable from 'react-native-animatable';
import RegisterAuth from './src/Auth/RegisterAuth';
import LoginAuth from './src/Auth/LoginAuth';
import RecoverPasswordScreen from './src/Auth/RecoverPasswordScreen';
import VerifyCodePasswordScreen from './src/Auth/VerifyCodePasswordScreen';
import ResetPasswordScreen from './src/Auth/ResetPasswordScreen';
import MainScreen from './src/Auth/MainScreen';
import HistorialEntregas from './src/Components/HistorialEntregas';
import DetalleEntregaHistorial from './src/Components/DetalleEntregaHistorial';
import Geocoder from 'react-native-geocoding';
import config from './src/config/config';
import DetalleEntregaPendiente from './src/Components/DetalleEntregaPendiente';

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');

function HomeScreen({ navigation }) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    console.log('HomeScreen mounted');
    // Animación de entrada para el LOGO
    Animated.timing(new Animated.Value(1), { 
      toValue: 1,
      duration: 2000,
      useNativeDriver: false, 
    }).start(() => {
      console.log('Logo animation finished, rendering content');
      setIsRendered(true); 
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000, 
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000, 
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('Content animation finished');
      });
    });
  }, []);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    console.log('Fonts loading...');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }
  console.log('Fonts loaded');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" translucent />

      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View
          animation="fadeIn"
          duration={7000}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <Image
              source={require('./assets/logo.png')}
              style={{ width: 250, height: 200, resizeMode: 'cover' }}
    />
          </View>
        </Animatable.View>

        {isRendered && (
          <Animated.View style={[
            styles.contentContainer,
            {
              transform: [{ translateY: translateY }],
              opacity: opacity
            }
          ]}>
            <Text style={styles.welcomeText}>Bienvenido a</Text>
            <Text style={styles.appName}>DeRemate</Text>
            <Text style={styles.tagline}>Tu plataforma de entregas confiable</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#E94057', '#F27121']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomDecoration}>
          <LinearGradient
            colors={['rgba(231, 76, 60, 0.7)', 'rgba(241, 196, 15, 0.7)']}
            style={styles.decorationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function App() {
  useEffect(() => {
    console.log('Iniciando Geocoder...');
    if (config.GOOGLE_MAPS_API_KEY) {
      Geocoder.init(config.GOOGLE_MAPS_API_KEY);
      console.log('Geocoder inicializado con la clave de API.');
      console.log('Clave de API:', config.GOOGLE_MAPS_API_KEY);
    } else {
      console.warn('La clave de API de Google Maps no está configurada en config.js');
    }
  }, []);

  const screenOptions = {
    headerStyle: {
      backgroundColor: '#1A1A2E',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontFamily: 'Montserrat_600SemiBold',
    },
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: '#0F3460',
    },
    animation: 'slide_from_right',
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterAuth}
          options={{
            title: 'Crear Cuenta',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginAuth}
          options={{
            title: 'Iniciar Sesión',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecoverPassword"
          component={RecoverPasswordScreen}
          options={{
            title: 'Recuperar Contraseña',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="VerifyCodePassword"
          component={VerifyCodePasswordScreen}
          options={{
            title: 'Verificar Código',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            title: 'Nueva Contraseña',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="Historial"
          component={HistorialEntregas}
          options={{
            title: 'Historial de Entregas',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="Detalle Entrega Historial"
          component={DetalleEntregaHistorial}
          options={{
            title: 'Detalle de Entrega',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="Detalle Entrega Pendiente"
          component={DetalleEntregaPendiente}
          options={{
          title: 'Detalle de Entrega',
          headerBackTitle: 'Volver',
  }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 2,
    
  },
  logoCircle: {
    width: 10,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#E94057',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 100,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Montserrat_700Bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeText: {
    color: '#E8E8E8',
    fontSize: 20,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 42,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 1,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: '#E8E8E8',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 50,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 0.5,
  },
  registerButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E94057',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 0.5,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: -50,
    width: width * 1.5,
    height: 100,
    left: -width * 0.25,
    transform: [{ rotate: '-5deg' }],
    overflow: 'hidden',
  },
  decorationGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
});