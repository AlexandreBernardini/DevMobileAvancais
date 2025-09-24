import React, { useState } from "react";
import { ScrollView, Alert, SafeAreaView } from "react-native";
import { Card } from "@/data/types";
import { CardEditor } from "@/components/organisms/CardEditor";
import { Button } from "@/components/atoms/Button";
import { saveCard } from "@/storage/cardStorage";

export default function CreateCardScreen() {
    const [card, setCard] = useState<Card>({
        id: Date.now().toString(),
        name: "",
        imageUri: "",
        collection: "",
        template: "fire",
        stats: { attack: 0, defense: 0, rarity: "common" },
    });

    const handleSave = async () => {
        await saveCard(card);
        Alert.alert("✅ Carte sauvegardée !");
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <CardEditor card={card} onChange={setCard} />
                <Button label="Sauvegarder" onPress={handleSave} />
            </ScrollView>
        </SafeAreaView>
    );
}
