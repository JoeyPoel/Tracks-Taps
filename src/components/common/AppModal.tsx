import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
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

export function AppModal({
    visible,
    onClose,
    title,
    icon,
    children,
    subtitle,
    headerRight,
    height,
    modalStyle,
    alignment = 'bottom'
}: AppModalProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const isBottom = alignment === 'bottom';
    const screenHeight = Dimensions.get('window').height;

    // Default height logic
    const computedHeight = height || (isBottom ? '90%' : undefined);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none" // We use Reanimated
            onRequestClose={onClose}
        >
            <View style={styles.overlayContainer}>
                {/* Backdrop */}
                <Pressable
                    style={[styles.backdrop, { backgroundColor: theme.overlay }]}
                    onPress={onClose}
                >
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        exiting={FadeOut.duration(400)}
                        style={StyleSheet.absoluteFill}
                    />
                </Pressable>

                {/* Modal Window */}
                <View
                    style={[
                        styles.windowWrapper,
                        isBottom ? styles.wrapperBottom : styles.wrapperCenter,
                    ]}
                    pointerEvents="box-none"
                >
                    <Animated.View
                        entering={SlideInDown.duration(600)}
                        exiting={SlideOutDown.duration(600)}
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.bgPrimary,
                                maxHeight: isBottom ? '95%' : '80%',
                                height: computedHeight,
                                paddingBottom: isBottom ? Math.max(insets.bottom, 20) : 20,
                                ...(isBottom ? styles.cardBottom : styles.cardCenter)
                            },
                            modalStyle
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTop}>
                                <View style={styles.titleRow}>
                                    {icon}
                                    <TextComponent style={styles.titleText} color={theme.textPrimary} bold variant="h2" numberOfLines={1}>
                                        {title}
                                    </TextComponent>
                                </View>
                                <View style={styles.headerActions}>
                                    {headerRight}
                                    <AnimatedPressable onPress={onClose} interactionScale="subtle" haptic="light" style={styles.closeBtn}>
                                        <XMarkIcon size={24} color={theme.textSecondary} />
                                    </AnimatedPressable>
                                </View>
                            </View>

                            {subtitle && (
                                <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                                    {subtitle}
                                </TextComponent>
                            )}
                        </View>

                        {/* Content */}
                        <View style={[styles.content, { paddingHorizontal: 24 }]}>
                            {children}
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        // zIndex: 1000, // Modals are top level anyway
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    windowWrapper: {
        flex: 1,
        pointerEvents: 'box-none', // Allow touches to pass through empty areas to backdrop
    },
    wrapperBottom: {
        justifyContent: 'flex-end',
    },
    wrapperCenter: {
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        overflow: 'hidden', // Clip content to radius
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    cardBottom: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    cardCenter: {
        width: '100%',
        borderRadius: 24,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    titleText: {
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        marginTop: -4,
    },
    content: {
        flex: 1,
    }
});
