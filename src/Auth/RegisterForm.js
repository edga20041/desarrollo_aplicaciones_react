import React, { useState } from 'react';
import Input from '../Components/Input';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import config from '../config/config';

const validateFields = (nombre, apellido, dni, phoneNumber, email, password, confirmPassword) => {
    /*
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
    */
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

    const handleRegister = async () => {
        setError(null);
        console.log('Valores antes de la validación:');
        console.log('Nombre:', name);
        console.log('Apellido:', surname);
        console.log('DNI:', dni);
        console.log('Teléfono:', phoneNumber);
        console.log('Email:', email);
        console.log('Contraseña:', password);
        console.log('Confirmar Contraseña:', confirmPassword);
        const validationResult = validateFields(name, surname, dni, email, phoneNumber, password, confirmPassword);
    
        if (!validationResult.valid) {
            setError(validationResult.message || 'Error de validación.');
            console.log("Error de validación:", validationResult.message);
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
    
        console.log('Datos a enviar al backend:', registerRequest);  
    
        setLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}${config.AUTH.REGISTER}`, registerRequest);
            console.log('Registro exitoso:', response.data);  
            onRegisterSuccess(email);
        } catch (err) {
            console.error('Error en la solicitud:', err);  
            if (err.response) {
                console.error('Error del servidor:', err.response.data);
                if (err.response.status === 400) {
                    setError(err.response.data.message || 'El usuario ya está registrado o datos inválidos.');
                } else {
                    setError('Error en el registro. Por favor, intenta nuevamente.');
                }
            } else if (err.request) {
                setError('No se recibió respuesta del servidor.');
                console.error('No se recibió respuesta del servidor:', err.request);
            } else {
                setError(`Error al configurar la petición: ${err.message}`);
                console.error('Error al configurar la petición:', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
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
