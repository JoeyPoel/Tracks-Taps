import React from 'react';
import {
    BoltIcon as BoltOutline,
    FireIcon as FireOutline,
    FlagIcon as FlagOutline,
    GlobeAmericasIcon as GlobeOutline,
    MapPinIcon as MapPinOutline,
    StarIcon as StarOutline,
    TrophyIcon as TrophyOutline,
    UserGroupIcon as UserGroupOutline
} from 'react-native-heroicons/outline';
import {
    BoltIcon as BoltSolid,
    FireIcon as FireSolid,
    FlagIcon as FlagSolid,
    GlobeAmericasIcon as GlobeSolid,
    MapPinIcon as MapPinSolid,
    StarIcon as StarSolid,
    TrophyIcon as TrophySolid,
    UserGroupIcon as UserGroupSolid
} from 'react-native-heroicons/solid';

interface AchievementIconProps {
    icon: string;
    size?: number;
    color?: string;
    solid?: boolean;
}

export const AchievementIcon = ({ icon, size = 24, color = '#000', solid = true }: AchievementIconProps) => {
    // Map icon names to components
    const getIconComponent = (name: string, isSolid: boolean) => {
        switch (name) {
            case 'trophy': return isSolid ? TrophySolid : TrophyOutline;
            case 'map': return isSolid ? MapPinSolid : MapPinOutline;
            case 'flame': return isSolid ? FireSolid : FireOutline;
            case 'flash': return isSolid ? BoltSolid : BoltOutline;
            case 'star': return isSolid ? StarSolid : StarOutline;
            case 'flag': return isSolid ? FlagSolid : FlagOutline;
            case 'globe': return isSolid ? GlobeSolid : GlobeOutline;
            case 'people': return isSolid ? UserGroupSolid : UserGroupOutline;
            default: return isSolid ? StarSolid : StarOutline;
        }
    };

    const IconComponent = getIconComponent(icon, solid);

    return <IconComponent size={size} color={color} />;
};
