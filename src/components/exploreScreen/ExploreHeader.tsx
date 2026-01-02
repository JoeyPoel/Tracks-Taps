import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, ListBulletIcon, MagnifyingGlassIcon, Squares2X2Icon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ScreenHeader } from '../common/ScreenHeader';
import { TextComponent } from '../common/TextComponent';
import ActiveTourCard from './ActiveTourCard';

interface ExploreHeaderProps {
    searchText: string;
    onSearchTextChange: (text: string) => void;
    onSearchSubmit: () => void;
    viewMode: 'list' | 'grid';
    onViewModeChange: (mode: 'list' | 'grid') => void;
    onFilterPress: () => void;
    selectedCategory: string | null;
    onCategoryPress: (id: string) => void;
    activeTour: any | null; // Using any for ActiveTour wrapper type as it seems complex in usage
    user: any | null;
    onActiveTourPress: (tourId: string) => void;
}

const CATEGORIES = [
    { id: 'PubGolf', label: 'Pub Golf', icon: '🍺' },
    { id: 'History', label: 'History', icon: '🏛️' },
    { id: 'Culture', label: 'Culture', icon: '🎨' },
    { id: 'Nature', label: 'Nature', icon: '🌳' },
    { id: 'Mystery', label: 'Mystery', icon: '🕵️' },
];

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
    searchText,
    onSearchTextChange,
    onSearchSubmit,
    viewMode,
    onViewModeChange,
    onFilterPress,
    selectedCategory,
    onCategoryPress,
    activeTour,
    user,
    onActiveTourPress,
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8, paddingTop: 10 }}>
            <ScreenHeader
                title={t('explore') || 'Explore'}
                subtitle={t('findYourNextAdventure')}
                style={[styles.headerTop, { paddingHorizontal: 0, paddingTop: 0 }]}
            />

            {/* Search Bar */}
            <Animated.View
                entering={FadeInDown.delay(100).duration(600).springify()}
                style={[
                    styles.searchContainer,
                    { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor },
                ]}
            >
                <MagnifyingGlassIcon size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
                <TextInput
                    style={[styles.searchInput, { color: theme.textPrimary }]}
                    placeholder={t('whereToNext')}
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={searchText}
                    onChangeText={onSearchTextChange}
                    returnKeyType="search"
                    onSubmitEditing={onSearchSubmit}
                    maxFontSizeMultiplier={1.5}
                />
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.bgPrimary }]}
                    onPress={() => onViewModeChange(viewMode === 'list' ? 'grid' : 'list')}
                    accessibilityLabel={t('toggleViewMode') || "Toggle view mode"}
                >
                    {viewMode === 'list' ? (
                        <Squares2X2Icon size={20} color={theme.textPrimary} />
                    ) : (
                        <ListBulletIcon size={20} color={theme.textPrimary} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.bgPrimary, marginLeft: 8 }]}
                    onPress={onFilterPress}
                    accessibilityLabel={t('filterTours') || "Filter tours"}
                >
                    <AdjustmentsHorizontalIcon size={20} color={theme.textPrimary} />
                </TouchableOpacity>
            </Animated.View>

            {/* Categories */}
            <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => onCategoryPress(cat.id)}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: isSelected ? theme.primary : theme.bgSecondary,
                                        borderColor: isSelected ? theme.primary : theme.borderPrimary,
                                    },
                                ]}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                            >
                                <TextComponent style={styles.categoryIcon} variant="body">{cat.icon}</TextComponent>
                                <TextComponent
                                    style={styles.categoryText}
                                    variant="label"
                                    bold
                                    color={isSelected ? '#FFF' : theme.textPrimary}
                                >
                                    {cat.label}
                                </TextComponent>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>

            {/* Active Tour */}
            {activeTour && (() => {
                const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
                const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
                const currentStop = currentTeam?.currentStop || 1;
                const progress = Math.min(Math.max((currentStop - 1) / totalStops, 0), 1);

                return (
                    <View style={styles.activeTourSection}>
                        <TextComponent style={styles.sectionTitle} variant="h2" bold color={theme.textPrimary}>
                            {t('currentAdventure') || 'Current Adventure'}
                        </TextComponent>
                        <View style={{ height: 12 }} />
                        <ActiveTourCard
                            title={activeTour.tour?.title || ''}
                            imageUrl={activeTour.tour?.imageUrl || ''}
                            progress={progress}
                            onResume={() => onActiveTourPress(activeTour.id)}
                        />
                    </View>
                );
            })()}
        </View>
    );
};

const styles = StyleSheet.create({
    headerTop: {
        marginTop: 16,
        marginBottom: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        fontWeight: '500',
        minHeight: 24,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryContainer: {
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        borderWidth: 1.5,
        marginRight: 12,
    },
    categoryIcon: {
        marginRight: 8,
    },
    categoryText: {},
    sectionTitle: {
        marginBottom: 0,
        letterSpacing: -0.3,
    },
    activeTourSection: {
        marginTop: 16,
        marginBottom: 8,
    },
});
