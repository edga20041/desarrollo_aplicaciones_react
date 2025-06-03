import React, { useState } from 'react';
import Input from '../Components/Input';
import { LinearGradient } from 'expo-linear-gradient';
import {
    View,
    Text,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../config/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const validateFields = (nombre, apellido, dni, phoneNumber, email, password, confirmPassword) => {
    // Validaciones (descomentá si querés activarlas)

    if (!nombre || !apellido || !dni || !phoneNumber || !email || !password || !confirmPassword) {
        return { valid: false, message: 'Todos los campos son obligatorios.' };
    }
    if (password !== confirmPassword) {
        return { valid: false, message: 'Las contraseñas no coinciden.' };
    }
    if (dni.length < 7 || dni.length > 8) {
        return { valid: false, message: 'El DNI debe tener 7 o 8 dígitos.' };
    }
    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
        return { valid: false, message: 'El número de teléfono debe tener entre 7 y 15 dígitos.' };
    }
    if (!/^\d+$/.test(dni)) {
        return { valid: false, message: 'El DNI solo puede contener dígitos.' };
    }
    if (!/^\d+$/.test(phoneNumber)) {
        return { valid: false, message: 'El número de teléfono solo puede contener dígitos.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valid: false, message: 'El formato del email es inválido.' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
        return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número.' };
    }
    if (!/^[a-zA-Z]+$/.test(nombre)) {
        return { valid: false, message: 'El nombre solo puede contener letras.' };
    }
    if (!/^[a-zA-Z]+$/.test(apellido)) {
        return { valid: false, message: 'El apellido solo puede contener letras.' };
    }
    if (nombre.length < 2 || apellido.length < 2) {
        return { valid: false, message: 'El nombre y el apellido deben tener al menos 2 caracteres.' };
    }

    return { valid: true };
};

const RegisterForm = ({ onRegisterSuccess }) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        setError(null);
        const validationResult = validateFields(name, surname, dni, phoneNumber, email, password, confirmPassword);

        if (!validationResult.valid) {
            setError(validationResult.message || 'Error de validación.');
            return;
        }

        const registerRequest = {
            email,
            password,
            name,
            surname,
            dni: Number(dni),
            phoneNumber: Number(phoneNumber),
        };

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.REGISTER}`, registerRequest);
            onRegisterSuccess(email);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    setError(err.response.data.message || 'El usuario ya está registrado o datos inválidos.');
                } else {
                    setError('Error en el registro. Por favor, intenta nuevamente.');
                }
            } else if (err.request) {
                setError('No se recibió respuesta del servidor.');
            } else {
                setError(`Error al configurar la petición: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 15 }}>
            <Input label="Nombre" value={name} onChangeText={setName} placeholder="Ingrese su nombre" />
            <Input label="Apellido" value={surname} onChangeText={setSurname} placeholder="Ingrese su apellido" />
            <Input label="DNI" value={dni} onChangeText={setDni} placeholder="Ingrese su DNI" keyboardType="numeric" />
            <Input label="Teléfono" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Ingrese su teléfono" keyboardType="numeric" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="Ingrese su email" keyboardType="email-address" />
            <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su contraseña"
                secureTextEntry={!showPassword}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color="#888"
                        />
                    </TouchableOpacity>
                }
            />

            <Input
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme su contraseña"
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                        <MaterialCommunityIcons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color="#888"
                        />
                    </TouchableOpacity>
                }
            />
            {error && (
                <View style={{ backgroundColor: '#f8d7da', padding: 10, borderRadius: 5, marginBottom: 10 }}>
                    <Text style={{ color: '#721c24' }}>Error: {error}</Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Pressable onPress={handleRegister}>
                    <LinearGradient colors={['#F27121', '#E94057']} style={styles.registerButton}>
                        <Text style={styles.registerButtonText}>Registrarse</Text>
                    </LinearGradient>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    registerButton: {
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingVertical: 12,
        paddingHorizontal: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Montserrat_600SemiBold'
    },
});

export default RegisterForm;