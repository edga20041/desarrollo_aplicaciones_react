import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import config from '../config/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const VerifyCode = ({ email, onVerificationSuccess }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

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

    const handleVerify = async () => {
        if (code.some(digit => !digit)) {
            setError('Por favor, ingrese el código completo');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.VERIFY}`, {
                email,
                code: code.join('')
            });

            if (response.data.success) {
                Alert.alert(
                    '¡Verificación Exitosa!',
                    'Tu cuenta ha sido verificada correctamente.',
                    [{ text: 'OK', onPress: onVerificationSuccess }]
                );
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al verificar el código');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        setLoading(true);
        setError(null);

        try {
            await axios.post(`${config.API_URL}${config.AUTH.RESEND_CODE}`, { email });
            setTimeLeft(60);
            setCanResend(false);
            Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu correo electrónico.');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <MaterialCommunityIcons name="email-check-outline" size={50} color="#E94057" />
                <Text style={styles.infoText}>
                    Hemos enviado un código de verificación a:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
            </View>

            <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={ref => inputRefs.current[index] = ref}
                        style={styles.codeInput}
                        value={digit}
                        onChangeText={text => handleCodeChange(text, index)}
                        onKeyPress={e => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                    />
                ))}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#721c24" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                    {canResend ? '¿No recibiste el código?' : `Reenviar código en ${timeLeft}s`}
                </Text>
                {canResend && (
                    <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                        <Text style={styles.resendText}>Reenviar código</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#E94057" />
            ) : (
                <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
                    <LinearGradient
                        colors={['#F27121', '#E94057']}
                        style={styles.gradient}
                    >
                        <Text style={styles.verifyButtonText}>Verificar Código</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'Montserrat_400Regular',
    },
    emailText: {
        fontSize: 18,
        color: '#E94057',
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
        borderColor: '#E94057',
        borderRadius: 10,
        marginHorizontal: 5,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#333',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        width: '100%',
    },
    errorText: {
        color: '#721c24',
        marginLeft: 5,
        fontFamily: 'Montserrat_400Regular',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerText: {
        color: '#666',
        marginBottom: 5,
        fontFamily: 'Montserrat_400Regular',
    },
    resendText: {
        color: '#E94057',
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
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold',
    },
});

export default VerifyCode;
