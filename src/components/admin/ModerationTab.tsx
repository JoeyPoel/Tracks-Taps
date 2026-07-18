import React from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TextComponent } from '../common/TextComponent';
import { adminStyles as styles } from './adminStyles';
import { TourMetadata, ChallengeMetadata, StopMetadata } from '../../hooks/useAdminState';
import { useLanguage } from '../../context/LanguageContext';

interface ModerationTabProps {
    adminState: {
        theme: any;
        moderationSearchQuery: string;
        setModerationSearchQuery: (val: string) => void;
        moderationSortOption: 'oldest' | 'newest' | 'points-desc' | 'distance-desc';
        setModerationSortOption: (val: 'oldest' | 'newest' | 'points-desc' | 'distance-desc') => void;
        moderationStatusTab: 'pending' | 'rejected';
        setModerationStatusTab: (val: 'pending' | 'rejected') => void;
        loadingPending: boolean;
        filteredAndSortedTours: TourMetadata[];
        expandedTours: Record<number, boolean>;
        toggleTourExpand: (id: number) => void;
        moderatingAction: { id: number; action: 'approve' | 'reject' } | null;
        openRejectionPrompt: (id: number) => void;
        handleModerateTour: (id: number, status: 'PUBLISHED' | 'REJECTED') => Promise<void>;
        handleDeleteTour: (id: number) => Promise<void>;
        rejectionModalVisible: boolean;
        setRejectionModalVisible: (val: boolean) => void;
        rejectionReasonText: string;
        setRejectionReasonText: (val: string) => void;
        handleConfirmRejection: () => Promise<void>;
        jsonText: string;
        setJsonText: (val: string) => void;
        savingJson: boolean;
        copyingPrompt: boolean;
        handleUploadTourJson: () => Promise<void>;
        handleCopyPrompt: () => Promise<void>;
    };
}

