import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import { CircleStackIcon } from 'react-native-heroicons/solid';
import { AppModal } from '../common/AppModal';
import { TextComponent } from '../common/TextComponent';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface LockedTourModalProps {
    visible: boolean;
    onClose: () => void;
    currentStopIndex: number;
    totalStops: number;
    tokens: number;
    oneTokenPrice: string;
    isUnlocking: boolean;
    onUnlockWithToken: () => void;
    onUnlockWithCash: () => void;
    theme: any;
    t: (key: any) => string;
}

export const LockedTourModal: React.FC<LockedTourModalProps> = ({
    visible,
    onClose,
    currentStopIndex,
    totalStops,
    tokens,
    oneTokenPrice,
    isUnlocking,
    onUnlockWithToken,
    onUnlockWithCash,
    theme,
    t
}) => {
    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title=""
            alignment="center"
            zIndex={1000}
        >
            {/* Custom Big Block Title below the default slot */}
            <View style={{ alignItems: 'center', marginTop: -60, marginBottom: 20, zIndex: -1 }}>
                <TextComponent
                    variant="h1"
                    style={{
                        fontSize: 26,
                        fontWeight: '900',
                        letterSpacing: 1.5,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        color: theme.textPrimary
                    }}
                >
                    {t('continueAdventure') || "Continue the Adventure"}
                </TextComponent>
            </View>

            {/* Progress Teaser */}
            <View style={styles.progressContainer}>
                <TextComponent color={theme.textPrimary} variant="label" bold style={styles.progressText}>
                    {`${t('progress') || "Progress"}: ${currentStopIndex} / ${totalStops} ${t('stops') || "Stops"}`}
                </TextComponent>
                <View style={[styles.progressBarTrack, { backgroundColor: theme.bgSecondary }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${((currentStopIndex) / (totalStops || 1)) * 100}%`
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Anticipation (Pulsing Icon) */}
            <View style={styles.pulseContainerWrapper}>
                <Animated.View style={[styles.pulseIconContainer]}>
                    <LockClosedIcon size={56} color="#FFD700" />
                </Animated.View>
            </View>

            {/* Value‑Driven Copy */}
            <TextComponent color={theme.textPrimary} variant="body" center style={styles.valueCopy}>
                {t('unlockCopy') || "To keep the incredible party going for the entire squad and explore more unique stops and challenges, one hero can unlock the full tour for everyone now."}
            </TextComponent>

            {/* Token Balance */}
            <View style={[styles.tokenBalanceContainer, { backgroundColor: theme.bgSecondary, borderColor: 'rgba(255,215,0,0.25)', borderWidth: 1 }]}>
                <TextComponent color={theme.textSecondary} variant="caption" bold>
                    {t('yourTokenBalance') || "YOUR TOKEN BALANCE"}
                </TextComponent>
                <View style={styles.tokenBalanceValueRow}>
                    <CircleStackIcon size={20} color="#FFD700" />
                    <TextComponent color="#FFD700" bold variant="h3">
                        {tokens}
                    </TextComponent>
                </View>
            </View>

            {/* Choice Architecture */}
            <View style={styles.lockActionButtons}>
                <AnimatedPressable
                    style={[
                        styles.primaryHeroButton,
                        isUnlocking && { opacity: 0.5 },
                    ]}
                    disabled={isUnlocking}
                    onPress={onUnlockWithToken}
                    interactionScale="medium"
                    haptic="success"
                >
                    <View style={styles.buttonContent}>
                        <TextComponent color="#15151A" bold variant="body" center>
                            {t('beTheSquadHero') || "BE THE SQUAD HERO"}
                        </TextComponent>
                        <TextComponent color="rgba(21, 21, 26, 0.7)" variant="caption" center>
                            {t('useOneToken') || "Use 1 Token (For Everyone!)"}
                        </TextComponent>
                    </View>
                </AnimatedPressable>

                <AnimatedPressable
                    style={styles.secondaryCashButton}
                    disabled={isUnlocking}
                    onPress={onUnlockWithCash}
                    interactionScale="medium"
                    haptic="success"
                >
                    <View style={styles.buttonContent}>
                        <TextComponent color="#FFD700" bold variant="body" center>
                            {`${t('unlockWithCash')} (${oneTokenPrice})`}
                        </TextComponent>
                        <TextComponent color={theme.textSecondary} variant="caption" center>
                            {t('priceOneBeer') || "(The price of only 1 beer!)"}
                        </TextComponent>
                    </View>
                </AnimatedPressable>
            </View>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        width: '100%',
        marginBottom: 16,
        alignItems: 'center',
    },
    progressText: {
        marginBottom: 8,
    },
    progressBarTrack: {
        width: '100%',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 5,
    },
    pulseContainerWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
    },
    pulseIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 215, 0, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.5)',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 8,
    },
    valueCopy: {
        lineHeight: 22,
        marginBottom: 20,
        opacity: 0.85,
    },
    tokenBalanceContainer: {
        width: '100%',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tokenBalanceValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    lockActionButtons: {
        width: '100%',
        gap: 12,
    },
    primaryHeroButton: {
        width: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 8,
    },
    secondaryCashButton: {
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,215,0,0.45)',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    }
});
