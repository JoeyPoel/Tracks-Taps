import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AnimatedPressable } from '../../common/AnimatedPressable';
import { AppModal } from '../../common/AppModal';
import { TextComponent } from '../../common/TextComponent';

export interface SelectionOption {
    label: string;
    value: any;
    icon?: any;
    color?: string;
}

interface SelectionModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: SelectionOption[];
    onSelect: (value: any) => void;
    currentValue?: any;
}

export function SelectionModal({
    visible,
    onClose,
    title,
    options,
    onSelect,
    currentValue
}: SelectionModalProps) {
    const { theme } = useTheme();

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={title}
            alignment="center"
        >
            <ScrollView style={styles.optionsList} contentContainerStyle={styles.optionsContent}>
                {options.map((option, index) => {
                    const isSelected = currentValue === option.value;
                    const Icon = option.icon;

                    return (
                        <AnimatedPressable
                            key={index}
                            onPress={() => {
                                onSelect(option.value);
                                onClose();
                            }}
                            style={[
                                styles.optionItem,
                                {
                                    backgroundColor: isSelected ? theme.primary : theme.bgTertiary,
                                }
                            ]}
                        >
                            <View style={styles.optionLeft}>
                                {Icon && (
                                    <Icon size={20} color={isSelected ? '#FFF' : (option.color || theme.textSecondary)} />
                                )}
                                <TextComponent
                                    style={styles.optionLabel}
                                    color={isSelected ? '#FFF' : theme.textPrimary}
                                    bold
                                    variant="body"
                                >
                                    {option.label}
                                </TextComponent>
                            </View>

                            {isSelected && <Ionicons name="checkmark" size={20} color="#FFF" />}
                        </AnimatedPressable>
                    );
                })}
            </ScrollView>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    optionsList: {
        maxHeight: 400,
    },
    optionsContent: {
        gap: 12,
        paddingBottom: 20
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionLabel: {
        // fontSize and fontWeight handled by TextComponent
    },
});
