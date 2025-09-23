import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Input } from "../atoms/Input";

export const StatInput = ({ label, value, onChange }: any) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Input value={String(value)} onChangeText={onChange} placeholder={label} />
    </View>
);

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#e0b422",
        marginBottom: 4,
        fontFamily: "serif",
    },
});
