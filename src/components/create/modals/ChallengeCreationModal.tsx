import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { AppModal } from '@/src/components/common/AppModal';
import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useChallengeForm } from '@/src/hooks/create/useChallengeForm';
import { ChallengeType } from '@/src/types/models';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ChallengeTypeSelector } from './components/ChallengeTypeSelector';
import { GeneralChallengeInput } from './components/GeneralChallengeInput';
import { PointsStepper } from './components/PointsStepper';
import { RiddleInput } from './components/RiddleInput';
import { TriviaInputs } from './components/TriviaInputs';
import { TrueFalseInput } from './components/TrueFalseInput';

interface ChallengeCreationModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (challenge: any) => void;
    initialData?: any;
    alignment?: 'bottom' | 'center';
}

export default function ChallengeCreationModal({ visible, onClose, onSave, initialData, alignment = 'bottom' }: ChallengeCreationModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const { formState, updateField, handleSave } = useChallengeForm(onSave, onClose, initialData);
    const { title, content, answer, points, hint, type, tfAnswer, optionA, optionB, optionC, optionD } = formState;

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={initialData ? t('editChallenge') : t('addChallenge')}
            alignment={alignment}
            height="80%"
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <ChallengeTypeSelector selectedType={type} onSelect={(val) => updateField('type', val)} />

                    <GeneralChallengeInput
                        title={title} setTitle={(val) => updateField('title', val)}
                        content={content} setContent={(val) => updateField('content', val)}
                        hint={hint} setHint={(val) => updateField('hint', val)}
                        type={type}
                    />

                    {type === ChallengeType.TRIVIA && (
                        <TriviaInputs
                            optionA={optionA} setOptionA={(val) => updateField('optionA', val)}
                            optionB={optionB} setOptionB={(val) => updateField('optionB', val)}
                            optionC={optionC} setOptionC={(val) => updateField('optionC', val)}
                            optionD={optionD} setOptionD={(val) => updateField('optionD', val)}
                            correctOption={formState.correctOption}
                            setCorrectOption={(val) => updateField('correctOption', val)}
                        />
                    )}

                    {type === ChallengeType.TRUE_FALSE && (
                        <TrueFalseInput value={tfAnswer} onChange={(val) => updateField('tfAnswer', val)} />
                    )}

                    {type === ChallengeType.RIDDLE && (
                        <RiddleInput value={answer} onChange={(val) => updateField('answer', val)} />
                    )}

                    <PointsStepper points={points} onChange={(val) => updateField('points', val)} label={t('challengePoints')} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: theme.bgPrimary }]}>
                <AnimatedPressable
                    style={[styles.saveButton, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                >
                    <TextComponent style={styles.saveButtonText} color="white" bold variant="h3">
                        {t('addChallengeButton')}
                    </TextComponent>
                </AnimatedPressable>
            </View>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingVertical: 24,
        paddingHorizontal: 24,
        gap: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    saveButton: {
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
