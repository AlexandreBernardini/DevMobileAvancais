
import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';


type IconProps = {
    size?: number;
    color?: string;
};

export const PlusIcon: React.FC<IconProps> = ({ size = 24, color = 'white' }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <Path d="M12 5v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MinusIcon: React.FC<IconProps> = ({ size = 24, color = 'white' }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <Path d="M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 24, color = 'white' }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <Path
            d="M3 4h18l-7 10v6l-4-2v-4L3 4z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = 'white' }) => (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
        <Line x1="16" y1="16" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
);



const Icons = {
    PlusIcon,
    MinusIcon,
    FilterIcon,
    SearchIcon,
};

export default Icons;