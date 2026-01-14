import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { tourService } from '../services/tourService';
import { TourDraft, useTourDraft } from './create/useTourDraft';
import { useTourSubmission } from './create/useTourSubmission';

export const STEPS = ['Info', 'Gamemodes', 'Stops', 'Challenges', 'Review'];
export type { TourDraft }; // Re-export for compatibility

import { useSafeNavigation } from './useSafeNavigation';

export function useCreateTour() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();
    const tourId = params.tourId ? Number(params.tourId) : null;
    const { goBack } = useSafeNavigation();

    const [currentStep, setCurrentStep] = useState(0);



    const { tourDraft, updateDraft, setDraft, resetDraft, actions } = useTourDraft();
    const { isSubmitting, submitTour } = useTourSubmission(user, tourId);

    useEffect(() => {
        if (tourId) {
            loadTourData(tourId);
        } else {
            // Fresh create mode - ensure clean state
            resetDraft();
            setCurrentStep(0);
        }
    }, [tourId]);

    const loadTourData = async (id: number) => {
        try {
            const tour = await tourService.getTourById(id);
            if (tour) {
                // Map API response to TourDraft
                // Assuming tour object from API matches structure or needs minor mapping
                // You might need to adjust this mapping based on your actual API response shape
                const draft: TourDraft = {
                    title: tour.title,
                    description: tour.description,
                    location: tour.location || '',
                    imageUrl: tour.imageUrl,
                    difficulty: tour.difficulty,
                    modes: tour.modes || [],
                    stops: tour.stops || [],
                    distance: tour.distance?.toString() || '0',
                    duration: tour.duration?.toString() || '0',
                    points: tour.points || 0,
                    genre: tour.genre,
                    startLat: tour.startLat,
                    startLng: tour.startLng,
                    type: tour.type,
                    challenges: tour.challenges || [],
                    bingoChallenges: tour.bingoChallenges || [] // Ensure DB has this or map it
                };
                setDraft(draft);
            }
        } catch (error) {
            console.error("Failed to load tour for editing", error);
            Alert.alert("Error", "Failed to load tour details");
        }
    };

    const getSteps = () => {
        const steps = ['Info', 'Gamemodes', 'Stops'];
        if (tourDraft.modes.includes('BINGO')) {
            steps.push('Bingo');
        }
        steps.push('Challenges', 'Review');
        return steps;
    };

    const steps = getSteps();

    const handleNext = () => {
        // Validation check before next step
        if (currentStep === 0) {
            if (!tourDraft.title || !tourDraft.location || !tourDraft.imageUrl) {
                Alert.alert(t('missingInfo'), t('fillAllFields'));
                return;
            }
        }

        if (steps[currentStep] === 'Bingo') {
            if (tourDraft.bingoChallenges.length !== 9) {
                Alert.alert(t('missingInfo') || "Incomplete", "Bingo requires exactly 9 challenges to form a 3x3 grid.");
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitTour(tourDraft);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            if (tourId) {
                // Determine if we should warn the user.
                // It's safer to always warn when editing to prevent data loss.
                Alert.alert(
                    t('discardChanges'),
                    t('discardChangesMessage'),
                    [
                        { text: t('cancel'), style: "cancel" },
                        {
                            text: t('discard'),
                            style: "destructive",
                            onPress: () => {
                                resetDraft();
                                goBack();
                            }
                        }
                    ]
                );
            } else {
                goBack();
            }
        }
    };

    return {
        currentStep,
        totalSteps: steps.length,
        stepName: steps[currentStep],
        steps,
        tourDraft,
        isSubmitting,
        updateDraft,
        handleNext,
        handleBack,
        actions
    };
}
