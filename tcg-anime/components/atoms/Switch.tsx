
import React from 'react';
import { Switch as RNSwitch } from 'react-native';

interface SwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ value, onValueChange, disabled = false }) => {
    return (
        <RNSwitch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{
                false: disabled ? '#d3d3d3' : '#767577',
                true: disabled ? '#b0c4de' : '#81b0ff',
            }}
            thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
        />
    );
};

export default Switch;