import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface LocationChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
    index: number;
    isBonus?: boolean;
}

const LocationChallenge: React.FC<LocationChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    index,
    isBonus = false
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;

    const handlePress = () => {
        onComplete(challenge);
    };

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="location"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handlePress}
            actionLabel={t('verifyLocation')}
            disabled={isDone}
            index={index}
            isBonus={isBonus}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
            </Text>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    successText: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
});

export default LocationChallenge;
