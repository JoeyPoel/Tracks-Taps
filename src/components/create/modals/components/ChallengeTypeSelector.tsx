import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { useTheme } from '@/src/context/ThemeContext';
import { ChallengeType } from '@/src/types/models';
import { getChallengeIconProps } from '@/src/utils/challengeIcons';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

interface ChallengeTypeSelectorProps {
    selectedType: ChallengeType;
    onSelect: (type: ChallengeType) => void; // Fixed type definition
}

export function ChallengeTypeSelector({ selectedType, onSelect }: ChallengeTypeSelectorProps) {
    const { theme } = useTheme();

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
            {(Object.values(ChallengeType) as ChallengeType[]).map((tVal) => {
                const { icon, label, color } = getChallengeIconProps(tVal, theme);
                const isSelected = selectedType === tVal;
                return (
                    <AnimatedPressable
                        key={tVal}
                        style={[
                            styles.typeCard,
                            {
                                backgroundColor: isSelected ? color + '15' : theme.bgSecondary,
                                borderColor: isSelected ? color : theme.borderPrimary,
                            }
                        ]}
                        onPress={() => onSelect(tVal)}
                    >
                        <Ionicons name={icon as any} size={24} color={color} />
                        <Text style={[styles.typeText, { color: isSelected ? color : theme.textPrimary }]}>
                            {label}
                        </Text>
                    </AnimatedPressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    typeScroll: {
        gap: 12,
        paddingBottom: 20,
    },
    typeCard: {
        width: 100,
        padding: 12,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    typeText: {
        fontWeight: '700',
        fontSize: 12,
    },
});
