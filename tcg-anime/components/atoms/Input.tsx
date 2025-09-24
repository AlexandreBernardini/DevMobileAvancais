import React from "react";
import { TextInput, StyleSheet } from "react-native";

export const Input = ({ value, onChangeText, placeholder }: any) => (
    <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
    />
);

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#1c1c2b",
        borderWidth: 2,
        borderColor: "#e0b422", // doré style carte rare
        borderRadius: 10,
        padding: 10,
        marginVertical: 6,
        color: "#fff",
        fontSize: 16,
        fontFamily: "serif",
    },
});
