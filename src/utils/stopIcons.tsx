import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StopType } from '../types/models';

export const getStopIcon = (type: StopType, size: number = 24, color: string = 'black') => {
    switch (type) {
        case StopType.Food_Dining:
            return <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />;
        case StopType.Coffee_Drink:
            return <MaterialCommunityIcons name="coffee" size={size} color={color} />;
        case StopType.Nightlife:
            return <MaterialCommunityIcons name="glass-cocktail" size={size} color={color} />;
        case StopType.Museum_Art:
            return <MaterialCommunityIcons name="palette" size={size} color={color} />;
        case StopType.Monument_Landmark:
            return <MaterialCommunityIcons name="star" size={size} color={color} />;
        case StopType.Religious:
            return <MaterialCommunityIcons name="church" size={size} color={color} />;
        case StopType.Nature_Park:
            return <MaterialCommunityIcons name="tree" size={size} color={color} />;
        case StopType.Shopping:
            return <MaterialCommunityIcons name="shopping" size={size} color={color} />;
        case StopType.Transit_Stop:
            return <MaterialCommunityIcons name="bus" size={size} color={color} />;
        case StopType.Viewpoint:
            return <MaterialCommunityIcons name="telescope" size={size} color={color} />;
        case StopType.Info_Point:
            return <MaterialCommunityIcons name="information" size={size} color={color} />;
        case StopType.Facilities:
            return <MaterialCommunityIcons name="toilet" size={size} color={color} />;
        default:
            return <MaterialCommunityIcons name="map-marker" size={size} color={color} />;
    }
};
