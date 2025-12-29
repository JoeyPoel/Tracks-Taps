import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedPressable } from '../../common/AnimatedPressable';

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
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                <View style={[styles.content, { backgroundColor: theme.bgSecondary }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

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
                                        <Text style={[
                                            styles.optionLabel,
                                            { color: isSelected ? '#FFF' : theme.textPrimary }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </View>

                                    {isSelected && <Ionicons name="checkmark" size={20} color="#FFF" />}
                                </AnimatedPressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    content: {
        borderRadius: 24,
        maxHeight: '70%',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    optionsList: {

    },
    optionsContent: {
        padding: 16,
        gap: 12,
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
        fontSize: 16,
        fontWeight: '600',
    },
});
