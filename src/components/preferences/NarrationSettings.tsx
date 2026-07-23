import React from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from '../common/TextComponent';

interface NarrationSettingsProps {
    narrationMode: 'off' | 'tour-only' | 'full';
    setNarrationMode: (mode: 'off' | 'tour-only' | 'full') => void;
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    showSpeakButtons: boolean;
    setShowSpeakButtons: (show: boolean) => void;
    theme: any;
    t: (key: any) => string;
    speak: (text: string, force?: boolean, rate?: number) => void;
}

export const NarrationSettings: React.FC<NarrationSettingsProps> = ({
    narrationMode,
    setNarrationMode,
    speechRate,
    setSpeechRate,
    showSpeakButtons,
    setShowSpeakButtons,
    theme,
    t,
    speak
}) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <TextComponent color={theme.textSecondary} variant="caption">
                    {t('accessibilityNarrationDesc')}
                </TextComponent>
            </View>
            
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
                {[
                    { id: 'off', label: t('off'), desc: t('noNarration') },
                    { id: 'tour-only', label: t('tourOnly'), desc: t('duringTours') },
                    { id: 'full', label: t('fullApp'), desc: t('narrateAllScreens') },
                ].map((modeOpt) => {
                    const isActive = narrationMode === modeOpt.id;
                    return (
                        <Pressable
                            key={modeOpt.id}
                            onPress={() => {
                                setNarrationMode(modeOpt.id as any);
                                const formatString = require('../../utils/stringUtils').formatString;
                                speak(formatString(t('narrationModeChangedTo'), modeOpt.label), true);
                            }}
                            style={[
                                styles.themeOption,
                                {
                                    flex: 1,
                                    backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                    borderWidth: isActive ? 1.5 : 1,
                                    paddingVertical: 10,
                                    borderRadius: 14,
                                }
                            ]}
                        >
                            <Ionicons
                                name={modeOpt.id === 'off' ? 'volume-mute-outline' : modeOpt.id === 'tour-only' ? 'walk-outline' : 'megaphone-outline'}
                                size={22}
                                color={isActive ? theme.primary : theme.textSecondary}
                                style={{ marginBottom: 6 }}
                            />
                            <TextComponent color={isActive ? theme.primary : theme.textPrimary} bold={isActive} variant="caption">
                                {modeOpt.label}
                            </TextComponent>
                            <TextComponent color={theme.textTertiary} variant="caption" style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
                                {modeOpt.desc}
                            </TextComponent>
                            {isActive && (
                                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                    <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* Speech Rate Control */}
            <View style={{ borderTopWidth: 1, borderTopColor: theme.borderSecondary, padding: 16 }}>
                <TextComponent color={theme.textPrimary} bold variant="body" style={{ marginBottom: 12 }}>
                    {t('voiceNarrationSpeed')}
                </TextComponent>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[
                        { rate: 0.75, label: t('slower') },
                        { rate: 1.0, label: t('normal') },
                        { rate: 1.25, label: t('faster') },
                        { rate: 1.4, label: t('fast') },
                    ].map((rateOpt) => {
                        const isActive = speechRate === rateOpt.rate;
                        return (
                            <Pressable
                                key={rateOpt.rate}
                                onPress={() => {
                                    setSpeechRate(rateOpt.rate);
                                    const formatString = require('../../utils/stringUtils').formatString;
                                    speak(formatString(t('narrationSpeedChangedTo' as any) || 'Narration speed changed to {0}', rateOpt.label), true, rateOpt.rate);
                                }}
                                style={{
                                    flex: 1,
                                    height: 38,
                                    borderRadius: 10,
                                    backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                }}
                            >
                                <TextComponent color={isActive ? theme.textOnPrimary : theme.textPrimary} bold={isActive} variant="caption">
                                    {rateOpt.label}
                                </TextComponent>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Show Speak Buttons Option */}
            <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSecondary, borderBottomWidth: 0, paddingHorizontal: 16, paddingVertical: 14 }]}>
                <View style={styles.rowInfo}>
                    <TextComponent color={theme.textPrimary} bold variant="body">
                        {t('showSpeakerIcons')}
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} variant="caption">
                        {t('showSpeakerIconsDesc')}
                    </TextComponent>
                </View>
                <Switch
                    value={showSpeakButtons}
                    onValueChange={setShowSpeakButtons}
                    trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
                    thumbColor={showSpeakButtons ? theme.primary : '#f4f3f4'}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    themeOption: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowInfo: {
        flex: 1,
        paddingRight: 16,
    }
});
