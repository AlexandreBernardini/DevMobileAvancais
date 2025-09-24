import React from 'react';
import { FlatList as ReactNativeFlatList } from 'react-native';

export const FlatList = ({ data, keyExtractor, numColumns, contentContainerStyle, columnWrapperStyle, renderItem, style, initialNumToRender, maxToRenderPerBatch, windowSize }: any) => (
    <ReactNativeFlatList
        data={data}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={columnWrapperStyle}
        renderItem={renderItem}
        style={style}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
    />
)



