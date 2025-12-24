import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import { getStopIcon } from '@/src/utils/stopIcons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface StopFormProps {
    name: string;
    setName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    detailedDescription: string;
    setDetailedDescription: (val: string) => void;
    imageUrl: string;
    setImageUrl: (val: string) => void;
    type: StopType;
    setType: (val: StopType) => void;
}

export function StopForm({
    name, setName,
    description, setDescription,
    detailedDescription, setDetailedDescription,
    imageUrl, setImageUrl,
    type, setType,
}: StopFormProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('stopName')}</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Location Name"
                        placeholderTextColor={theme.textDisabled}
                    />
                </View>
            </View>

            <View>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Short Description (List View)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Brief summary..."
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            <View>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Detailed Description (Full View)</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={detailedDescription}
                    onChangeText={setDetailedDescription}
                    multiline
                    placeholder="Tell the full story..."
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            <View>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('tourImage')}</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    placeholder="https://..."
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            <View>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{t('stopType')}</Text>
                <View style={styles.typesGrid}>
                    {Object.values(StopType).map((stopType) => (
                        <TouchableOpacity
                            key={stopType}
                            onPress={() => setType(stopType)}
                            style={[
                                styles.typeItem,
                                {
                                    backgroundColor: type === stopType ? theme.primary : theme.bgSecondary,
                                    borderColor: type === stopType ? theme.primary : theme.borderPrimary
                                }
                            ]}
                        >
                            {getStopIcon(stopType, 20, type === stopType ? 'white' : theme.textSecondary)}
                            {type === stopType && (
                                <Text style={[styles.typeLabel, { color: 'white' }]} numberOfLines={1}>{stopType.replace('_', ' ')}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    input: {
        borderRadius: 24,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    typesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});
