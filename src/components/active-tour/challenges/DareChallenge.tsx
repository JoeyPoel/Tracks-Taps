import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface DareChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
    index?: number;
    isBonus?: boolean;
}

const DareChallenge: React.FC<DareChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    index,
    isBonus = false
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed; // Dares usually can't fail, but interface needs it

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="dare"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={() => onComplete(challenge)}
            actionLabel={t('dareCompleted') || "Dare Completed"}
            disabled={isDone}
            index={index}
            isBonus={isBonus}
        >
            <View style={styles.content}>
                <Text style={[styles.dareText, { color: theme.textPrimary }]}>
                    {challenge.content}
                </Text>
            </View>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    content: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
    },
    dareText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 8,
    }
});

export default DareChallenge;
