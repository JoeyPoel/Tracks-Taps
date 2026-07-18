import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ClockIcon, MapIcon, MapPinIcon } from 'react-native-heroicons/outline';

interface Props {
    draft: TourDraft;
    updateDraft: (key: keyof TourDraft, value: any) => void;
}

export function ReviewCardStats({ draft, updateDraft }: Props) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.statsRow}>
            {/* Distance */}
            <View style={styles.statItem}>
                <MapIcon size={16} color={theme.textSecondary} />
                <TextInput
                    value={String(draft.distance)}
                    onChangeText={(text) => updateDraft('distance', text)}
                    keyboardType="numeric"
                    style={[styles.statInput, { color: theme.textSecondary }]}
                />
                <TextComponent style={[styles.statText, { marginLeft: 2 }]} color={theme.textSecondary} variant="body">
                    {t('km')}
                </TextComponent>
            </View>

            {/* Duration */}
            {(() => {
                const [inputValue, setInputValue] = React.useState('');

                React.useEffect(() => {
                    const mins = parseInt(draft.duration) || 0;
                    const hrs = (mins / 60).toFixed(1);
                    if (parseFloat(inputValue) !== parseFloat(hrs)) {
                        setInputValue(hrs);
                    }
                }, [draft.duration]);

                const handleTextChange = (text: string) => {
                    setInputValue(text);
                    const parsedHrs = parseFloat(text);
                    if (!isNaN(parsedHrs)) {
                        const mins = Math.round(parsedHrs * 60);
                        updateDraft('duration', String(mins));
                    } else {
                        updateDraft('duration', '0');
                    }
                };

                return (
                    <View style={styles.statItem}>
                        <ClockIcon size={16} color={theme.textSecondary} />
                        <TextInput
                            value={inputValue}
                            onChangeText={handleTextChange}
                            keyboardType="numeric"
                            style={[styles.statInput, { color: theme.textSecondary }]}
                        />
                        <TextComponent style={[styles.statText, { marginLeft: 2 }]} color={theme.textSecondary} variant="body">
                            {t('hrs')}
                        </TextComponent>
                    </View>
                );
            })()}

            {/* Stops */}
            <View style={styles.statItem}>
                <MapPinIcon size={16} color={theme.textSecondary} />
                <TextComponent style={styles.statText} color={theme.textSecondary} variant="body">
                    {draft.stops.length} {t('stops')}
                </TextComponent>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 14,
        marginLeft: 4,
    },
    statInput: {
        fontSize: 14,
        marginLeft: 4,
        padding: 0,
        fontWeight: 'normal',
    },
});
