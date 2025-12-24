import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TourDraft, useTourDraft } from './create/useTourDraft';
import { useTourSubmission } from './create/useTourSubmission';

export const STEPS = ['Info', 'Gamemodes', 'Stops', 'Review'];
export type { TourDraft }; // Re-export for compatibility

export function useCreateTour() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(0);

    const { tourDraft, updateDraft, actions } = useTourDraft();
    const { isSubmitting, submitTour } = useTourSubmission(user);

    const handleNext = () => {
        // Validation check before next step
        if (currentStep === 0) {
            if (!tourDraft.title || !tourDraft.location) {
                Alert.alert(t('missingInfo'), t('fillAllFields'));
                return;
            }
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitTour(tourDraft);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    return {
        currentStep,
        totalSteps: STEPS.length,
        stepName: STEPS[currentStep],
        tourDraft,
        isSubmitting,
        updateDraft,
        handleNext,
        handleBack,
        actions
    };
}
