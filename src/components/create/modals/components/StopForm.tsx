import { FormInput } from '@/src/components/common/FormInput';
import { ImageUploader } from '@/src/components/common/ImageUploader';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import { getStopIcon } from '@/src/utils/stopIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
                    <FormInput
                        label={t('stopName')}
                        value={name}
                        onChange={setName}
                        placeholder={t('stopName')}
                        maxLength={50}
                    />
                </View>
            </View>

            <View>
                <FormInput
                    label={t('shortDescription')}
                    value={description}
                    onChange={setDescription}
                    placeholder={t('shortDescriptionPlaceholder')}
                    maxLength={100}
                />
            </View>

            <View>
                <FormInput
                    label={t('detailedDescription')}
                    value={detailedDescription}
                    onChange={setDetailedDescription}
                    multiline
                    placeholder={t('detailedDescriptionPlaceholder')}
                    maxLength={1000}
                />
            </View>

            <View>
                <ImageUploader
                    label={t('tourImage')}
                    initialImage={imageUrl}
                    onUploadComplete={setImageUrl}
                    folder="stops"
                    placeholder={t('imagePlaceholder')}
                />
            </View>

            <View>
                <TextComponent style={styles.inputLabel} color={theme.textSecondary} bold variant="label">
                    {t('stopType')}
                </TextComponent>
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
