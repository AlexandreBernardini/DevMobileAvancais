import React, { useState } from "react";
import { TextInput, StyleSheet, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export const Input = ({
                        value,
                        onChangeText,
                        placeholder,
                        label,
                        error,
                        secureTextEntry = false,
                        keyboardType = "default",
                        ...props
                      }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              error && styles.inputError
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    color: "#e0b422",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
    fontFamily: "serif",
  },
  input: {
    backgroundColor: "#1c1c2b",
    borderWidth: 2,
    borderColor: "#e0b422",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    fontFamily: "serif",
    elevation: 3,
    shadowColor: "#e0b422",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputFocused: {
    borderColor: "#f4d03f",
    shadowOpacity: 0.5,
    elevation: 5,
  },
  inputError: {
    borderColor: "#d62828",
    shadowColor: "#d62828",
  },
  errorText: {
    color: "#d62828",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
});