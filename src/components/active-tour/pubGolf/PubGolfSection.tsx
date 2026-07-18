import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { TextComponent } from '../../common/TextComponent';
import { AppModal } from '../../common/AppModal';
import PubGolfScoreCard from './PubGolfScoreCard';
import PubGolfStopCard from './PubGolfStopCard';

interface PubGolfSectionProps {
    activeTour: any;
    currentTeam: any;
    pubGolfScores: Record<number, number>;
    currentStopId?: number;
    handleSaveSips: (stopId: number, sips: number) => void;
    onAddPenalty: (description: string, sips: number) => Promise<void>;
    onDeletePenalty: (penaltyId: number) => Promise<void>;
}

const PubGolfSection: React.FC<PubGolfSectionProps> = ({
    activeTour,
    currentTeam,
    pubGolfScores,
    currentStopId,
    handleSaveSips,
    onAddPenalty,
    onDeletePenalty
}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [subTab, setSubTab] = useState<'scorecard' | 'hazards'>('scorecard');
    const [modalVisible, setModalVisible] = useState(false);
    const [customDesc, setCustomDesc] = useState('');
    const [customSips, setCustomSips] = useState('1');
    const [submitting, setSubmitting] = useState(false);

    const pubGolfStops = activeTour.tour?.stops?.filter((s: any) => s.pubgolfPar) || [];
    const totalPar = pubGolfStops.reduce((sum: number, s: any) => sum + (s.pubgolfPar || 0), 0);

    // Calculate current stop's par for Unfinished Drink penalty
    const currentStop = pubGolfStops.find((s: any) => s.id === currentStopId);
    const currentPar = currentStop?.pubgolfPar || 3;
    const unfinishedDrinkPenalty = currentPar + 2;

    // Calculate sips from stops
    let stopSips = 0;
    let currentScore = 0;

    Object.entries(pubGolfScores).forEach(([stopId, sips]) => {
        const stop = pubGolfStops.find((s: any) => s.id === parseInt(stopId));
        if (stop && stop.pubgolfPar) {
            stopSips += sips;
            currentScore += (sips - stop.pubgolfPar);
        }
    });

    // Calculate sips from penalties
    const penalties = currentTeam?.pubGolfPenalties || [];
    const totalPenaltySips = penalties.reduce((sum: number, p: any) => sum + p.sips, 0);

    const totalSips = stopSips + totalPenaltySips;
    const finalScore = currentScore + totalPenaltySips;

    const quickHazards = [
        { title: '🍺 Bunker Hazard', desc: 'Drink spilled / Extra shot needed', penalty: 1, key: 'bunker', color: '#F59E0B' },
        { title: '🚽 Water Hazard', desc: 'Restroom visit at restricted pub', penalty: 2, key: 'water', color: '#3B82F6' },
        { title: '🏃 Out of Bounds (Time)', desc: 'Failed to keep up with timeline', penalty: 2, key: 'oob_time', color: '#EF4444' },
        { title: '🗺️ Out of Bounds (Venue)', desc: 'Left designated venue boundary', penalty: 3, key: 'oob_venue', color: '#F97316' },
        { title: '🍹 Unfinished Drink', desc: `Incomplete beverage (Par + 2)`, penalty: unfinishedDrinkPenalty, key: 'unfinished', color: '#8B5CF6' },
        { title: '🤮 Vomiting Penalty', desc: 'Immediate penalty stroke addition', penalty: 10, key: 'vomit', color: '#10B981' }
    ];

    const handleAddPenalty = async (label: string, sips: number) => {
        setSubmitting(true);
        try {
            await onAddPenalty(label, sips);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddCustom = async () => {
        if (!customDesc.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }
        const sipsVal = parseInt(customSips);
        if (isNaN(sipsVal) || sipsVal <= 0) {
            Alert.alert('Error', 'Please enter a valid number of sips');
            return;
        }

        setSubmitting(true);
        try {
            await onAddPenalty(customDesc.trim(), sipsVal);
            setCustomDesc('');
            setCustomSips('1');
            setModalVisible(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={{ gap: 16 }}>
            {/* Main Score Overview Card */}
            <PubGolfScoreCard
                totalSips={totalSips}
                totalPar={totalPar}
                currentScore={finalScore}
            />

            {/* Custom Sub Tab Switcher */}
            <View style={[styles.tabBar, { backgroundColor: theme.bgSecondary }]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        subTab === 'scorecard' && [styles.tabButtonActive, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setSubTab('scorecard')}
                >
                    <TextComponent
                        variant="caption"
                        bold
                        color={subTab === 'scorecard' ? theme.textOnPrimary : theme.textSecondary}
                    >
                        📋 Scorecard
                    </TextComponent>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        subTab === 'hazards' && [styles.tabButtonActive, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setSubTab('hazards')}
                >
                    <TextComponent
                        variant="caption"
                        bold
                        color={subTab === 'hazards' ? theme.textOnPrimary : theme.textSecondary}
                    >
                        ⛳ Hazards & Penalties ({penalties.length})
                    </TextComponent>
                </TouchableOpacity>
            </View>

            {subTab === 'scorecard' ? (
                <View style={{ gap: 16 }}>
                    {/* Summary of active penalties under scorecard */}
                    {penalties.length > 0 && (
                        <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            <TextComponent variant="caption" bold color={theme.textSecondary} style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                Active Penalties (+{totalPenaltySips} sips)
                            </TextComponent>
                            <View style={{ gap: 6 }}>
                                {penalties.map((penalty: any) => (
                                    <View key={penalty.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <TextComponent variant="caption" color={theme.textPrimary}>• {penalty.description}</TextComponent>
                                        <TextComponent variant="caption" bold color={theme.danger}>+{penalty.sips} sips</TextComponent>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Scorecard Stops list */}
                    <View style={{ gap: 8 }}>
                        <TextComponent variant="label" bold color={theme.textSecondary} style={{ textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 }}>
                            Holes Scorecard
                        </TextComponent>
                        {pubGolfStops.map((stop: any) => (
                            <PubGolfStopCard
                                key={stop.id}
                                stopNumber={stop.number}
                                stopName={stop.name}
                                drinkName={stop.pubgolfDrink || t('drink')}
                                par={stop.pubgolfPar || 3}
                                sips={pubGolfScores[stop.id]}
                                isActive={stop.id === currentStopId}
                                onSave={(sips) => handleSaveSips(stop.id, sips)}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    {/* Square Buttons Grid for Quick Add */}
                    <View style={styles.gridContainer}>
                        {quickHazards.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[
                                    styles.gridSquare,
                                    {
                                        backgroundColor: item.color + '0E',
                                        borderColor: item.color + '45'
                                    }
                                ]}
                                onPress={() => handleAddPenalty(item.title, item.penalty)}
                                disabled={submitting}
                            >
                                <View style={styles.squareContent}>
                                    <TextComponent variant="body" bold color={item.color} style={{ textAlign: 'center', marginBottom: 4 }}>
                                        {item.title}
                                    </TextComponent>
                                    <TextComponent variant="caption" color={theme.textSecondary} style={{ textAlign: 'center', fontSize: 10, flex: 1, opacity: 0.8 }}>
                                        {item.desc}
                                    </TextComponent>
                                    <View style={[styles.badge, { backgroundColor: item.color + '22' }]}>
                                        <TextComponent variant="caption" bold color={item.color}>
                                            +{item.penalty} Sips
                                        </TextComponent>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom Penalty Button */}
                    <TouchableOpacity
                        style={[styles.customBtn, { borderColor: theme.primary }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="options-outline" size={18} color={theme.primary} />
                        <TextComponent variant="body" bold color={theme.primary} style={{ marginLeft: 8 }}>
                            Add Custom Penalty
                        </TextComponent>
                    </TouchableOpacity>

                    {/* Applied Penalties Manager */}
                    <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                        <TextComponent variant="body" bold color={theme.textPrimary} style={{ marginBottom: 12 }}>
                            Applied Penalties List
                        </TextComponent>

                        {penalties.length > 0 ? (
                            <View style={{ gap: 8 }}>
                                {penalties.map((penalty: any) => (
                                    <View
                                        key={penalty.id}
                                        style={[styles.penaltyRow, { backgroundColor: theme.bgPrimary, borderColor: theme.borderPrimary }]}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <TextComponent variant="caption" bold color={theme.textPrimary}>
                                                {penalty.description}
                                            </TextComponent>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <TextComponent variant="caption" bold color={theme.danger}>
                                                +{penalty.sips} sips
                                            </TextComponent>
                                            <TouchableOpacity
                                                onPress={() => onDeletePenalty(penalty.id)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <TextComponent variant="caption" color={theme.textSecondary} style={{ fontStyle: 'italic' }}>
                                No penalties applied yet. Keep up the good work!
                            </TextComponent>
                        )}
                    </View>
                </View>
            )}

            {/* Custom Penalty Modal */}
            <AppModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Add Custom Penalty"
                alignment="center"
            >
                <View style={{ gap: 12, paddingBottom: 16 }}>
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                        placeholder="Description (e.g. Swore in public)"
                        placeholderTextColor={theme.textSecondary + '80'}
                        value={customDesc}
                        onChangeText={setCustomDesc}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TextInput
                            style={[styles.input, { flex: 1, color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                            placeholder="Sips penalty"
                            placeholderTextColor={theme.textSecondary + '80'}
                            value={customSips}
                            onChangeText={setCustomSips}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            style={[styles.customAddBtn, { backgroundColor: theme.primary }]}
                            onPress={handleAddCustom}
                            disabled={submitting}
                        >
                            <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                                Add Custom
                            </TextComponent>
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    tabButtonActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
    },
    penaltyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridSquare: {
        width: '48%',
        aspectRatio: 1.15,
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
    },
    squareContent: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    customBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    customAddBtn: {
        height: 44,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    }
});

export default PubGolfSection;
