import React, { useState } from 'react';
import Input from '../Components/Input';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import config from '../config/config';
import { useNavigation } from "@react-navigation/native";

const validateFields = (nombre, apellido, dni, phoneNumber, email, password, confirmPassword) => {
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

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

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
            console.log('Registro exitoso:', response.data);
            navigation.navigate('VerifyCode', { email });
        } catch (err) {
            setError(`Error de registro: ${err.message}`);
            console.error('Error de registro:', err.response ? err.response.data : err.message);
            Alert.alert('Error', 'Ocurrió un error durante el registro. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 15 }}>
            <Input
                label="Nombre"
                value={name}
                onChangeText={setName}
                placeholder="Ingrese su nombre"
            />
            <Input
                label="Apellido"
                value={surname}
                onChangeText={setSurname}
                placeholder="Ingrese su apellido"
            />
            <Input
                label="DNI"
                value={dni}
                onChangeText={setDni}
                placeholder="Ingrese su DNI"
                keyboardType="numeric"
            />
            <Input
                label="Teléfono"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ingrese su teléfono"
                keyboardType="numeric"
            />
            <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Ingrese su email"
                keyboardType="email-address"
            />
            <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su contraseña"
                secureTextEntry
            />
            <Input
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme su contraseña"
                secureTextEntry
            />

            {error && (
                <View style={{ backgroundColor: '#f8d7da', padding: 10, borderRadius: 5, marginBottom: 10 }}>
                    <Text style={{ color: '#721c24' }}>Error: {error}</Text>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Registrarse" onPress={handleRegister} />
            )}
        </View>
    );
};

export default RegisterForm;