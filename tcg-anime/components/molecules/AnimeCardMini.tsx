import React from "react";
import {TouchableOpacity, Text, View, StyleSheet, Image} from "react-native";

export const AnimeCardMini = ({template, selected, onSelect}: any) => {
    if (!template) return null;

    return (
        <TouchableOpacity onPress={() => onSelect(template.id)}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: template.bgColor,
                        borderColor: selected ? "#ffd700" : template.borderColor,
                    },
                ]}
            >
                {template.logo && (
                    <Image source={template.logo} style={styles.logo} resizeMode="contain"/>
                )}
                <Text style={[styles.label, {color: template.titleColor}]}>
                    {template.name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    card: {
        width: 100,
        height: 130,
        borderRadius: 10,
        marginHorizontal: 6,
        borderWidth: 3,
        justifyContent: "center",
        alignItems: "center",
        padding: 6,
    },
    logo: {width: 60, height: 40, marginBottom: 4},
    label: {fontWeight: "bold", fontSize: 14, textAlign: "center"},
});
