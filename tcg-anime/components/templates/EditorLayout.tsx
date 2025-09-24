import React from "react";
import { View, StyleSheet } from "react-native";

export const EditorLayout = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.container}>{children}</View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
});
