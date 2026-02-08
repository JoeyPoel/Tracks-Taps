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
import StepBingo from '@/src/components/create/steps/StepBingo'; // Added import
import StepChallenges from '@/src/components/create/steps/StepChallenges'; // Added import
import StepGamemodes from '@/src/components/create/steps/StepGamemodes';
import StepInfo from '@/src/components/create/steps/StepInfo';
import StepReview from '@/src/components/create/steps/StepReview';
import StepStops from '@/src/components/create/steps/StepStops';
import { useLanguage } from '@/src/context/LanguageContext';
import { useCreateTour } from '@/src/hooks/useCreateTour';

export default function CreateTourWizard() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const {
        currentStep,
        totalSteps, // Added
        stepName,
        tourDraft,
        isSubmitting,
        updateDraft,
        handleNext,
        handleBack,
        actions
    } = useCreateTour();

    const renderStep = (options?: { footer?: React.ReactNode }) => {
        // ... (unchanged)
        const stepProps = { draft: tourDraft, updateDraft, actions };

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
                {stepName === 'Info' && <StepInfo {...stepProps} />}
                {stepName === 'Gamemodes' && <StepGamemodes {...stepProps} />}
                {stepName === 'Stops' && <StepStops {...stepProps} footer={options?.footer} />}
                {stepName === 'Bingo' && <StepBingo {...stepProps} />}
                {stepName === 'Challenges' && <StepChallenges {...stepProps} />}
                {stepName === 'Review' && <StepReview {...stepProps} />}
            </Animated.View>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper animateEntry={false} includeTop={false} includeBottom={false}>
            {/* Header ... */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                {/* ... */}
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">
                    {stepName === 'Info' && t('stepInfo')}
                    {stepName === 'Gamemodes' && t('stepGamemodes')}
                    {stepName === 'Stops' && t('stepStops')}
                    {stepName === 'Bingo' && 'Bingo Grid'}
                    {stepName === 'Challenges' && (t('stepChallenges') || 'Bonus Challenges')}
                    {stepName === 'Review' && t('stepReview')}
                </TextComponent>
                <View style={{ width: 40 }} />
            </View>

            <CreateTourProgress currentStep={currentStep} totalSteps={totalSteps} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                {stepName === 'Stops' ? (
                    <View style={[styles.content, { paddingBottom: 0, paddingHorizontal: 0 }]}>
                        {renderStep({
                            footer: (
                                <View style={styles.inlineFooter}>
                                    <AnimatedButton
                                        title={isSubmitting ? t('sending') : (currentStep === totalSteps - 1 ? t('createAndStart') : t('nextStep'))}
                                        onPress={handleNext}
                                        variant="primary"
                                        loading={isSubmitting}
                                    />
                                </View>
                            )
                        })}
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderStep()}

                        <View style={styles.inlineFooter}>
                            <AnimatedButton
                                title={isSubmitting ? t('sending') : (currentStep === totalSteps - 1 ? t('createAndStart') : t('nextStep'))}
                                onPress={handleNext}
                                variant="primary"
                                loading={isSubmitting}
                            />
                        </View>
                    </ScrollView>
                )}
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
