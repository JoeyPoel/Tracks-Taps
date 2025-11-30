import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
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
                <TouchableOpacity
                    style={[styles.navButton, styles.secondaryButton, { borderColor: theme.textSecondary }]}
                    onPress={onPrevStop}
                >
                    <Text style={[styles.navButtonText, { color: theme.textSecondary }]}>{t('back')}</Text>
                </TouchableOpacity>
            )}

            {isLastStop ? (
                <View style={{ flex: 1 }}>
                    <StartTourButton onPress={onFinishTour} buttonText={t('finishTour')} />
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.navButton, styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={onNextStop}
                >
                    <Text style={[styles.navButtonText, { color: theme.fixedWhite }]}>{t('next')}</Text>
                </TouchableOpacity>
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
