
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BoltIcon as BoltIconSolid, StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { GenericCard } from '../../common/GenericCard';
import { TextComponent } from '../../common/TextComponent';
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
        <GenericCard style={styles.card} padding="none">
            <ReviewCardHeader draft={draft} />

            <View style={styles.content}>
                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">
                    {draft.title}
                </TextComponent>
                <TextComponent style={styles.author} color={theme.textSecondary} variant="caption">
                    {t('by')} {t('you')}
                </TextComponent>

                <ReviewCardStats draft={draft} updateDraft={updateDraft} />

                <View style={styles.footer}>
                    <View style={styles.ratingContainer}>
                        <StarIconSolid size={18} color={theme.starColor} />
                        <TextComponent style={styles.ratingText} color={theme.textPrimary} bold variant="body">
                            {t('new')}
                        </TextComponent>
                        <TextComponent style={styles.reviewCount} color={theme.textSecondary} variant="caption">
                            (0)
                        </TextComponent>
                    </View>

                    <View style={styles.pointsContainer}>
                        <BoltIconSolid size={18} color={theme.primary} />
                        <TextComponent style={styles.pointsText} color={theme.primary} bold variant="body">
                            {draft.points} {t('pts')}
                        </TextComponent>
                    </View>
                </View>
            </View>
        </GenericCard>
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
