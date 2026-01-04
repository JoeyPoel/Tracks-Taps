import { TextComponent } from '@/src/components/common/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { SavedTrip } from '../../services/savedTripsService';
import { AnimatedButton } from '../common/AnimatedButton';
import { AppModal } from '../common/AppModal';

interface AddToSavedTripsModalProps {
    visible: boolean;
    onClose: () => void;
    tourId: number;
    lists: SavedTrip[];
    onCreateList: (name: string) => Promise<SavedTrip>;
    onAddTour: (listId: number, tourId: number) => Promise<void>;
    onRemoveTour: (listId: number, tourId: number) => Promise<void>;
}

export default function AddToSavedTripsModal({
    visible,
    onClose,
    tourId,
    lists,
    onCreateList,
    onAddTour,
    onRemoveTour
}: AddToSavedTripsModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage(); // Added hook
    const [creating, setCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible) {
            // Reset state on close
            setCreating(false);
            setNewListName('');
        }
    }, [visible]);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        try {
            setSubmitting(true);
            const newList = await onCreateList(newListName.trim());
            setNewListName('');
            setCreating(false);
            Keyboard.dismiss();
            await onAddTour(newList.id, tourId);
        } catch (error) {
            console.error('Failed to create saved trip list', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleTour = async (listId: number, isIncluded: boolean) => {
        try {
            if (isIncluded) {
                await onRemoveTour(listId, tourId);
            } else {
                await onAddTour(listId, tourId);
            }
        } catch (error) {
            console.error('Failed to update saved trip list', error);
        }
    };

    const isTourInList = (list: SavedTrip) => {
        return list.tours?.some(t => t.id === tourId);
    };

    return (
        <AppModal
            visible={visible}
            onClose={onClose}
            title={t('saveToCollectionTitle') || "Save to Collection"}
            height="70%"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                {/* Internal loading removed as lists are passed via props */}
                {lists.length === 0 && !creating ? (
                    // Optional: Show empty state if no lists and not creating
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <TextComponent style={{ color: theme.textSecondary }} variant="body">{t('noCollectionsYet') || "No collections yet."}</TextComponent>
                        <TouchableOpacity onPress={() => setCreating(true)}>
                            <TextComponent style={{ marginTop: 8 }} color={theme.primary} bold variant="body">{t('createOne') || "Create one"}</TextComponent>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.listContainer}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <TouchableOpacity
                            style={[styles.createItem, { backgroundColor: creating ? theme.bgTertiary : 'transparent' }]}
                            onPress={() => setCreating(!creating)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
                                <Ionicons name={creating ? "chevron-up" : "add"} size={24} color="white" />
                            </View>
                            <TextComponent style={styles.createText} color={theme.primary} bold variant="body">
                                {creating ? (t('cancelCreation') || 'Cancel creation') : (t('newCollection') || 'New Collection')}
                            </TextComponent>
                        </TouchableOpacity>

                        {creating && (
                            <Animated.View entering={FadeInDown.duration(200)} style={styles.createForm}>
                                <TextInput
                                    style={[styles.input, {
                                        color: theme.textPrimary,
                                        backgroundColor: theme.bgPrimary,
                                        borderColor: theme.primary
                                    }]}
                                    placeholder={t('nameCollectionPlaceholder') || "Name your collection..."}
                                    placeholderTextColor={theme.textSecondary}
                                    value={newListName}
                                    onChangeText={setNewListName}
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateList}
                                />
                                <AnimatedButton
                                    title={submitting ? "Creating..." : "Create"}
                                    onPress={handleCreateList}
                                    disabled={!newListName.trim() || submitting}
                                    style={{ marginTop: 12, height: 46 }}
                                />
                            </Animated.View>
                        )}

                        <View style={styles.divider} />

                        {lists.map((list) => {
                            const included = isTourInList(list);
                            return (
                                <TouchableOpacity
                                    key={list.id}
                                    style={[styles.listItem, { borderBottomColor: theme.bgTertiary }]}
                                    onPress={() => handleToggleTour(list.id, included)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.listContent}>
                                        <View style={[
                                            styles.thumbnail,
                                            { backgroundColor: theme.bgTertiary },
                                            included && { borderColor: theme.primary, borderWidth: 2 }
                                        ]}>
                                            <Ionicons
                                                name={included ? "checkmark" : "images-outline"}
                                                size={20}
                                                color={included ? theme.primary : theme.textSecondary}
                                            />
                                        </View>
                                        <View style={styles.listInfo}>
                                            <TextComponent style={styles.listName} color={included ? theme.primary : theme.textPrimary} bold variant="body">
                                                {list.name}
                                            </TextComponent>
                                            <TextComponent style={styles.listCount} color={theme.textSecondary} variant="caption">
                                                {list.tours?.length || 0} {t('items') || "items"}
                                            </TextComponent>
                                        </View>
                                    </View>

                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: included ? theme.primary : theme.textSecondary },
                                        included && { backgroundColor: theme.primary }
                                    ]}>
                                        {included && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 0,
    },
    createItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        marginHorizontal: 0,
        borderRadius: 16,
        marginBottom: 8,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createText: {
        fontSize: 17,
        fontWeight: '600',
    },
    createForm: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    input: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(150,150,150,0.1)',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 4,
        borderRadius: 12,
    },
    listContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listInfo: {
        gap: 2,
    },
    listName: {
        fontSize: 17,
        fontWeight: '600',
    },
    listCount: {
        fontSize: 13,
        fontWeight: '500',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
