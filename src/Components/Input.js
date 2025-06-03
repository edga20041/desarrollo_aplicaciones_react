import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    rightIcon, // <-- Agregá esta prop
}) => {
    return (
        <View style={{ marginBottom: 10 }}>
            <Text>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, borderRadius: 5, paddingLeft: 10, marginBottom: 5 }}>
                <TextInput
                    style={{ flex: 1, height: 40 }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                />
                {rightIcon && (
                    <View style={{ marginRight: 10 }}>
                        {rightIcon}
                    </View>
                )}
            </View>
        </View>
    );
};

export default Input;
