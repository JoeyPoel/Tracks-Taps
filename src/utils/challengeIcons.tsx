import { ChallengeType } from '@/src/types/models';
import { Ionicons } from '@expo/vector-icons';

// Using Ionicons as they are available in Expo by default and used in ChallengeCreationModal
// If HeroIcons were desired, we can map them, but sticking to what's in the Modal for consistency as requested.

// Note: We need to pass the theme object to get the correct colors, 
// or rely on the caller to provide the color if traversing from a component.
// To keep it pure, we'll accept the theme object.

export const getChallengeIconProps = (type: ChallengeType | 'CAMERA', theme: any, t: (key: any) => string) => {
    const map: Record<ChallengeType, { icon: keyof typeof Ionicons.glyphMap, label: string, color: string }> = {
        [ChallengeType.TRIVIA]: { icon: 'help-circle-outline', label: t('trivia'), color: theme.challenges.trivia },
        [ChallengeType.TRUE_FALSE]: { icon: 'contrast-outline', label: t('trueFalse'), color: theme.challenges.trueFalse },
        [ChallengeType.PICTURE]: { icon: 'camera-outline', label: t('photo'), color: theme.challenges.picture },
        [ChallengeType.RIDDLE]: { icon: 'key-outline', label: t('riddle'), color: theme.challenges.riddle },
        [ChallengeType.LOCATION]: { icon: 'location-outline', label: t('location'), color: theme.challenges.location },
        [ChallengeType.CHECK_IN]: { icon: 'checkmark-circle-outline', label: t('checkIn'), color: theme.challenges.checkIn },
        [ChallengeType.DARE]: { icon: 'flash-outline', label: t('dare'), color: theme.challenges.dare },
        // Handle potential 'CAMERA' string from legacy/frontend types
        ['CAMERA' as ChallengeType]: { icon: 'camera-outline', label: t('photo'), color: theme.challenges.picture },
    };

    return map[type as ChallengeType] || map[type?.toString()?.toUpperCase() as ChallengeType] || { icon: 'help-circle-outline', label: t('unknown'), color: theme.challenges.default };
};
