import { Input } from "../atoms/Input";
import { AnimeCardMini } from "../molecules/AnimeCardMini";
import SearchBar from "../molecules/SearchBar";


export const DeckBuilder = () => {
    return (
        <>
            <SearchBar placeholder="Search cards..." onSearch={(value) => console.log(value)} />
            <Input placeholder="Name of the deck" onChange={(text) => console.log(text)} />
            <AnimeCardMini /> 
        </>
    );
} 