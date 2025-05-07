import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterSchema = Yup.object().shape({
    nombre: Yup.string().required('Nombre es requerido').matches(/^[a-zA-Z\s]+$/, 'Nombre inválido'),
    apellido: Yup.string().required('Apellido es requerido').matches(/^[a-zA-Z\s]+$/, 'Apellido inválido'),
    dni: Yup.string().required('DNI es requerido').matches(/^\d{7,8}$/, 'DNI inválido'),
    phone: Yup.string().required('Teléfono es requerido').matches(/^\d{10}$/, 'Teléfono inválido'),
    email: Yup.string().email('Email inválido').required('Email es requerido'),
    password: Yup.string().required('Contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir').required('Confirmar contraseña es requerido'),
});

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const API_BASE_URL = 'http://192.168.1.10:8081/auth';

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Limpiar el error al cambiar el valor
    };

    const validateForm = async () => {
        try {
            await RegisterSchema.validate(formData, { abortEarly: false });
            setErrors({}); // Limpiar todos los errores si la validación es exitosa
            return true;
        } catch (err) {
            const newErrors = {};
            err.inner.forEach(error => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleRegister = async () => {
        if (!await validateForm()) {
            return;
        }

        setLoading(true);
        try {
            Alert.alert('Registrando', 'Aguarde un instante, estamos procesando tu registro...');

            const response = await axios.post(`${API_BASE_URL}/register`, {
                email: formData.email,
                password: formData.password,
                name: formData.nombre,
                surname: formData.apellido,
                phoneNumber: formData.phone,
                dni: parseInt(formData.dni, 10),
            });

            if (response.status === 200) {
                Alert.alert('Registro exitoso', response.data, [
                    {
                        text: 'OK',
                        onPress: () => {
                            AsyncStorage.setItem('email', formData.email)
                                .then(() => {
                                    navigation.navigate('VerifyCode');
                                })
                                .catch(error => {
                                    console.error("Error al guardar email:", error);
                                    Alert.alert('Error', 'No se pudo guardar el email.');
                                });
                            setFormData({  // Reset del formulario
                                nombre: '',
                                apellido: '',
                                dni: '',
                                phone: '',
                                email: '',
                                password: '',
                                confirmPassword: '',
                            });
                        },
                    },
                ]);
            } else if (response.status === 400) {
                Alert.alert('Error', 'El usuario ya está registrado.');
            } else {
                Alert.alert('Error', 'Error en el registro. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error al registrar:', error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Error de conexión. Verifica tu conexión a internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ width: '100%' }}>
                <TextInput
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChangeText={(text) => handleChange('nombre', text)}
                    style={[styles.input, errors.nombre && styles.inputError]}
                />
                {errors.nombre && (
                    <Text style={styles.errorText}>{errors.nombre}</Text>
                )}

                <TextInput
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChangeText={(text) => handleChange('apellido', text)}
                    style={[styles.input, errors.apellido && styles.inputError]}
                />
                {errors.apellido && (
                    <Text style={styles.errorText}>{errors.apellido}</Text>
                )}

                <TextInput
                    placeholder="DNI"
                    value={formData.dni}
                    onChangeText={(text) => handleChange('dni', text)}
                    keyboardType="numeric"
                    style={[styles.input, errors.dni && styles.inputError]}
                />
                {errors.dni && (
                    <Text style={styles.errorText}>{errors.dni}</Text>
                )}

                <TextInput
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    keyboardType="phone-pad"
                    style={[styles.input, errors.phone && styles.inputError]}
                />
                {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <TextInput
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    style={[styles.input, errors.email && styles.inputError]}
                />
                {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                    placeholder="Contraseña"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    style={[styles.input, errors.password && styles.inputError]}
                />
                {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <TextInput
                    placeholder="Confirmar Contraseña"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                />
                {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                <Button
                    title={loading ? 'Registrando...' : 'Registrarse'}
                    onPress={handleRegister}
                    disabled={loading}
                />
                <Button
                    title="Volver"
                    onPress={() => navigation.goBack()}
                    color="gray"
                    style={{ marginTop: 10 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 5,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});

export default RegisterScreen;
