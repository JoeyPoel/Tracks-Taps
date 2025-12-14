import { useTheme } from '@/src/context/ThemeContext';
import { useExploreFilterSidebar } from '@/src/hooks/useExploreFilterSidebar';
import { Difficulty } from '@/src/types/models';
import React from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, StopIcon, XMarkIcon } from 'react-native-heroicons/outline';

interface FilterSidebarProps {
    visible: boolean;
    onClose: () => void;
}

interface AccordionSectionProps {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    selectedValue?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, expanded, onToggle, children, selectedValue }) => {
    const { theme } = useTheme();
    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: theme.borderPrimary }}>
            <TouchableOpacity onPress={onToggle} style={styles.accordionHeader}>
                <Text style={[styles.accordionTitle, { color: theme.textPrimary }]}>{title.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {selectedValue && (
                        <Text style={[styles.optionText, { color: theme.textSecondary, marginRight: 8 }]}>
                            {selectedValue !== 'All' ? selectedValue : 'All'}
                        </Text>
                    )}
                    {expanded ?
                        <ChevronUpIcon size={20} color={theme.textPrimary} /> :
                        <ChevronDownIcon size={20} color={theme.textPrimary} />
                    }
                </View>
            </TouchableOpacity>
            {expanded && <View style={styles.accordionContent}>{children}</View>}
        </View>
    );
};

