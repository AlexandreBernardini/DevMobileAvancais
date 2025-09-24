import React from 'react';
import {Input} from '../atoms/Input';
import Icons from '../atoms/Icons';
import { View } from 'react-native';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(event.target.value);
    };

    return (
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Input placeholder={placeholder} onChange={handleInputChange}></Input>
            <Icons.SearchIcon />
        </View>
    );
};

export default SearchBar;