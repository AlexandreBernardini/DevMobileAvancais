export interface Card {
    id: string;
    name: string;
    imageUri: string;
    collection: string;
    anime: string;
    stats: {
        attack: number;
        defense: number;
        rarity: string;
    };
}
