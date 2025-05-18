import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false }) => {
    return (
        <View style={{ marginBottom: 10 }}>
            <Text>{label}</Text>
            <TextInput
                style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingLeft: 10,
                    marginBottom: 5,
                }}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

export default Input;
