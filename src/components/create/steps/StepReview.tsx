import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ReviewCard } from '../common/ReviewCard';

interface StepReviewProps {
    draft: TourDraft;
    updateDraft: (key: keyof TourDraft, value: any) => void;
}

export default function StepReview({ draft, updateDraft }: StepReviewProps) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <WizardStepHeader
                title={t('stepReviewTitle')}
                subtitle={t('stepReviewSubtitle')}
            />
            <ReviewCard draft={draft} updateDraft={updateDraft} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
});