export function ModerationTab({ adminState }: ModerationTabProps) {
    const { t } = useLanguage();
    const {
        theme,
        moderationSearchQuery,
        setModerationSearchQuery,
        moderationSortOption,
        setModerationSortOption,
        moderationStatusTab,
        setModerationStatusTab,
        loadingPending,
        filteredAndSortedTours,
        expandedTours,
        toggleTourExpand,
        moderatingAction,
        openRejectionPrompt,
        handleModerateTour,
        handleDeleteTour,
        rejectionModalVisible,
        setRejectionModalVisible,
        rejectionReasonText,
        setRejectionReasonText,
        handleConfirmRejection,
        jsonText,
        setJsonText,
        savingJson,
        copyingPrompt,
        handleUploadTourJson,
        handleCopyPrompt
    } = adminState;

    return (
        <View style={styles.sectionContainer}>
            {/* JSON Tour Creator & Prompt */}
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <TextComponent variant="body" bold color={theme.textPrimary} style={{ marginBottom: 4 }}>
                    Tour AI Generator & Uploader
                </TextComponent>
                <TextComponent variant="caption" color={theme.textSecondary} style={{ marginBottom: 12 }}>
                    Copy the system prompt to generate tours, then paste the output JSON here to publish directly.
                </TextComponent>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    <TouchableOpacity
                        style={[styles.moderationBtn, { backgroundColor: theme.primary, flex: 1 }]}
                        onPress={handleCopyPrompt}
                        disabled={copyingPrompt}
                    >
                        {copyingPrompt ? (
                            <ActivityIndicator size="small" color={theme.textOnPrimary} />
                        ) : (
                            <>
                                <Ionicons name="copy-outline" size={16} color={theme.textOnPrimary} style={{ marginRight: 6 }} />
                                <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                                    Copy Generator Prompt
                                </TextComponent>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={[
                        styles.formInput,
                        {
                            height: 100,
                            color: theme.textPrimary,
                            borderColor: theme.borderPrimary,
                            borderWidth: 1,
                            padding: 12,
                            borderRadius: 12,
                            textAlignVertical: 'top',
                            backgroundColor: theme.bgPrimary,
                            marginBottom: 12
                        }
                    ]}
                    multiline
                    placeholder="Paste generated tour JSON here..."
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={jsonText}
                    onChangeText={setJsonText}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: theme.accent || theme.primary,
                            height: 44,
                            marginTop: 0,
                            borderRadius: 12
                        }
                    ]}
                    onPress={handleUploadTourJson}
                    disabled={savingJson}
                >
                    {savingJson ? (
                        <ActivityIndicator color={theme.textOnPrimary} />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={18} color={theme.textOnPrimary} style={{ marginRight: 8 }} />
                            <TextComponent variant="body" bold color={theme.textOnPrimary}>
                                Upload JSON Tour
                            </TextComponent>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            {/* Status Tab Switch */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: theme.bgSecondary,
                borderRadius: 12,
                padding: 4,
                marginBottom: 16,
                marginTop: 16,
                borderWidth: 1,
                borderColor: theme.borderPrimary
            }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: moderationStatusTab === 'pending' ? theme.primary : 'transparent'
                    }}
                    onPress={() => setModerationStatusTab('pending')}
                >
                    <TextComponent
                        variant="body"
                        bold
                        color={moderationStatusTab === 'pending' ? theme.textOnPrimary : theme.textSecondary}
                    >
                        Awaiting Review
                    </TextComponent>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: moderationStatusTab === 'rejected' ? theme.primary : 'transparent'
                    }}
                    onPress={() => setModerationStatusTab('rejected')}
                >
                    <TextComponent
                        variant="body"
                        bold
                        color={moderationStatusTab === 'rejected' ? theme.textOnPrimary : theme.textSecondary}
                    >
                        Disapproved
                    </TextComponent>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchBarInput, { color: theme.textPrimary }]}
                    placeholder={t('searchToursPlaceholder')}
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={moderationSearchQuery}
                    onChangeText={setModerationSearchQuery}
                />
            </View>

            {/* Sort Chips */}
            <View style={styles.sortContainer}>
                <TextComponent variant="caption" bold color={theme.textSecondary} style={{ marginRight: 8 }}>
                    SORT:
                </TextComponent>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sortChipsScroll}
                    style={{ marginBottom: 16 }}
                >
                    {[
                        { label: 'Oldest First', value: 'oldest' },
                        { label: 'Newest First', value: 'newest' },
                        { label: 'Highest Points', value: 'points-desc' },
                        { label: 'Longest Distance', value: 'distance-desc' },
                    ].map((opt) => {
                        const isActive = moderationSortOption === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.sortChip,
                                    {
                                        backgroundColor: isActive ? theme.primary : theme.bgSecondary,
                                        borderColor: isActive ? 'transparent' : theme.borderPrimary,
                                        borderWidth: 1
                                    }
                                ]}
                                onPress={() => setModerationSortOption(opt.value as any)}
                            >
                                <TextComponent
                                    variant="caption"
                                    bold={isActive}
                                    color={isActive ? theme.textOnPrimary : theme.textSecondary}
                                >
                                    {opt.label}
                                </TextComponent>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loadingPending ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
                </View>
            ) : filteredAndSortedTours.length > 0 ? (
                filteredAndSortedTours.map((tour) => (
                    <View key={tour.id} style={[styles.tourCard, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <View style={styles.tourHeader}>
                            <View style={styles.tourHeaderLeft}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <TextComponent variant="body" bold color={theme.textPrimary}>
                                        {tour.title}
                                    </TextComponent>
                                    {tour.status === 'REJECTED' && (
                                        <View style={{ backgroundColor: theme.danger + '20', borderColor: theme.danger, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <TextComponent variant="caption" bold color={theme.danger} style={{ fontSize: 9 }}>
                                                DISAPPROVED
                                            </TextComponent>
                                        </View>
                                    )}
                                </View>
                                <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                                    By {tour.author.name} • {tour.location}
                                </TextComponent>
                            </View>
                            <TextComponent variant="caption" bold color={theme.accent}>
                                {tour.points} pts
                            </TextComponent>
                        </View>

                        {tour.imageUrl ? (
                            <Image
                                source={{ uri: tour.imageUrl }}
                                style={{ width: '100%', height: 120, borderRadius: 8, marginVertical: 8 }}
                                contentFit="cover"
                            />
                        ) : null}

                        <TextComponent variant="caption" color={theme.textSecondary} style={styles.tourDescription}>
                            {tour.description || 'No description provided.'}
                        </TextComponent>

                        <View style={styles.tourStatsRow}>
                            <TextComponent variant="caption" color={theme.textTertiary}>
                                📏 {tour.distance.toFixed(2)} km
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textTertiary}>
                                ⏱️ {tour.duration} mins
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textTertiary}>
                                📅 {new Date(tour.createdAt).toLocaleDateString()}
                            </TextComponent>
                        </View>

                        {/* Show/Hide Stops & Challenges */}
                        <TouchableOpacity
                            style={[styles.detailsToggleBtn, { borderTopColor: theme.borderPrimary }]}
                            onPress={() => toggleTourExpand(tour.id)}
                        >
                            <TextComponent variant="caption" bold color={theme.primary}>
                                {expandedTours[tour.id] ? t('hideStopsChallenges') : t('showStopsChallenges')}
                            </TextComponent>
                            <Ionicons
                                name={expandedTours[tour.id] ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={theme.primary}
                                style={{ marginLeft: 4 }}
                            />
                        </TouchableOpacity>

                        {expandedTours[tour.id] && (
                            <View style={[styles.detailsContainer, { backgroundColor: theme.bgPrimary }]}>
                                {/* Global Challenges */}
                                {tour.challenges && tour.challenges.length > 0 && (
                                    <View style={styles.detailsSection}>
                                        <TextComponent variant="caption" bold color={theme.textPrimary} style={styles.detailsSectionTitle}>
                                            🌐 {t('globalTourChallenges')}
                                        </TextComponent>
                                        {tour.challenges.map((ch: ChallengeMetadata, idx: number) => (
                                            <View key={ch.id} style={styles.detailItem}>
                                                <TextComponent variant="caption" bold color={theme.textPrimary}>
                                                    {idx + 1}. {ch.title} ({ch.type}) — {ch.points} pts
                                                </TextComponent>
                                                {ch.content && <TextComponent variant="caption" color={theme.textSecondary}>Q: {ch.content}</TextComponent>}
                                                {ch.answer && <TextComponent variant="caption" color={theme.textSecondary} bold>A: {ch.answer}</TextComponent>}
                                                {ch.hint && <TextComponent variant="caption" color={theme.textSecondary} style={{ fontStyle: 'italic' }}>Hint: {ch.hint}</TextComponent>}
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Stops */}
                                {tour.stops && tour.stops.length > 0 ? (
                                    <View style={styles.detailsSection}>
                                        <TextComponent variant="caption" bold color={theme.textPrimary} style={styles.detailsSectionTitle}>
                                            📍 {t('tourStops')} ({tour.stops.length})
                                        </TextComponent>
                                        {tour.stops.map((stop: StopMetadata) => (
                                            <View key={stop.id} style={styles.stopDetailItem}>
                                                <TextComponent variant="caption" bold color={theme.textPrimary}>
                                                    Stop {stop.number}: {stop.name} ({stop.type})
                                                </TextComponent>
                                                <TextComponent variant="caption" color={theme.textSecondary}>{stop.description}</TextComponent>
                                                <TextComponent variant="caption" color={theme.textTertiary} style={{ fontSize: 10 }}>
                                                    Coords: {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                                                </TextComponent>

                                                {/* Stop Challenges */}
                                                {stop.challenges && stop.challenges.length > 0 && (
                                                    <View style={{ marginLeft: 12, marginTop: 6 }}>
                                                        {stop.challenges.map((ch: ChallengeMetadata, cIdx: number) => (
                                                            <View key={ch.id} style={{ marginBottom: 4 }}>
                                                                <TextComponent variant="caption" bold color={theme.textSecondary}>
                                                                    🎯 Challenge {cIdx + 1}: {ch.title} ({ch.type}) — {ch.points} pts
                                                                </TextComponent>
                                                                {ch.content && <TextComponent variant="caption" color={theme.textSecondary}>Q: {ch.content}</TextComponent>}
                                                                {ch.answer && <TextComponent variant="caption" color={theme.textSecondary} bold>A: {ch.answer}</TextComponent>}
                                                                {ch.hint && <TextComponent variant="caption" color={theme.textSecondary} style={{ fontStyle: 'italic' }}>Hint: {ch.hint}</TextComponent>}
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <TextComponent variant="caption" color={theme.textSecondary}>No stops found.</TextComponent>
                                )}
                            </View>
                        )}

                        <View style={[styles.moderationActions, { gap: 8 }]}>
                            {tour.status === 'REJECTED' ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.moderationBtn, { backgroundColor: theme.danger, flex: 1 }]}
                                        onPress={() => handleDeleteTour(tour.id)}
                                        disabled={moderatingAction !== null}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={theme.textOnPrimary} style={{ marginRight: 6 }} />
                                        <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                                            Delete Entirely
                                        </TextComponent>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.moderationBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary, borderWidth: 1, flex: 1 }]}
                                        onPress={() => handleModerateTour(tour.id, 'PUBLISHED')}
                                        disabled={moderatingAction !== null}
                                    >
                                        {moderatingAction?.id === tour.id && moderatingAction?.action === 'approve' ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                                                <TextComponent variant="caption" bold color={theme.primary}>
                                                    Re-approve
                                                </TextComponent>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[styles.moderationBtn, { backgroundColor: theme.danger + '20', borderColor: theme.danger, borderWidth: 1, flex: 1 }]}
                                        onPress={() => openRejectionPrompt(tour.id)}
                                        disabled={moderatingAction !== null}
                                    >
                                        {moderatingAction?.id === tour.id && moderatingAction?.action === 'reject' ? (
                                            <ActivityIndicator size="small" color={theme.danger} />
                                        ) : (
                                            <>
                                                <Ionicons name="close" size={16} color={theme.danger} style={{ marginRight: 6 }} />
                                                <TextComponent variant="caption" bold color={theme.danger}>
                                                    Reject
                                                </TextComponent>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.moderationBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary, borderWidth: 1, flex: 1 }]}
                                        onPress={() => handleModerateTour(tour.id, 'PUBLISHED')}
                                        disabled={moderatingAction !== null}
                                    >
                                        {moderatingAction?.id === tour.id && moderatingAction?.action === 'approve' ? (
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                                                <TextComponent variant="caption" bold color={theme.primary}>
                                                    Approve
                                                </TextComponent>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.moderationBtn, { backgroundColor: theme.danger + '10', borderColor: theme.danger, borderWidth: 1, width: 44, justifyContent: 'center', alignItems: 'center' }]}
                                        onPress={() => handleDeleteTour(tour.id)}
                                        disabled={moderatingAction !== null}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyModerationCard}>
                    <Ionicons
                        name={moderationSearchQuery ? "search-outline" : "checkmark-done"}
                        size={48}
                        color={moderationSearchQuery ? theme.textTertiary : "green"}
                    />
                    <TextComponent variant="body" bold color={theme.textPrimary} style={{ marginTop: 12 }}>
                        {moderationSearchQuery ? t('noMatchingTours') : t('allToursModerated')}
                    </TextComponent>
                    <TextComponent variant="caption" color={theme.textSecondary} style={{ marginTop: 6, textAlign: 'center' }}>
                        {moderationSearchQuery
                            ? t('noMatchingToursDesc')
                            : t('allToursModeratedDesc')
                        }
                    </TextComponent>
                </View>
            )}

            {/* Rejection Reason Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={rejectionModalVisible}
                onRequestClose={() => setRejectionModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                        <View style={[styles.card, { backgroundColor: theme.bgSecondary, width: '100%', maxWidth: 400, padding: 24, marginBottom: 0 }]}>
                            <TextComponent variant="h3" bold color={theme.textPrimary} style={{ marginBottom: 12 }}>
                                {t('rejectionReason')}
                            </TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary} style={{ marginBottom: 16 }}>
                                {t('rejectionReasonDesc')}
                            </TextComponent>

                            <TextInput
                                style={[styles.formInput, { height: 100, color: theme.textPrimary, borderColor: theme.borderPrimary, borderWidth: 1, padding: 12, borderRadius: 12, textAlignVertical: 'top', marginBottom: 20 }]}
                                multiline
                                placeholder={t('rejectionReasonPlaceholder')}
                                placeholderTextColor={theme.textSecondary + '80'}
                                value={rejectionReasonText}
                                onChangeText={setRejectionReasonText}
                            />

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[styles.formActionBtn, { backgroundColor: theme.bgPrimary }]}
                                    onPress={() => setRejectionModalVisible(false)}
                                >
                                    <TextComponent variant="caption" bold color={theme.textSecondary}>
                                        {t('cancel')}
                                    </TextComponent>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.formActionBtn, { backgroundColor: theme.danger }]}
                                    onPress={handleConfirmRejection}
                                >
                                    <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                                        {t('rejectTour')}
                                    </TextComponent>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
