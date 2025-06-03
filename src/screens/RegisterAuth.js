import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Keyboard, Platform, Dimensions } from 'react-native';
import RegisterForm from './RegisterForm'; 
import VerifyCode from './VerifyCode';
import {SafeAreaView} from "react-native-safe-area-context";

const RegisterAuth = () => {
    const [email, setEmail] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollViewRef = useRef(null);
    const formRef = useRef(null);
    const windowHeight = Dimensions.get('window').height;

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

    const handleInputFocus = (event) => {
        if (scrollViewRef.current) {
            const fieldY = event.nativeEvent.target;
            
            setTimeout(() => {
                scrollViewRef.current.scrollTo({
                    y: fieldY - (windowHeight * 0.3),
                    animated: true
                });
            }, 100);
        }
    };

    const handleRegisterSuccess = (registeredEmail) => {
        setEmail(registeredEmail);
        console.log("Email registrado:", registeredEmail); 
    };

    return (
        <SafeAreaView
            style={[styles.container]}
            edges={['top', 'right', 'left', 'bottom']}
        >
            <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.scrollContainer,
                    { paddingBottom: keyboardHeight + 20 }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View 
                    ref={formRef}
                    style={styles.formContainer}
                >
                    <Text style={styles.title}>
                        {email ? 'Verifica tu Correo Electrónico' : 'Registrarse'}
                    </Text>
                    {email ? (
                        <VerifyCode email={email} />
                    ) : (
                        <RegisterForm 
                            onRegisterSuccess={handleRegisterSuccess}
                            onInputFocus={handleInputFocus}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 'white' 
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: { 
        padding: 20, 
        borderRadius: 10, 
        width: '100%',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Montserrat_600SemiBold',
        color: 'black',
    },
});

export default RegisterAuth;
