import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import CreateTourProgress from '@/src/components/create/CreateTourProgress';
import StepGamemodes from '@/src/components/create/steps/StepGamemodes';
import StepInfo from '@/src/components/create/steps/StepInfo';
import StepReview from '@/src/components/create/steps/StepReview';
import StepStops from '@/src/components/create/steps/StepStops';
import { useLanguage } from '@/src/context/LanguageContext';
import { STEPS, useCreateTour } from '@/src/hooks/useCreateTour';

export default function CreateTourWizard() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const {
        currentStep,
        stepName,
        tourDraft,
        isSubmitting,
        updateDraft,
        handleNext,
        handleBack,
        actions // Destructure actions
    } = useCreateTour();

    const renderStep = () => {
        // Step specific props can be passed here
        const stepProps = { draft: tourDraft, updateDraft, actions }; // Pass actions

        // Only animate if not the first step on initial load
        const enteringAnim = currentStep === 0
            ? undefined
            : FadeInRight.duration(300);

        return (
            <Animated.View
                key={currentStep}
                entering={enteringAnim}
                exiting={FadeOutLeft.duration(200)}
                style={{ flex: 1 }}
            >
                {currentStep === 0 && <StepInfo {...stepProps} />}
                {currentStep === 1 && <StepGamemodes {...stepProps} />}
                {currentStep === 2 && <StepStops {...stepProps} />}
                {currentStep === 3 && <StepReview {...stepProps} />}
            </Animated.View>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper animateEntry={false} includeTop={false} includeBottom={false}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">
                    {currentStep === 0 && t('stepInfo')}
                    {currentStep === 1 && t('stepGamemodes')}
                    {currentStep === 2 && t('stepStops')}
                    {currentStep === 3 && t('stepReview')}
                </TextComponent>
                <View style={{ width: 40 }} />
            </View>

            <CreateTourProgress currentStep={currentStep} totalSteps={STEPS.length} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {renderStep()}

                    <View style={styles.inlineFooter}>
                        <AnimatedButton
                            title={isSubmitting ? t('sending') : (currentStep === STEPS.length - 1 ? t('createAndStart') : t('nextStep'))}
                            onPress={handleNext}
                            variant="primary"
                            loading={isSubmitting}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    navBtn: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 120, // Standardized spacing for tab bar
        flexGrow: 1,
    },
    inlineFooter: {
        marginTop: 40,
    },
});
