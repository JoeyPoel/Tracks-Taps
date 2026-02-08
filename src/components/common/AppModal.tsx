import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import Animated, { SlideInDown, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { TextComponent } from './TextComponent';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    subtitle?: string;
    headerRight?: React.ReactNode;
    height?: number | string;
    modalStyle?: any;
    alignment?: 'bottom' | 'center';
}

export function AppModal({ visible, onClose, title, icon, children, subtitle, headerRight, height, modalStyle, alignment = 'bottom' }: AppModalProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const isBottom = alignment === 'bottom';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable
                style={[
                    styles.modalOverlay,
                    {
                        backgroundColor: theme.overlay,
                        justifyContent: isBottom ? 'flex-end' : 'center',
                        padding: isBottom ? 0 : 20
                    }
                ]}
                onPress={onClose}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <Animated.View
                        entering={SlideInDown.duration(450)}
                        exiting={ZoomOut.duration(200)}
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: theme.bgPrimary,
                                ...(height ? { height } : { maxHeight: '90%' }),
                                ...(isBottom ? {
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    paddingBottom: Math.max(insets.bottom, 24), // Ensure content above safe area
                                } : {
                                    borderRadius: 24
                                }),
                                ...modalStyle
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                {icon}
                                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">{title}</TextComponent>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {headerRight}
                                <AnimatedPressable onPress={onClose} interactionScale="subtle" haptic="light">
                                    <XMarkIcon size={24} color={theme.textSecondary} />
                                </AnimatedPressable>
                            </View>
                        </View>

                        {subtitle && (
                            <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                                {subtitle}
                            </TextComponent>
                        )}

                        {children}
                    </Animated.View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        height: '100%',
    },
    modalContent: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        // handled
    },
    subtitle: {
        marginBottom: 24,
    },
});
