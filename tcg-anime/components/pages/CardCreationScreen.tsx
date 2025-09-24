import React, {useState} from "react";
import {ScrollView, Alert} from "react-native";
import {Card} from "@/data/types";
import {CardEditor} from "../organisms/CardEditor";
import {Button} from "../atoms/Button";
import {saveCard} from "@/storage/cardStorage";

export const CardCreationScreen = () => {
    const [card, setCard] = useState<Card>({
        id: Date.now().toString(),
        name: "",
        imageUri: "",
        collection: "",
        anime: "naruto",
        stats: {attack: 0, defense: 0, rarity: "common"},
    });

    const handleSave = async () => {
        await saveCard(card);
        Alert.alert("Carte sauvegardée !");
    };

    return (
        <ScrollView>
            <CardEditor card={card} onChange={setCard}/>
            <Button label="Sauvegarder" onPress={handleSave}/>
        </ScrollView>
    );
};
