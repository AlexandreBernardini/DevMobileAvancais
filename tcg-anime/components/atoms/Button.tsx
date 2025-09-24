import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export const Button = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#d62828", // rouge flashy
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
        marginVertical: 10,
        alignItems: "center",
    },
    text: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        textTransform: "uppercase",
    },
});
