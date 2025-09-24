import React from "react";
import {View, Text, Image, StyleSheet} from "react-native";
import {Card} from "@/data/types";
import {animeTemplates} from "@/data/animeTemplates";

export const CardPreview = ({card}: { card: Card }) => {
    const template = animeTemplates[card.anime];

    if (!template) {
        return <Text>Template introuvable</Text>;
    }

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: template.bgColor,
                    borderColor: template.borderColor,
                },
            ]}
        >
            {template.logo && (
                <Image source={template.logo} style={styles.logo} resizeMode="contain"/>
            )}
            <Text style={[styles.title, {color: template.titleColor}]}>
                {card.name || "Nom de la carte"}
            </Text>
            {card.imageUri ? (
                <Image source={{uri: card.imageUri}} style={styles.image}/>
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={{color: "#555"}}>Aucune image</Text>
                </View>
            )}
            <View style={styles.statsBox}>
                <Text style={styles.stat}>⚔️ Attaque: {card.stats.attack}</Text>
                <Text style={styles.stat}>🛡 Défense: {card.stats.defense}</Text>
                <Text style={styles.stat}>⭐ Rareté: {card.stats.rarity}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 300,
        height: 460,
        borderWidth: 4,
        borderRadius: 16,
        padding: 12,
        marginVertical: 20,
        alignItems: "center",
    },
    logo: {width: 100, height: 50, marginBottom: 4},
    title: {fontSize: 22, fontWeight: "bold", marginBottom: 8, fontFamily: "serif"},
    image: {
        width: 220,
        height: 220,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
        marginBottom: 10,
    },
    placeholderImage: {
        width: 220,
        height: 220,
        backgroundColor: "#ddd",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    statsBox: {
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 8,
        marginTop: "auto",
        width: "100%",
    },
    stat: {color: "#fff", fontSize: 16, marginVertical: 2},
});
