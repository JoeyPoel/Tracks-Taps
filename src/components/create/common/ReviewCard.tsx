import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BoltIcon as BoltIconSolid, StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { ReviewCardHeader } from './components/ReviewCardHeader';
import { ReviewCardStats } from './components/ReviewCardStats';

interface ReviewCardProps {
    draft: TourDraft;
    updateDraft: (key: keyof TourDraft, value: any) => void;
}


export function ReviewCard({ draft, updateDraft }: ReviewCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
            <ReviewCardHeader draft={draft} />

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>{draft.title}</Text>
                <Text style={[styles.author, { color: theme.textSecondary }]}>{t('by')} {t('you')}</Text>

                <ReviewCardStats draft={draft} updateDraft={updateDraft} />

                <View style={styles.footer}>
                    <View style={styles.ratingContainer}>
                        <StarIconSolid size={18} color={theme.starColor} />
                        <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
                            {t('new')}
                        </Text>
                        <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                            (0)
                        </Text>
                    </View>

                    <View style={styles.pointsContainer}>
                        <BoltIconSolid size={18} color={theme.primary} />
                        <Text style={[styles.pointsText, { color: theme.primary }]}>{draft.points} {t('pts')}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 12,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    author: {
        fontSize: 14,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        marginLeft: 4,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});
