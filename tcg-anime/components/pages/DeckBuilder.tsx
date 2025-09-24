
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { FlatList } from '../atoms/FlatList';
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { SearchBar } from "../molecules/SearchBar";



const CARD_DATA = Array.from({ length: 121 }).map((_, i) => ({ id: i + 1 }));

const CardPlaceholder = ({ id }: { id: number }) => (
    <View style={styles.card}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Card {id}</Text>
    </View>
);

export const DeckBuilder = () => {
    return (
        <View style={{ flex: 1, padding: 16, marginTop: Dimensions.get('window').height * 0.025 }}>
            <Input placeholder="Name of the deck" onChangeText={(text: string) => console.log(text)} />
            <SearchBar placeholder="Search cards..." onSearch={(value) => console.log(value)} />
            <FlatList
                data={CARD_DATA}
                keyExtractor={(item: { id: number }) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
                columnWrapperStyle={{ gap: 12 }}
                renderItem={({ item }: { item: { id: number } }) => {
                    console.log('Render item', item.id);
                    return <CardPlaceholder id={item.id} />;
                }}
                style={{ marginTop: 16 }}
                initialNumToRender={9}
                maxToRenderPerBatch={9}
                windowSize={3}
            />
            <View style={{ marginTop: 16 }}>
                <Button label="Create Deck" onPress={() => console.log("Deck Created")} />
            </View>
        </View>
    );
};

const CARD_SIZE = (Dimensions.get('window').width - 16 * 2 - 12 * 2) / 3;
const styles = StyleSheet.create({
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE * 1.4,
        backgroundColor: '#222',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
});