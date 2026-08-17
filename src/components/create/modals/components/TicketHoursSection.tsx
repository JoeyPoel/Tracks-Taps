import { FormInput } from '@/src/components/common/FormInput';
import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

interface TicketHoursSectionProps {
    requiresTicket: boolean;
    setRequiresTicket: (val: boolean) => void;
    isFreeEntry: boolean;
    setIsFreeEntry: (val: boolean) => void;
    ticketInfo: string;
    setTicketInfo: (val: string) => void;
    openingHours: string;
    setOpeningHours: (val: string) => void;
}

export function TicketHoursSection({
    requiresTicket, setRequiresTicket,
    isFreeEntry, setIsFreeEntry,
    ticketInfo, setTicketInfo,
    openingHours, setOpeningHours
}: TicketHoursSectionProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const handleRequiresTicketChange = (val: boolean) => {
        setRequiresTicket(val);
        if (val) {
            setIsFreeEntry(false);
        }
    };

    const handleIsFreeEntryChange = (val: boolean) => {
        setIsFreeEntry(val);
        if (val) {
            setRequiresTicket(false);
            setTicketInfo('');
        }
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
                <View style={styles.inputContainer}>
                    <FormInput
                        label={t('ticketInfo' as any) || 'Ticket Price & Info'}
                        value={ticketInfo}
                        onChange={setTicketInfo}
                        placeholder={t('ticketInfoPlaceholder' as any) || 'e.g. €20 adult, free under 18 — book online'}
                    />
                </View>
            )}

            <View style={[styles.separator, { backgroundColor: theme.borderPrimary }]} />

            {/* TextInput: Opening Hours */}
            <View style={styles.inputContainer}>
                <FormInput
                    label={t('openingHours' as any) || 'Opening Hours'}
                    value={openingHours}
                    onChange={setOpeningHours}
                    placeholder={t('openingHoursPlaceholder' as any) || 'e.g. Tue-Sun 09:00-17:00, closed Mon'}
                />
            </View>
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
    inputContainer: {
        marginTop: 4,
    },
});
