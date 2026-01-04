import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Animated, Dimensions, Modal, StyleSheet, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
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

    const isBottom = alignment === 'bottom';

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={[
                styles.modalOverlay,
                {
                    backgroundColor: theme.overlay,
                    justifyContent: isBottom ? 'flex-end' : 'center',
                    padding: isBottom ? 0 : 20
                }
            ]}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: theme.bgPrimary,
                            transform: [{ translateY: slideAnim }],
                            ...(height ? { height } : { maxHeight: '90%' }),
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            borderRadius: isBottom ? 0 : 24,
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
                            <AnimatedPressable onPress={handleClose} interactionScale="subtle" haptic="light">
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
            </View>
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
