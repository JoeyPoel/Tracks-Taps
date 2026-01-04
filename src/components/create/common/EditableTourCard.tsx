import { TourCardBase } from '@/src/components/exploreScreen/TourCardBase';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getGenreIcon } from '@/src/utils/genres';
import { getTourTypeLabel } from '@/src/utils/tourUtils';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ClockIcon, MapIcon, TrophyIcon } from 'react-native-heroicons/solid';
import { TourDraft } from '../../../hooks/useCreateTour';
import { TourType } from '../../../types/models';
import { TextComponent } from '../../common/TextComponent';
import { SelectionModal } from './SelectionModal';

interface EditableTourCardProps {
    draft: TourDraft;
    updateDraft: (key: keyof TourDraft, value: any) => void;
}

export function EditableTourCard({
    draft,
    updateDraft
}: EditableTourCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const cardHeight = 320;
    // Normalized to lowercase for consistency
    const AVAILABLE_MODES = ['Walking', 'Cycling', 'Driving', 'Public Transport'];

    const toggleMode = (mode: string) => {
        const currentModes = draft.modes || [];
        if (currentModes.includes(mode)) {
            updateDraft('modes', currentModes.filter(m => m !== mode));
        } else {
            updateDraft('modes', [...currentModes, mode]);
        }
    };

    const handleDistanceChange = (text: string) => {
        // Allow text input, but validate on blur or just store as number if valid
        const val = parseFloat(text);
        if (!isNaN(val)) {
            updateDraft('distance', val);
        } else if (text === '') {
            updateDraft('distance', 0);
        }
    };

    const handleDurationChange = (text: string) => {
        const val = parseFloat(text);
        if (!isNaN(val)) {
            updateDraft('duration', val);
        } else if (text === '') {
            updateDraft('duration', 0);
        }
    };

    // Helper to get mode display (icon or text)
    // For now, using text chips which are clear
    const renderModeSelector = () => {
        return (
            <View style={styles.modeSelectorContainer}>
                {AVAILABLE_MODES.map((mode) => {
                    const isActive = draft.modes?.includes(mode);
                    return (
                        <TouchableOpacity
                            key={mode}
                            onPress={() => toggleMode(mode)}
                            style={[
                                styles.modeChip,
                                isActive ? styles.modeChipActive : styles.modeChipInactive
                            ]}
                        >
                            <TextComponent
                                style={isActive ? styles.modeChipTextActive : styles.modeChipTextInactive}
                                bold
                                size={10}
                            >
                                {mode}
                            </TextComponent>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const genre = draft.genre;

    const [pickerType, setPickerType] = React.useState<'genre' | 'difficulty' | 'tourType' | null>(null);
    const { GENRES } = require('@/src/utils/genres');

    return (
        <>
            <TourCardBase imageUrl={draft.imageUrl} height={cardHeight}>
                {/* Top Section */}
                <View style={styles.topRow}>
                    <View style={styles.badgesContainer}>
                        <TouchableOpacity
                            onPress={() => setPickerType('genre')}
                            style={[styles.badge, styles.blurBadge]}
                        >
                            {genre ? (
                                <>
                                    {(() => {
                                        const GenreIcon = getGenreIcon(genre);
                                        return <GenreIcon size={12} color="#FFF" />;
                                    })()}
                                    <TextComponent style={styles.badgeText} color="#FFF" bold size={12}>
                                        {genre}
                                    </TextComponent>
                                </>
                            ) : (
                                <TextComponent style={styles.badgeText} color="#FFF" bold size={12}>
                                    {t('selectGenre')}
                                </TextComponent>
                            )}
                            <View style={styles.dropdownCaret} />
                        </TouchableOpacity>

                        {/* Tour Type Badge */}
                        <TouchableOpacity
                            onPress={() => setPickerType('tourType')}
                            style={[styles.badge, styles.blurBadge]}
                        >
                            <TextComponent style={styles.badgeText} color="#FFF" bold size={12}>
                                {draft.type ? getTourTypeLabel(draft.type) : t('selectType')}
                            </TextComponent>
                            <View style={styles.dropdownCaret} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setPickerType('difficulty')}
                            style={[styles.badge, styles.blurBadge]}
                        >
                            <TextComponent style={styles.badgeText} color="#FFF" bold size={12}>
                                {draft.difficulty || 'Medium'}
                            </TextComponent>
                            <View style={styles.dropdownCaret} />
                        </TouchableOpacity>

                        {/* Bonus Challenges Badge */}
                        {draft.challenges && draft.challenges.length > 0 && (
                            <View style={[styles.badge, styles.blurBadge]}>
                                <TrophyIcon size={12} color="#FFF" />
                                <TextComponent style={styles.badgeText} color="#FFF" bold size={12}>
                                    {draft.challenges.length}
                                </TextComponent>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomContent}>
                    <View style={styles.titleContainer}>
                        <TextInput
                            style={styles.titleInput}
                            value={draft.title}
                            onChangeText={(text) => updateDraft('title', text)}
                            placeholder={t('tourTitle')}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            maxLength={60}
                        />
                        <TextComponent style={styles.author} color="rgba(255, 255, 255, 0.9)" variant="caption">
                            {t('by')} {t('you')}
                        </TextComponent>
                    </View>

                    <View style={styles.separator} />

                    {/* Inline Editable Stats */}
                    <View style={styles.statsContainer}>
                        {/* Input Row */}
                        <View style={styles.inputsRow}>
                            <View style={styles.inputGroup}>
                                <MapIcon size={16} color="#E0E0E0" />
                                <TextInput
                                    style={styles.inlineInput}
                                    value={draft.distance?.toString()}
                                    onChangeText={handleDistanceChange}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    selectTextOnFocus
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                />
                                <TextComponent style={styles.unitText} color="rgba(255,255,255,0.7)" size={12}>
                                    km
                                </TextComponent>
                            </View>

                            <View style={styles.dotSeparator} />

                            <View style={styles.inputGroup}>
                                <ClockIcon size={16} color="#E0E0E0" />
                                <TextInput
                                    style={styles.inlineInput}
                                    value={draft.duration?.toString()}
                                    onChangeText={handleDurationChange}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    selectTextOnFocus
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                />
                                <TextComponent style={styles.unitText} color="rgba(255,255,255,0.7)" size={12}>
                                    min
                                </TextComponent>
                            </View>
                        </View>

                        {/* Modes Row - Wraps if needed */}
                        {renderModeSelector()}
                    </View>
                </View>
            </TourCardBase>

            {/* Pickers */}
            <SelectionModal
                visible={pickerType === 'genre'}
                onClose={() => setPickerType(null)}
                title={t('selectGenre')}
                options={GENRES.map((g: any) => ({ label: g.label, value: g.id, icon: g.icon, color: g.color }))}
                onSelect={(val) => updateDraft('genre', val)}
                currentValue={draft.genre}
            />

            <SelectionModal
                visible={pickerType === 'tourType'}
                onClose={() => setPickerType(null)}
                title={t('selectTourType')}
                options={Object.values(TourType).map((type: string) => ({
                    label: getTourTypeLabel(type),
                    value: type
                }))}
                onSelect={(val) => updateDraft('type', val)}
                currentValue={draft.type}
            />

            <SelectionModal
                visible={pickerType === 'difficulty'}
                onClose={() => setPickerType(null)}
                title={t('selectDifficulty')}
                options={[
                    { label: 'Easy', value: 'Easy' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'Hard', value: 'Hard' }
                ]}
                onSelect={(val) => updateDraft('difficulty', val)}
                currentValue={draft.difficulty}
            />
        </>
    );
}

const styles = StyleSheet.create({
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    blurBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badgeText: {
        letterSpacing: 0.3,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
    },
    bottomContent: {
        gap: 12,
    },
    titleContainer: {
        gap: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    author: {
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: '100%',
        marginVertical: 4,
    },
    statsContainer: {
        gap: 12,
    },
    inputsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flex: 1,
    },
    inlineInput: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        minWidth: 50,
        padding: 4,
    },
    unitText: {
        marginLeft: -2,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    modeSelectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    modeChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    modeChipActive: {
        backgroundColor: '#FFF',
        borderColor: '#FFF',
    },
    modeChipInactive: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    modeChipTextActive: {
        color: '#000',
    },
    modeChipTextInactive: {
        color: 'rgba(255,255,255,0.8)',
    },
    dropdownCaret: {
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(255,255,255,0.7)',
        marginLeft: 4,
        marginTop: 1,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        padding: 0,
    },
});
