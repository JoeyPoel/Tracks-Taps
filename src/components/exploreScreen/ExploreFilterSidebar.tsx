import { useTheme } from '@/src/context/ThemeContext';
import { useExploreFilterSidebar } from '@/src/hooks/useExploreFilterSidebar';
import { Difficulty } from '@/src/types/models';
import { GENRES } from '@/src/utils/genres';
import React from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { XMarkIcon, StarIcon as StarIconOutline } from 'react-native-heroicons/outline';
import { StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { useLanguage } from '../../context/LanguageContext';
import { AnimatedButton } from '../common/AnimatedButton';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { CityPicker } from '../common/CityPicker';

interface FilterSidebarProps {
    visible: boolean;
    onClose: () => void;
}

const FilterSectionHeader = ({ title }: { title: string }) => {
    const { theme } = useTheme();
    return (
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
    );
};

export default function ExploreFilterSidebar({ visible, onClose }: FilterSidebarProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const {
        slideAnim,
        localFilters,
        handleClose,
        handleApply,
        handleClear,
        updateFilter,
        toggleGenre,
        SIDEBAR_WIDTH
    } = useExploreFilterSidebar(visible, onClose);

    const FilterChip = ({ label, selected, onPress, icon }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.chip,
                {
                    backgroundColor: selected ? theme.primary : theme.bgSecondary,
                    borderColor: selected ? theme.primary : theme.borderSecondary,
                    borderWidth: 1,
                }
            ]}
        >
            {icon && <Text style={{ marginRight: 6 }}>{icon}</Text>}
            <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: selected ? '#FFF' : theme.textPrimary
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const SortChip = ({ label, value, currentSort, currentOrder, expectedSort, expectedOrder, onPress }: any) => {
        const isSelected = currentSort === expectedSort && (!expectedOrder || currentOrder === expectedOrder);
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={[
                    styles.sortChip,
                    {
                        backgroundColor: isSelected ? theme.primary : theme.bgSecondary, // Swapped
                        borderColor: isSelected ? theme.primary : theme.borderSecondary, // Swapped
                        borderWidth: 1,
                    }
                ]}
            >
                <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isSelected ? '#FFF' : theme.textPrimary
                }}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none">
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={handleClose} />

                <Animated.View style={[
                    styles.sidebar,
                    {
                        width: SIDEBAR_WIDTH,
                        backgroundColor: theme.bgPrimary, // Swapped to Primary
                        transform: [{ translateX: slideAnim }]
                    }
                ]}>
                    <View style={[styles.header, { borderBottomColor: theme.borderSecondary }]}>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('filters')}</Text>
                        <AnimatedPressable onPress={handleClose} interactionScale="subtle" haptic="light" style={[styles.closeButton, { backgroundColor: theme.bgTertiary }]}>
                            <XMarkIcon size={20} color={theme.textPrimary} />
                        </AnimatedPressable>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                        {/* SORT BY */}
                        <View style={styles.section}>
                            <FilterSectionHeader title={t('sortBy')} />
                            <View style={styles.chipContainer}>
                                <SortChip
                                    label={t('newest')}
                                    currentSort={localFilters.sortBy}
                                    expectedSort="createdAt"
                                    onPress={() => { updateFilter('sortBy', 'createdAt'); updateFilter('sortOrder', 'desc'); }}
                                />
                                <SortChip
                                    label={t('nameAZ')}
                                    currentSort={localFilters.sortBy}
                                    currentOrder={localFilters.sortOrder}
                                    expectedSort="name"
                                    expectedOrder="asc"
                                    onPress={() => { updateFilter('sortBy', 'name'); updateFilter('sortOrder', 'asc'); }}
                                />
                                <SortChip
                                    label={t('distanceFromMe')}
                                    currentSort={localFilters.sortBy}
                                    expectedSort="distanceFromUser"
                                    onPress={() => updateFilter('sortBy', 'distanceFromUser')}
                                />
                                <SortChip
                                    label={t('duration')}
                                    currentSort={localFilters.sortBy}
                                    currentOrder={localFilters.sortOrder}
                                    expectedSort="duration"
                                    expectedOrder="asc"
                                    onPress={() => { updateFilter('sortBy', 'duration'); updateFilter('sortOrder', 'asc'); }}
                                />
                            </View>
                        </View>

                        {/* DIFFICULTY */}
                        <View style={styles.section}>
                            <FilterSectionHeader title={t('difficulty')} />
                            <View style={styles.chipContainer}>
                                <FilterChip
                                    label={t('any')}
                                    selected={!localFilters.difficulty}
                                    onPress={() => updateFilter('difficulty', undefined)}
                                />
                                <FilterChip
                                    label={t('easy')}
                                    selected={localFilters.difficulty === Difficulty.EASY}
                                    onPress={() => updateFilter('difficulty', Difficulty.EASY)}
                                />
                                <FilterChip
                                    label={t('medium')}
                                    selected={localFilters.difficulty === Difficulty.MEDIUM}
                                    onPress={() => updateFilter('difficulty', Difficulty.MEDIUM)}
                                />
                                <FilterChip
                                    label={t('hard')}
                                    selected={localFilters.difficulty === Difficulty.HARD}
                                    onPress={() => updateFilter('difficulty', Difficulty.HARD)}
                                />
                            </View>
                        </View>

                        {/* LOCATION */}
                        <View style={styles.section}>
                            <FilterSectionHeader title={t('location')} />
                            <CityPicker
                                label=""
                                value={localFilters.location || ''}
                                onSelect={(cityName: string) => updateFilter('location', cityName)}
                                placeholder={t('cityNamePlaceholder')}
                            />
                        </View>

                        {/* RATING */}
                        <View style={styles.section}>
                            <FilterSectionHeader title={t('rating')} />
                            <View style={styles.chipContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => updateFilter('minRating', star === localFilters.minRating ? undefined : star)}
                                        style={[
                                            styles.chip,
                                            {
                                                backgroundColor: localFilters.minRating === star ? theme.primary : theme.bgSecondary,
                                                borderColor: localFilters.minRating === star ? theme.primary : theme.borderSecondary,
                                                borderWidth: 1,
                                            }
                                        ]}
                                    >
                                        <Text style={{ marginRight: 4, color: localFilters.minRating === star ? '#FFF' : theme.textPrimary, fontWeight: '700' }}>{star}+</Text>
                                        <StarIconSolid size={14} color={localFilters.minRating === star ? '#FFF' : '#FFD700'} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* GENRE */}
                        <View style={styles.section}>
                            <FilterSectionHeader title={t('genre')} />
                            <View style={styles.chipContainer}>
                                {GENRES.map(genre => {
                                    const Icon = genre.icon;
                                    return (
                                        <FilterChip
                                            key={genre.id}
                                            label={t(genre.id.toLowerCase() as any)}
                                            icon={<Icon size={14} color={localFilters.genres?.includes(genre.id) ? '#FFF' : theme.textPrimary} />}
                                            selected={localFilters.genres?.includes(genre.id)}
                                            onPress={() => toggleGenre(genre.id)}
                                        />
                                    );
                                })}
                            </View>
                        </View>

                        {/* DISTANCE & DURATION GRID */}
                        <View style={styles.gridRow}>
                            {/* DISTANCE */}
                            <View style={[styles.gridItem, { marginRight: 8 }]}>
                                <FilterSectionHeader title={`${t('distance')} (km)`} />
                                <View style={[styles.groupedInputContainer, { backgroundColor: theme.bgSecondary, borderWidth: 1, borderColor: theme.borderSecondary }]}>
                                    <TextInput
                                        style={[styles.groupedInput, { color: theme.textPrimary }]}
                                        placeholder={t('minLabel')}
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.minDistance?.toString()}
                                        onChangeText={(text) => updateFilter('minDistance', text)}
                                    />
                                    <View style={[styles.verticalDivider, { backgroundColor: theme.borderPrimary }]} />
                                    <TextInput
                                        style={[styles.groupedInput, { color: theme.textPrimary }]}
                                        placeholder={t('maxLabel')}
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.maxDistance?.toString()}
                                        onChangeText={(text) => updateFilter('maxDistance', text)}
                                    />
                                </View>
                            </View>

                            {/* DURATION */}
                            <View style={[styles.gridItem, { marginLeft: 8 }]}>
                                <FilterSectionHeader title={`${t('duration')} (min)`} />
                                <View style={[styles.groupedInputContainer, { backgroundColor: theme.bgSecondary, borderWidth: 1, borderColor: theme.borderSecondary }]}>
                                    <TextInput
                                        style={[styles.groupedInput, { color: theme.textPrimary }]}
                                        placeholder={t('minLabel')}
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.minDuration?.toString()}
                                        onChangeText={(text) => updateFilter('minDuration', text)}
                                    />
                                    <View style={[styles.verticalDivider, { backgroundColor: theme.borderPrimary }]} />
                                    <TextInput
                                        style={[styles.groupedInput, { color: theme.textPrimary }]}
                                        placeholder={t('maxLabel')}
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.maxDuration?.toString()}
                                        onChangeText={(text) => updateFilter('maxDuration', text)}
                                    />
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}>
                        <AnimatedButton
                            title={t('applyFilters')}
                            onPress={handleApply}
                            style={styles.applyButton}
                        />

                        <TouchableOpacity onPress={handleClear} style={styles.resetLink}>
                            <Text style={[styles.resetText, { color: theme.textSecondary }]}>{t('resetAllFilters')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, flexDirection: 'row' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sidebar: {
        height: '100%',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    closeButton: { padding: 8, borderRadius: 50 },
    content: { flex: 1 },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 12,
        opacity: 0.8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12, // Soft rounded rect (modern feel)
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortChip: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 6,
    },
    gridRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    gridItem: {
        flex: 1,
    },
    input: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '500',
    },
    groupedInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        overflow: 'hidden',
    },
    groupedInput: {
        flex: 1,
        paddingVertical: 14,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        gap: 16,
        alignItems: 'center',
    },
    applyButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    resetLink: {
        padding: 8,
    },
    resetText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    }
});
