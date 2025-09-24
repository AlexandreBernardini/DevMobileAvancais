import React from "react";
import { View } from "react-native";
import { Input } from "../atoms/Input";
import { ImagePicker } from "../atoms/ImagePicker";
import { StatInput } from "../molecules/StatInput";
import { AnimeSelector } from "./AnimeSelector";
import { CardPreview } from "./CardPreview";
import { animeTemplates } from "@/data/animeTemplates";
import { Card } from "@/data/types";

export const CardEditor = ({ card, onChange }: { card: Card; onChange: (c: Card) => void }) => {
    return (
        <View>
            <Input value={card.name} onChangeText={(t: string) => onChange({ ...card, name: t })} placeholder="Nom de la carte" />
            <Input value={card.collection} onChangeText={(t: string) => onChange({ ...card, collection: t })} placeholder="Collection" />
            <ImagePicker onPick={(uri) => onChange({ ...card, imageUri: uri })} />
            <StatInput label="Attaque" value={card.stats.attack} onChange={(v: string) => onChange({ ...card, stats: { ...card.stats, attack: Number(v) } })} />
            <StatInput label="Défense" value={card.stats.defense} onChange={(v: string) => onChange({ ...card, stats: { ...card.stats, defense: Number(v) } })} />
            <StatInput label="Rareté" value={card.stats.rarity} onChange={(v: string) => onChange({ ...card, stats: { ...card.stats, rarity: v } })} />

            <AnimeSelector
                templates={animeTemplates}
                selected={card.anime}
                onSelect={(animeId: string) =>
                    onChange({ ...card, anime: animeId })
                }
            />

            <CardPreview card={card} />
        </View>
    );
};
