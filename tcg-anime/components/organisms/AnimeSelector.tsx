import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { AnimeCardMini } from "../molecules/AnimeCardMini";

export const AnimeSelector = ({ templates, selected, onSelect }: any) => (
    <ScrollView horizontal style={styles.container} showsHorizontalScrollIndicator={false}>
        {Object.values(templates).map((t: any) => (
            <AnimeCardMini
                key={t.id}
                template={t}
                selected={t.id === selected}
                onSelect={onSelect}
            />
        ))}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginVertical: 16,
        paddingHorizontal: 8,
    },
});
