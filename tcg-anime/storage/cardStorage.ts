import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "@/data/types";

const STORAGE_KEY = "cards";

export const saveCard = async (card: Card) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const cards: Card[] = stored ? JSON.parse(stored) : [];
    cards.push(card);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const getCards = async (): Promise<Card[]> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};
