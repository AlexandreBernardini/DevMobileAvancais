import React from "react";
import { Button } from "./Button";
import * as ImagePickerExpo from "expo-image-picker";

export const ImagePicker = ({ onPick }: { onPick: (uri: string) => void }) => {
    const pickImage = async () => {
        const result = await ImagePickerExpo.launchImageLibraryAsync({ mediaTypes: ImagePickerExpo.MediaTypeOptions.Images });
        if (!result.canceled) {
            onPick(result.assets[0].uri);
        }
    };
    return <Button label="Choisir une image" onPress={pickImage} />;
};
