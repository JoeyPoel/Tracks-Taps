import React from 'react';
import { View, Switch, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from '../common/TextComponent';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { adminStyles as styles } from './adminStyles';
import { HOLIDAY_THEMES } from '../../constants/themes';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsTabProps {
    adminState: {
        theme: any;
        language: string;
        freeEnabled: boolean;
        setFreeEnabled: (val: boolean) => void;
        untilDate: Date | null;
        globalThemeOverride: string | null;
        setGlobalThemeOverride: (val: string | null) => void;
        autoThemeEnabled: boolean;
        setAutoThemeEnabled: (val: boolean) => void;
        showUnmoderatedTours: boolean;
        setShowUnmoderatedTours: (val: boolean) => void;
        currentMonth: number;
        currentYear: number;
        months: string[];
        handleSelectDay: (day: number) => void;
        handleMonthChange: (direction: 'prev' | 'next') => void;
        getDaysInMonth: (year: number, month: number) => number;
        getFirstDayOfMonth: (year: number, month: number) => number;
        getFormattedPresetCheck: (val: number | null) => boolean;
        setQuickPreset: (val: number | null) => void;
        handleSaveSettings: () => void;
        saving: boolean;
    };
}

export function SettingsTab({ adminState }: SettingsTabProps) {
    const { t } = useLanguage();
    const {
        theme,
        language,
        freeEnabled,
        setFreeEnabled,
        untilDate,
        globalThemeOverride,
        setGlobalThemeOverride,
        autoThemeEnabled,
        setAutoThemeEnabled,
        showUnmoderatedTours,
        setShowUnmoderatedTours,
        currentMonth,
        currentYear,
        months,
        handleSelectDay,
        handleMonthChange,
        getDaysInMonth,
        getFirstDayOfMonth,
        getFormattedPresetCheck,
        setQuickPreset,
        handleSaveSettings,
        saving
    } = adminState;

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

        const daysArray = [];
        for (let i = 0; i < firstDayIndex; i++) {
            daysArray.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const thisDate = new Date(currentYear, currentMonth, day);
            const isPast = thisDate.getTime() < today.getTime();

            const isSelected = untilDate &&
                untilDate.getDate() === day &&
                untilDate.getMonth() === currentMonth &&
                untilDate.getFullYear() === currentYear;

            const isToday = today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

            daysArray.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                        styles.calendarDayCell,
                        isSelected && { backgroundColor: theme.primary },
                        isPast && styles.calendarDayCellDisabled
                    ]}
                    onPress={() => !isPast && handleSelectDay(day)}
                    disabled={isPast}
                >
                    <TextComponent
                        variant="caption"
                        bold={isSelected || isToday}
                        color={
                            isSelected
                                ? theme.textOnPrimary
                                : isPast
                                    ? theme.textTertiary + '80'
                                    : isToday
                                        ? theme.primary
                                        : theme.textPrimary
                        }
                    >
                        {day}
                    </TextComponent>
                    {isToday && !isSelected && (
                        <View style={[styles.todayIndicator, { backgroundColor: theme.primary }]} />
                    )}
                </TouchableOpacity>
            );
        }

        return daysArray;
    };

    return (
        <View style={styles.sectionContainer}>
            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                {t('globalAppConfig')}
            </TextComponent>

            {/* Enable Free Tours Card */}
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <TextComponent variant="body" bold color={theme.textPrimary}>
                            {t('enableGlobalFreeTours')}
                        </TextComponent>
                        <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                            {t('enableGlobalFreeToursDesc')}
                        </TextComponent>
                    </View>
                    <Switch
                        value={freeEnabled}
                        onValueChange={setFreeEnabled}
                        trackColor={{ false: theme.bgInput, true: theme.primary }}
                        thumbColor={Platform.OS === 'ios' ? theme.textOnPrimary : (freeEnabled ? theme.primary : '#f4f3f4')}
                    />
                </View>
            </View>

            {freeEnabled && (
                <>
                    <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                        {t('durationExpiration')}
                    </TextComponent>

                    {/* Presets Card */}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                            {t('quickPresets')}
                        </TextComponent>
                        <View style={styles.quickDates}>
                            {[
                                { label: t('indefinite'), value: null },
                                { label: t('oneDay'), value: 1 },
                                { label: t('threeDays'), value: 3 },
                                { label: t('oneWeek'), value: 7 },
                            ].map((opt) => {
                                const isActive = getFormattedPresetCheck(opt.value);
                                return (
                                    <TouchableOpacity
                                        key={opt.label}
                                        style={[
                                            styles.presetCard,
                                            {
                                                backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                                borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                                borderWidth: 1.5
                                            }
                                        ]}
                                        onPress={() => setQuickPreset(opt.value)}
                                    >
                                        <TextComponent
                                            variant="caption"
                                            bold={isActive}
                                            color={isActive ? theme.textOnPrimary : theme.textSecondary}
                                        >
                                            {opt.label}
                                        </TextComponent>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Custom Expiration Date Picker (Calendar Grid) */}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                            {t('setCustomExpirationDate')}
                        </TextComponent>

                        {/* Calendar Header with Month/Year Navigation */}
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity
                                onPress={() => handleMonthChange('prev')}
                                style={[styles.calendarMonthNav, { backgroundColor: theme.bgPrimary }]}
                            >
                                <Ionicons name="chevron-back" size={18} color={theme.textPrimary} />
                            </TouchableOpacity>
                            <TextComponent variant="body" bold color={theme.textPrimary}>
                                {months[currentMonth]} {currentYear}
                            </TextComponent>
                            <TouchableOpacity
                                onPress={() => handleMonthChange('next')}
                                style={[styles.calendarMonthNav, { backgroundColor: theme.bgPrimary }]}
                            >
                                <Ionicons name="chevron-forward" size={18} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Days of week */}
                        <View style={styles.weekDaysRow}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                <TextComponent
                                    key={d}
                                    variant="caption"
                                    bold
                                    color={theme.textTertiary}
                                    style={styles.weekDayHeader}
                                >
                                    {d}
                                </TextComponent>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.daysGrid}>
                            {renderCalendar()}
                        </View>
                    </View>

                    {/* Active Until Status Card */}
                    {untilDate && (
                        <View style={[styles.statusCard, { backgroundColor: theme.primary + '10' }]}>
                            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 10 }}>
                                {t('freeToursActiveUntil')} {untilDate.toLocaleDateString()}
                            </TextComponent>
                        </View>
                    )}
                </>
            )}

            {/* Show Unmoderated Tours Card */}
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, marginTop: 12 }]}>
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <TextComponent variant="body" bold color={theme.textPrimary}>
                            {t('showUnmoderatedTours')}
                        </TextComponent>
                        <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                            {t('showUnmoderatedToursDesc')}
                        </TextComponent>
                    </View>
                    <Switch
                        value={showUnmoderatedTours}
                        onValueChange={setShowUnmoderatedTours}
                        trackColor={{ false: theme.bgInput, true: theme.primary }}
                        thumbColor={Platform.OS === 'ios' ? theme.textOnPrimary : (showUnmoderatedTours ? theme.primary : '#f4f3f4')}
                    />
                </View>
            </View>

            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                {t('globalThemeSettings')}
            </TextComponent>

            {/* Automatic Holiday Theme Toggle */}
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <TextComponent variant="body" bold color={theme.textPrimary}>
                            {t('automaticHolidayThemes')}
                        </TextComponent>
                        <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                            {t('automaticHolidayThemesDesc')}
                        </TextComponent>
                    </View>
                    <Switch
                        value={autoThemeEnabled}
                        onValueChange={setAutoThemeEnabled}
                        trackColor={{ false: theme.bgInput, true: theme.primary }}
                        thumbColor={Platform.OS === 'ios' ? theme.textOnPrimary : (autoThemeEnabled ? theme.primary : '#f4f3f4')}
                    />
                </View>
            </View>

            {/* Global Theme Override Selection */}
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <TextComponent variant="caption" bold color={theme.textSecondary} style={styles.cardLabel}>
                    {t('globalHolidayThemeOverride')}
                </TextComponent>
                <View style={{ height: 8 }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    <TouchableOpacity
                        style={[
                            styles.presetCard,
                            {
                                backgroundColor: globalThemeOverride === null ? theme.primary : theme.bgPrimary,
                                borderColor: globalThemeOverride === null ? 'transparent' : theme.borderPrimary,
                                borderWidth: 1.5
                            }
                        ]}
                        onPress={() => setGlobalThemeOverride(null)}
                    >
                        <TextComponent variant="caption" bold={globalThemeOverride === null} color={globalThemeOverride === null ? theme.textOnPrimary : theme.textSecondary}>
                            {t('noneAutoOnly')}
                        </TextComponent>
                    </TouchableOpacity>
                    {Object.keys(HOLIDAY_THEMES).map((key) => {
                        const isActive = globalThemeOverride === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.presetCard,
                                    {
                                        backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                                        borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                        borderWidth: 1.5
                                    }
                                ]}
                                onPress={() => setGlobalThemeOverride(key)}
                            >
                                <TextComponent variant="caption" bold={isActive} color={isActive ? theme.textOnPrimary : theme.textSecondary}>
                                    {HOLIDAY_THEMES[key].translations?.[language]?.name || HOLIDAY_THEMES[key].name}
                                </TextComponent>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <AnimatedPressable
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveSettings}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={theme.textOnPrimary} />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={20} color={theme.textOnPrimary} style={{ marginRight: 8 }} />
                        <TextComponent variant="body" bold color={theme.textOnPrimary}>
                            {t('saveSettings')}
                        </TextComponent>
                    </>
                )}
            </AnimatedPressable>
        </View>
    );
}