export default function ExploreFilterSidebar({ visible, onClose }: FilterSidebarProps) {
    const { theme } = useTheme();
    const {
        slideAnim,
        localFilters,
        expandedSections,
        handleClose,
        handleApply,
        handleClear,
        toggleSection,
        updateFilter,
        toggleMode,
        SIDEBAR_WIDTH
    } = useExploreFilterSidebar(visible, onClose);

    const ModeOption = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
        <TouchableOpacity style={styles.optionRow} onPress={onPress}>
            <Text style={[styles.optionText, { color: theme.textPrimary, fontWeight: selected ? 'bold' : 'normal' }]}>{label}</Text>
            {selected ? <CheckIcon size={20} color={theme.primary} /> : <StopIcon size={20} color={theme.textPrimary} />}
        </TouchableOpacity>
    );

    const RadioOption = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
        <TouchableOpacity style={styles.optionRow} onPress={onPress}>
            <Text style={[styles.optionText, { color: theme.textPrimary, fontWeight: selected ? 'bold' : 'normal' }]}>{label}</Text>
            {selected && <CheckIcon size={20} color={theme.primary} />}
        </TouchableOpacity>
    );

    return (
        <Modal transparent visible={visible} onRequestClose={handleClose} animationType="none">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

                <Animated.View style={[
                    styles.sidebar,
                    {
                        width: SIDEBAR_WIDTH,
                        backgroundColor: theme.bgSecondary,
                        transform: [{ translateX: slideAnim }]
                    }
                ]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Filters</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <XMarkIcon size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* LOCATION */}
                        <AccordionSection
                            title="Location"
                            expanded={expandedSections.location}
                            onToggle={() => toggleSection('location')}
                            selectedValue={localFilters.location || 'All'}
                        >
                            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                                <TextInput
                                    style={[styles.input, { borderColor: theme.borderPrimary, color: theme.textPrimary, backgroundColor: theme.bgPrimary }]}
                                    placeholder="City name..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={localFilters.location}
                                    onChangeText={(text) => updateFilter('location', text)}
                                />
                            </View>
                        </AccordionSection>

                        {/* DISTANCE */}
                        <AccordionSection
                            title="Distance (km)"
                            expanded={expandedSections.distance}
                            onToggle={() => toggleSection('distance')}
                            selectedValue={localFilters.minDistance || localFilters.maxDistance ? 'Custom' : 'All'}
                        >
                            <View style={styles.rangeContainer}>
                                <View style={styles.rangeInputWrapper}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Min</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: theme.borderPrimary, color: theme.textPrimary, backgroundColor: theme.bgPrimary }]}
                                        placeholder="0"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.minDistance?.toString()}
                                        onChangeText={(text) => updateFilter('minDistance', text)}
                                    />
                                </View>
                                <View style={styles.rangeInputWrapper}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Max</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: theme.borderPrimary, color: theme.textPrimary, backgroundColor: theme.bgPrimary }]}
                                        placeholder="Any"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.maxDistance?.toString()}
                                        onChangeText={(text) => updateFilter('maxDistance', text)}
                                    />
                                </View>
                            </View>
                        </AccordionSection>

                        {/* DURATION */}
                        <AccordionSection
                            title="Duration (min)"
                            expanded={expandedSections.duration}
                            onToggle={() => toggleSection('duration')}
                        >
                            <View style={styles.rangeContainer}>
                                <View style={styles.rangeInputWrapper}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Min</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: theme.borderPrimary, color: theme.textPrimary, backgroundColor: theme.bgPrimary }]}
                                        placeholder="0"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.minDuration?.toString()}
                                        onChangeText={(text) => updateFilter('minDuration', text)}
                                    />
                                </View>
                                <View style={styles.rangeInputWrapper}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Max</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: theme.borderPrimary, color: theme.textPrimary, backgroundColor: theme.bgPrimary }]}
                                        placeholder="Any"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        value={localFilters.maxDuration?.toString()}
                                        onChangeText={(text) => updateFilter('maxDuration', text)}
                                    />
                                </View>
                            </View>
                        </AccordionSection>

                        {/* MODES */}
                        <AccordionSection
                            title="Modes"
                            expanded={expandedSections.modes}
                            onToggle={() => toggleSection('modes')}
                            selectedValue={localFilters.modes?.length ? `${localFilters.modes.length} selected` : 'All'}
                        >
                            {['WALKING', 'CYCLING', 'PUBGOLF', 'DRIVING'].map(mode => (
                                <ModeOption
                                    key={mode}
                                    label={mode}
                                    selected={localFilters.modes?.includes(mode) || false}
                                    onPress={() => toggleMode(mode)}
                                />
                            ))}
                        </AccordionSection>

                        {/* DIFFICULTY */}
                        <AccordionSection
                            title="Difficulty"
                            expanded={expandedSections.difficulty}
                            onToggle={() => toggleSection('difficulty')}
                            selectedValue={localFilters.difficulty || 'All'}
                        >
                            <RadioOption label="All" selected={!localFilters.difficulty} onPress={() => updateFilter('difficulty', undefined)} />
                            <RadioOption label="Easy" selected={localFilters.difficulty === Difficulty.EASY} onPress={() => updateFilter('difficulty', Difficulty.EASY)} />
                            <RadioOption label="Medium" selected={localFilters.difficulty === Difficulty.MEDIUM} onPress={() => updateFilter('difficulty', Difficulty.MEDIUM)} />
                            <RadioOption label="Hard" selected={localFilters.difficulty === Difficulty.HARD} onPress={() => updateFilter('difficulty', Difficulty.HARD)} />
                        </AccordionSection>

                        {/* SORTING */}
                        <AccordionSection
                            title="Sort By"
                            expanded={expandedSections.sort}
                            onToggle={() => toggleSection('sort')}
                            selectedValue={localFilters.sortBy || 'Default'}
                        >
                            <RadioOption label="Newest" selected={localFilters.sortBy === 'createdAt'} onPress={() => { updateFilter('sortBy', 'createdAt'); updateFilter('sortOrder', 'desc'); }} />
                            <RadioOption label="Name (A-Z)" selected={localFilters.sortBy === 'name' && localFilters.sortOrder === 'asc'} onPress={() => { updateFilter('sortBy', 'name'); updateFilter('sortOrder', 'asc'); }} />
                            <RadioOption label="Distance (Low-High)" selected={localFilters.sortBy === 'distance' && localFilters.sortOrder === 'asc'} onPress={() => { updateFilter('sortBy', 'distance'); updateFilter('sortOrder', 'asc'); }} />
                            <RadioOption label="Duration (Shortest)" selected={localFilters.sortBy === 'duration' && localFilters.sortOrder === 'asc'} onPress={() => { updateFilter('sortBy', 'duration'); updateFilter('sortOrder', 'asc'); }} />
                        </AccordionSection>

                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.borderPrimary }]}>
                        <TouchableOpacity
                            style={[styles.applyButton, { backgroundColor: theme.primary }]}
                            onPress={handleApply}
                        >
                            <Text style={[styles.applyButtonText, { color: '#fff' }]}>Apply Filters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.clearButton, { borderColor: theme.borderPrimary }]} onPress={handleClear}>
                            <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear Filters</Text>
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
    sidebar: { height: '100%', position: 'absolute', right: 0, top: 0, bottom: 0, shadowColor: "#000", shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1 },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
    accordionTitle: { fontSize: 14, fontWeight: '600' },
    accordionContent: { paddingBottom: 10 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    optionText: { fontSize: 14 },
    footer: { padding: 20, borderTopWidth: 1 },
    applyButton: { padding: 15, alignItems: 'center', marginBottom: 10, borderRadius: 8 },
    applyButtonText: { fontWeight: 'bold', fontSize: 16 },
    clearButton: { padding: 15, alignItems: 'center', borderWidth: 1, borderRadius: 8 },
    clearButtonText: { fontSize: 14, fontWeight: '600' },
    rangeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    rangeInputWrapper: { flex: 1, marginHorizontal: 5 },
    label: { marginBottom: 5, fontSize: 12 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10 },
});
