import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Modal, StatusBar, ScrollView, Keyboard, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import config from '../config/config';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../styles/theme';

const VerifyCodePasswordScreen = ({ navigation, route }) => {
    const { email } = route.params;
    const { isDarkMode } = useTheme();
    const currentTheme = theme[isDarkMode ? "dark" : "light"];
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const scrollViewRef = useRef(null);
    const inputRefs = useRef([]);
    const windowHeight = Dimensions.get('window').height;

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setIsModalVisible(true);
    };

    const handleVerifyCode = async () => {
        if (code.some(digit => !digit)) {
            showMessage("Por favor, ingresa el código completo.", true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.VERIFY_CODE}`,
                { email, code: code.join('') });

            if (response.data?.message === "Código válido") {
                showMessage("Código verificado correctamente.", false);
                const token = response.data.token;
                setTimeout(() => {
                    navigation.replace('ResetPassword', { email, token });
                }, 1500);
            } else {
                showMessage("Código inválido. Intenta de nuevo.", true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de conexión. Intenta de nuevo.';
            showMessage(errorMessage, true);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            await axios.post(`${config.API_URL}${config.AUTH.RESEND_CODE_RECOVERY}`,
                { email });
            setTimeLeft(60);
            setCanResend(false);
            showMessage("Código reenviado a tu correo electrónico.", false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al reenviar el código.';
            showMessage(errorMessage, true);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentTheme.accent} />
                <Text style={[styles.loadingText, { color: currentTheme.text }]}>Cargando...</Text>
            </View>
        );
    }

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
            <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
                <StatusBar
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                    backgroundColor={currentTheme.primary}
                />
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={[
                        styles.scrollContainer,
                        { paddingBottom: keyboardHeight + 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.logoContainer}>
                        <MaterialCommunityIcons name="truck-delivery" size={80} color={currentTheme.accent} />
                    </View>
                    <View style={styles.formContainer}>
                        <View style={styles.infoContainer}>
                            <MaterialCommunityIcons name="email-check-outline" size={50} color={currentTheme.accent} />
                            <Text style={[styles.infoText, { color: "#fff" }]}>
                                Hemos enviado un código de verificación a:
                            </Text>
                            <Text style={[styles.emailText, { color: currentTheme.accent }]}>{email}</Text>
                        </View>

                        <View style={styles.codeContainer}>
                            {code.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={ref => inputRefs.current[index] = ref}
                                    style={[styles.codeInput, { 
                                        borderColor: currentTheme.accent,
                                        color: "#fff"
                                    }]}
                                    value={digit}
                                    onChangeText={text => handleCodeChange(text, index)}
                                    onKeyPress={e => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <View style={styles.timerContainer}>
                            <Text style={[styles.timerText, { color: "#fff" }]}>
                                {canResend ? '¿No recibiste el código?' : `Reenviar código en ${timeLeft}s`}
                            </Text>
                            {canResend && (
                                <Pressable 
                                    onPress={handleResendCode} 
                                    disabled={loading}
                                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                                >
                                    <Text style={[styles.resendText, { color: currentTheme.accent }]}>
                                        Reenviar código
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={currentTheme.accent} />
                        ) : (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.verifyButton,
                                    pressed && { opacity: 0.9 }
                                ]}
                                onPress={handleVerifyCode}
                            >
                                <LinearGradient colors={['#F27121', '#E94057']} style={styles.buttonGradient}>
                                    <Text style={styles.verifyButtonText}>Verificar Código</Text>
                                </LinearGradient>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A2E' : 'white' }]}>
                            <Text style={[
                                styles.modalText,
                                message?.isError ? styles.modalErrorText : styles.modalSuccessText,
                                { color: isDarkMode ? '#fff' : '#000' }
                            ]}>
                                {message?.text}
                            </Text>
                            <Pressable
                                onPress={() => setIsModalVisible(false)}
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    pressed && { opacity: 0.8 }
                                ]}
                            >
                                <Text style={[styles.modalButtonText, { color: currentTheme.accent }]}>Cerrar</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
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
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
        marginTop: 10,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: -15,
    },
    formContainer: {
        padding: 20,
        borderRadius: 15,
        width: '95%',
        alignSelf: 'center',
        alignItems: 'center'
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    emailText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        fontFamily: 'Montserrat_600SemiBold',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    codeInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderRadius: 10,
        marginHorizontal: 5,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Montserrat_600SemiBold',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerText: {
        marginBottom: 5,
        fontFamily: 'Montserrat_400Regular',
    },
    resendText: {
        textDecorationLine: 'underline',
        fontFamily: 'Montserrat_600SemiBold',
    },
    verifyButton: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '80%',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Montserrat_400Regular',
    },
    modalErrorText: {
        color: '#dc3545',
    },
    modalSuccessText: {
        color: '#28a745',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontFamily: 'Montserrat_600SemiBold',
    },
});

export default VerifyCodePasswordScreen;