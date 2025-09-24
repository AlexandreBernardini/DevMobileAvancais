import React from 'react';
import {Input} from '../atoms/Input';
import Icons from '../atoms/Icons';
import { View } from 'react-native';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
    const handleInputChange = (text: string) => {
        onSearch(text);
    };

    return (
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Input placeholder={placeholder} onChangeText={handleInputChange}></Input>
            <Icons.SearchIcon />
        </View>
    );
};