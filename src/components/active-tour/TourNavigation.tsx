import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';
import StartTourButton from '../TourButton';

interface TourNavigationProps {
    currentStopIndex: number;
    isLastStop: boolean;
    onPrevStop: () => void;
    onNextStop: () => void;
    onFinishTour: () => void;
}

const TourNavigation: React.FC<TourNavigationProps> = ({
    currentStopIndex,
    isLastStop,
    onPrevStop,
    onNextStop,
    onFinishTour,
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.navigationContainer}>
            {currentStopIndex > 0 && (
                <AnimatedPressable
                    style={[styles.navButton, styles.secondaryButton, { borderColor: theme.textSecondary }]}
                    onPress={onPrevStop}
                    interactionScale="medium"
                    haptic="light"
                >
                    <Text style={[styles.navButtonText, { color: theme.textSecondary }]}>{t('back')}</Text>
                </AnimatedPressable>
            )}

            {isLastStop ? (
                <View style={{ flex: 1 }}>
                    <StartTourButton onPress={onFinishTour} buttonText={t('finishTour')} />
                </View>
            ) : (
                <AnimatedPressable
                    style={[styles.navButton, styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={onNextStop}
                    interactionScale="medium"
                    haptic="medium"
                >
                    <Text style={[styles.navButtonText, { color: theme.fixedWhite }]}>{t('next')}</Text>
                </AnimatedPressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        gap: 16,
    },
    navButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        // Background color set in inline style
    },
    secondaryButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TourNavigation;
