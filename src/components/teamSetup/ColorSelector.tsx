import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TEAM_COLORS } from '../../utils/teamUtils';

interface ColorSelectorProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onSelect }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('teamColor')}</Text>
            <View style={styles.grid}>
                {TEAM_COLORS.map(color => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.option,
                            { backgroundColor: color },
                            selectedColor === color && styles.selectedOption
                        ]}
                        onPress={() => onSelect(color)}
                    >
                        {selectedColor === color && (
                            <CheckIcon size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    option: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedOption: {
        borderWidth: 3,
        borderColor: '#FFF',
    },
});
