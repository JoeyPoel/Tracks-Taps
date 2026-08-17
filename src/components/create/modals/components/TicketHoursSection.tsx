import { FormInput } from '@/src/components/common/FormInput';
import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface TicketHoursSectionProps {
    formState: any;
    updateField: (key: any, value: any) => void;
}

export function TicketHoursSection({ formState, updateField }: TicketHoursSectionProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const {
        requiresTicket,
        isFreeEntry,
        ticketInfo,
        ticketPrice,
        requiresReservation,
        openingHoursType,
        hoursOpen,
        hoursClose,
        hoursWeekdaysOpen,
        hoursWeekdaysClose,
        hoursWeekendsOpen,
        hoursWeekendsClose,
    } = formState;

    const handleRequiresTicketChange = (val: boolean) => {
        updateField('requiresTicket', val);
        if (val) {
            updateField('isFreeEntry', false);
        } else {
            updateField('ticketPrice', '');
            updateField('requiresReservation', false);
            updateField('ticketInfo', '');
        }
    };

    const handleIsFreeEntryChange = (val: boolean) => {
        updateField('isFreeEntry', val);
        if (val) {
            updateField('requiresTicket', false);
            updateField('ticketPrice', '');
            updateField('requiresReservation', false);
            updateField('ticketInfo', '');
        }
    };

    const renderDayInput = (dayName: string) => {
        const isOpenKey = `custom${dayName}Open`;
        const isCloseKey = `custom${dayName}Close`;
        const isClosedKey = `custom${dayName}Closed`;

        const isOpenVal = formState[isOpenKey] || '09:00';
        const isCloseVal = formState[isCloseKey] || '17:00';
        const isClosedVal = !!formState[isClosedKey];

        return (
            <View key={dayName} style={styles.dayRow}>
                <View style={{ width: 80 }}>
                    <TextComponent bold style={{ fontSize: 13 }} color={theme.textPrimary}>
                        {dayName.slice(0, 3)}
                    </TextComponent>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 }}>
                    <TextComponent style={{ fontSize: 11 }} color={theme.textSecondary}>
                        Closed
                    </TextComponent>
                    <Switch
                        value={isClosedVal}
                        onValueChange={(val) => updateField(isClosedKey, val)}
                        trackColor={{ false: theme.bgTertiary, true: theme.danger }}
                    />
                </View>

                {!isClosedVal && (
                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                value={isOpenVal}
                                onChange={(val) => updateField(isOpenKey, val)}
                                placeholder="09:00"
                            />
                        </View>
                        <TextComponent style={{ alignSelf: 'center', fontSize: 12 }} color={theme.textSecondary}>
                            to
                        </TextComponent>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                value={isCloseVal}
                                onChange={(val) => updateField(isCloseKey, val)}
                                placeholder="17:00"
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.sectionHeader}>
                <Ionicons name="card" size={20} color={theme.primary} />
                <TextComponent style={styles.sectionTitle} color={theme.textPrimary} size={16} bold variant="body">
                    {t('ticketsAndHours' as any) || 'Tickets & Opening Hours'}
                </TextComponent>
            </View>

            {/* Toggle: Free Entry */}
            <View style={styles.rowBetween}>
                <View style={styles.toggleLabelCol}>
                    <TextComponent style={styles.toggleTitle} color={theme.textPrimary} bold variant="body">
                        {t('isFreeEntry' as any) || 'Free Entry'}
                    </TextComponent>
                    <TextComponent style={styles.toggleDesc} color={theme.textSecondary} variant="caption">
                        {t('freeEntryDesc' as any) || 'No admission fee required for this location.'}
                    </TextComponent>
                </View>
                <Switch
                    value={isFreeEntry}
                    onValueChange={handleIsFreeEntryChange}
                    trackColor={{ false: theme.bgTertiary, true: theme.primary }}
                />
            </View>

            <View style={[styles.separator, { backgroundColor: theme.borderPrimary }]} />

            {/* Toggle: Requires Ticket */}
            <View style={styles.rowBetween}>
                <View style={styles.toggleLabelCol}>
                    <TextComponent style={styles.toggleTitle} color={theme.textPrimary} bold variant="body">
                        {t('requiresTicket' as any) || 'Requires Ticket'}
                    </TextComponent>
                    <TextComponent style={styles.toggleDesc} color={theme.textSecondary} variant="caption">
                        {t('requiresTicketDesc' as any) || 'Visitors must purchase a ticket/booking to enter.'}
                    </TextComponent>
                </View>
                <Switch
                    value={requiresTicket}
                    onValueChange={handleRequiresTicketChange}
                    trackColor={{ false: theme.bgTertiary, true: theme.primary }}
                />
            </View>

            {requiresTicket && (
                <View style={styles.ticketDetails}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label={t('ticketPrice' as any) || 'Ticket Price'}
                                value={ticketPrice}
                                onChange={(val) => updateField('ticketPrice', val)}
                                placeholder="e.g. €20 or Free"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, paddingLeft: 12 }}>
                            <View style={{ marginRight: 4 }}>
                                <TextComponent bold style={{ fontSize: 13 }} color={theme.textPrimary}>
                                    Need Reservation
                                </TextComponent>
                            </View>
                            <Switch
                                value={requiresReservation}
                                onValueChange={(val) => updateField('requiresReservation', val)}
                                trackColor={{ false: theme.bgTertiary, true: theme.primary }}
                            />
                        </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                        <FormInput
                            label={t('ticketInfo' as any) || 'Extra Booking / Ticket Info'}
                            value={ticketInfo}
                            onChange={(val) => updateField('ticketInfo', val)}
                            placeholder="e.g. Book online at rijksmuseum.nl"
                        />
                    </View>
                </View>
            )}

            <View style={[styles.separator, { backgroundColor: theme.borderPrimary }]} />

            {/* Selector: Opening Hours Type */}
            <View>
                <TextComponent style={styles.inputLabel} color={theme.textSecondary} bold variant="label">
                    {t('openingHours' as any) || 'Opening Hours'}
                </TextComponent>
                <View style={styles.selectorGrid}>
                    {[
                        { key: '24h', label: 'Open 24h' },
                        { key: 'same_everyday', label: 'Daily same' },
                        { key: 'weekdays_same', label: 'Weekdays same' },
                        { key: 'custom', label: 'Custom' },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => updateField('openingHoursType', item.key)}
                            style={[
                                styles.selectorItem,
                                {
                                    backgroundColor: openingHoursType === item.key ? theme.primary : theme.bgTertiary,
                                    borderColor: openingHoursType === item.key ? theme.primary : theme.borderPrimary
                                }
                            ]}
                        >
                            <TextComponent
                                bold
                                style={{ fontSize: 12 }}
                                color={openingHoursType === item.key ? theme.textOnPrimary : theme.textPrimary}
                            >
                                {item.label}
                            </TextComponent>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {openingHoursType === 'same_everyday' && (
                <View style={styles.timeRow}>
                    <View style={{ flex: 1 }}>
                        <FormInput
                            label="Open Time"
                            value={hoursOpen}
                            onChange={(val) => updateField('hoursOpen', val)}
                            placeholder="09:00"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormInput
                            label="Close Time"
                            value={hoursClose}
                            onChange={(val) => updateField('hoursClose', val)}
                            placeholder="17:00"
                        />
                    </View>
                </View>
            )}

            {openingHoursType === 'weekdays_same' && (
                <View style={{ gap: 8 }}>
                    <View style={styles.timeRow}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Weekdays Open (Mon–Fri)"
                                value={hoursWeekdaysOpen}
                                onChange={(val) => updateField('hoursWeekdaysOpen', val)}
                                placeholder="09:00"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Weekdays Close (Mon–Fri)"
                                value={hoursWeekdaysClose}
                                onChange={(val) => updateField('hoursWeekdaysClose', val)}
                                placeholder="17:00"
                            />
                        </View>
                    </View>

                    <View style={styles.timeRow}>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Weekends Open (Sat–Sun)"
                                value={hoursWeekendsOpen}
                                onChange={(val) => updateField('hoursWeekendsOpen', val)}
                                placeholder="10:00"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Weekends Close (Sat–Sun)"
                                value={hoursWeekendsClose}
                                onChange={(val) => updateField('hoursWeekendsClose', val)}
                                placeholder="16:00"
                            />
                        </View>
                    </View>
                </View>
            )}

            {openingHoursType === 'custom' && (
                <View style={styles.customContainer}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) =>
                        renderDayInput(day)
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        padding: 20,
        borderRadius: 24,
        gap: 12,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontWeight: '700',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabelCol: {
        flex: 1,
        paddingRight: 16,
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggleDesc: {
        fontSize: 11,
        marginTop: 2,
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 4,
    },
    ticketDetails: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    selectorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectorItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    customContainer: {
        gap: 8,
        marginTop: 4,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
});
