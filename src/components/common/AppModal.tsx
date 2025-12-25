import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { AnimatedPressable } from './AnimatedPressable';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    subtitle?: string;
    headerRight?: React.ReactNode;
}

export function AppModal({ visible, onClose, title, icon, children, subtitle, headerRight }: AppModalProps) {
    const { theme } = useTheme();
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90,
            }).start();
        } else {
            slideAnim.setValue(Dimensions.get('window').height);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: theme.bgPrimary,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            {icon}
                            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {headerRight}
                            <AnimatedPressable onPress={handleClose} interactionScale="subtle" haptic="light">
                                <XMarkIcon size={24} color={theme.textSecondary} />
                            </AnimatedPressable>
                        </View>
                    </View>

                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {subtitle}
                        </Text>
                    )}

                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
});
