import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import config from '../config/config';
import axios from 'axios';
import Input from '../Components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const VerifyCodePasswordScreen = ({ navigation, route }) => {
    const { email } = route.params;
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
    });

    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setIsModalVisible(true);
    };

    const handleVerifyCode = async () => {
        if (!code) {
            showMessage("Por favor, ingresa el código.", true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.VERIFY_CODE}`,
                { email, code });

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
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error de conexión. Intenta de nuevo.';
            showMessage(errorMessage, true);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await axios.post(`${config.API_URL}${config.AUTH.RESEND_CODE_RECOVERY}`,
                { email });
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
                <ActivityIndicator size="large" color="#E94057" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            <Text style={styles.title}>Verificar Código</Text>
            <Text style={styles.subtitle}>
                Ingresa el código de verificación que enviamos a {email}
            </Text>

            <Input
                label="Código de verificación"
                placeholder="Ingresa el código de 6 dígitos"
                keyboardType="numeric"
                value={code}
                onChangeText={setCode}
                style={styles.input}
                labelStyle={styles.label}
                inputStyle={styles.inputField}
                maxLength={6}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#E94057" style={styles.loadingSpinner} />
            ) : (
                <>
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

                    <View style={styles.links}>
                        <Pressable onPress={handleResendCode}>
                            <Text style={styles.link}>¿No recibiste el código? Reenviar</Text>
                        </Pressable>
                    </View>
                </>
            )}

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
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                        <Text style={[styles.modalText, message?.isError ? styles.modalErrorText : styles.modalSuccessText]}>
                            {message?.text}
                        </Text>
                        <Pressable
                            onPress={() => setIsModalVisible(false)}
                            style={({ pressed }) => [
                                styles.modalButton,
                                pressed && { opacity: 0.8 }
                            ]}
                        >
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 35,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
    loadingSpinner: {
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold',
        color: 'black',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        lineHeight: 22,
    },
    input: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        fontFamily: 'Montserrat_400Regular',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Montserrat_400Regular',
        textAlign: 'center',
        letterSpacing: 2,
    },
    verifyButton: {
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20,
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
    links: {
        marginTop: 30,
        alignItems: 'center',
    },
    link: {
        color: '#007AFF',
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
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
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
    },
    modalErrorText: {
        color: '#e74c3c',
    },
    modalSuccessText: {
        color: 'green',
    },
    modalButton: {
        backgroundColor: '#4B9CE2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Montserrat_400Regular',
    },
});

export default VerifyCodePasswordScreen;