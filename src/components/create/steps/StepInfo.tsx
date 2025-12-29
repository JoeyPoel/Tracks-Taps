import { FormInput } from '@/src/components/common/FormInput';
import { ImageUploader } from '@/src/components/common/ImageUploader';
import { WizardStepHeader } from '@/src/components/create/common/WizardStepHeader';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { GENRES } from '@/src/utils/genres';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StepInfoProps {
    draft: TourDraft;
    updateDraft: (key: keyof TourDraft, value: any) => void;
}

export default function StepInfo({ draft, updateDraft }: StepInfoProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <View style={styles.container}>
            <WizardStepHeader
                title={t('stepInfoTitle')}
                subtitle={t('stepInfoSubtitle')}
            />

            <View style={styles.form}>
                <View>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('genre')}</Text>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
                    >
                        {GENRES.map((genre) => {
                            const isSelected = draft.genre === genre.id;
                            const Icon = genre.icon;
                            return (
                                <TouchableOpacity
                                    key={genre.id}
                                    style={[
                                        styles.genreChip,
                                        {
                                            backgroundColor: isSelected ? genre.color : theme.bgTertiary,
                                            borderColor: isSelected ? genre.color : theme.borderPrimary
                                        }
                                    ]}
                                    onPress={() => updateDraft('genre', genre.id)}
                                >
                                    <Icon size={16} color={isSelected ? '#FFF' : theme.textSecondary} />
                                    <Text style={[
                                        styles.genreLabel,
                                        { color: isSelected ? '#FFF' : theme.textSecondary }
                                    ]}>
                                        {genre.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <FormInput
                    label={t('tourTitle')}
                    value={draft.title}
                    onChange={(text) => updateDraft('title', text)}
                    placeholder={t('titlePlaceholder')}
                    maxLength={50}
                />

                <FormInput
                    label={t('tourLocation')}
                    value={draft.location}
                    onChange={(text) => updateDraft('location', text)}
                    placeholder={t('locationPlaceholder')}
                    maxLength={50}
                />

                <FormInput
                    label={t('tourDescription')}
                    value={draft.description}
                    onChange={(text) => updateDraft('description', text)}
                    placeholder={t('descPlaceholder')}
                    multiline
                    maxLength={500}
                />

                <ImageUploader
                    label={t('tourImage')}
                    initialImage={draft.imageUrl}
                    onUploadComplete={(url) => updateDraft('imageUrl', url)}
                    folder="tours"
                    placeholder={t('imagePlaceholder')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    form: {
        gap: 24,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    genreChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    genreLabel: {
        fontSize: 14,
        fontWeight: '500',
    }
});
