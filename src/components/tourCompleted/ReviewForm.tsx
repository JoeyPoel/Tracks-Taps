import { TextComponent } from '@/src/components/common/TextComponent';
import { uploadOptimizedImage } from '@/src/utils/imageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, TouchableWithoutFeedback } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton } from '../common/AnimatedButton';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { saveImageToGallery } from '../../utils/imageUtils';
import { AppModal } from '../common/AppModal';

interface ReviewPhoto {
    id: string;
    uri: string;
    publicUrl?: string;
    uploading: boolean;
}

interface ReviewFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, content: string, photos: string[]) => Promise<void> | void;
    submitting: boolean;
    tourName: string;
    tourId?: string | number;
    initialData?: {
        id: string;
        rating: number;
        content: string;
        photos: string[];
    };
    mode?: 'create' | 'edit';
}

export default function ReviewForm({ visible, onClose, onSubmit, submitting, tourName, tourId, initialData, mode = 'create' }: ReviewFormProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [formState, setFormState] = useState({
        rating: 0,
        content: '',
        photos: [] as ReviewPhoto[],
        mode: mode,
        title: mode === 'edit' ? t('editReview') : t('rateExperience')
    });
    const [isWaitingForUploads, setIsWaitingForUploads] = useState(false);

    const prevVisible = React.useRef(visible);
    const pendingUploads = React.useRef<Map<string, Promise<string | null>>>(new Map());
    const photosRef = React.useRef(formState.photos);
    
    React.useEffect(() => {
        photosRef.current = formState.photos;
    }, [formState.photos]);

    const DRAFT_KEY = `@review_draft_v1_${tourId}`;

    // Load draft or initial data when modal opens
    React.useEffect(() => {
        const loadInitialData = async () => {
            if (mode === 'edit' && initialData) {
                setFormState({
                    rating: initialData.rating,
                    content: initialData.content,
                    photos: initialData.photos.map(url => ({ 
                        id: Math.random().toString(), 
                        uri: url, 
                        publicUrl: url, 
                        uploading: false 
                    })),
                    mode: 'edit',
                    title: t('editReview')
                });
            } else {
                try {
                    const stored = await AsyncStorage.getItem(DRAFT_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        setFormState({
                            rating: parsed.rating || 0,
                            content: parsed.content || '',
                            photos: parsed.photos || [],
                            mode: 'create',
                            title: t('rateExperience')
                        });
                    } else {
                        setFormState({
                            rating: 0,
                            content: '',
                            photos: [],
                            mode: 'create',
                            title: t('rateExperience')
                        });
                    }
                } catch (e) {
                    console.error("Failed to load review draft", e);
                }
            }
        };

        if (visible && !prevVisible.current) {
            loadInitialData();
        }
        
        // If the modal was closed, we don't clear immediate state so closing is smooth,
        // but we ensure next open is fresh.
        
        prevVisible.current = visible;
    }, [visible, mode, initialData, tourId, t]);

    // Save draft on changes (only in create mode)
    React.useEffect(() => {
        if (formState.mode === 'create' && visible) {
            const draft = { 
                rating: formState.rating, 
                content: formState.content, 
                photos: formState.photos 
            };
            if (draft.rating > 0 || draft.content.length > 0 || draft.photos.length > 0) {
                const timeoutId = setTimeout(() => {
                    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(e => 
                        console.error("Failed to save review draft", e)
                    );
                }, 500);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [formState.rating, formState.content, formState.photos, formState.mode, visible, tourId]);

    const clearDraft = async () => {
        try {
            await AsyncStorage.removeItem(DRAFT_KEY);
        } catch (e) {
            console.error("Failed to clear review draft", e);
        }
    };

    const handlePress = async () => {
        if (formState.rating === 0) {
            Alert.alert(t('error'), t('pleaseSelectStars') || 'Please select a star rating.');
            return;
        }

        if (!formState.content.trim()) {
            Alert.alert(t('error'), t('pleaseWriteReview') || 'Please write a short review.');
            return;
        }

        let finalUrls: string[] = [];

        // Wait for all currently uploading photos
        const stillUploading = photosRef.current.some(p => p.uploading);
        if (stillUploading) {
            setIsWaitingForUploads(true);
            try {
                // Collect and wait for all pending upload promises
                const promises = Array.from(pendingUploads.current.values());
                const newUrls = await Promise.all(promises);
                
                // Merge already uploaded urls with new ones:
                finalUrls = [
                    ...photosRef.current.filter(p => !p.uploading && p.publicUrl).map(p => p.publicUrl!),
                    ...newUrls.filter(Boolean) as string[]
                ];
            } catch (err) {
                console.error("Error waiting for uploads:", err);
            } finally {
                setIsWaitingForUploads(false);
            }
        } else {
            // Re-check photos from ref to get the latest (post-upload) state
            const finalPhotos = photosRef.current;
            finalUrls = finalPhotos.map(p => p.publicUrl).filter(Boolean) as string[];
        }
        
        if (formState.mode === 'create') {
            const result = onSubmit(formState.rating, formState.content, finalUrls);
            if (result instanceof Promise) {
                await result;
                clearDraft();
            } else {
                clearDraft();
            }
        } else {
            await onSubmit(formState.rating, formState.content, finalUrls);
        }
        // Use onClose directly here to skip safeguard since we actually saved
        onClose();
    };

    const handleCloseAttempt = () => {
        // Compare current state with initial/draft to see if something changed
        let hasChanges = false;
        if (formState.mode === 'edit' && initialData) {
            const currentPhotosUrls = formState.photos.map(p => p.publicUrl).filter(Boolean).sort().join(',');
            const initialPhotosUrls = initialData.photos.sort().join(',');
            hasChanges = 
                formState.rating !== initialData.rating || 
                formState.content.trim() !== initialData.content.trim() || 
                currentPhotosUrls !== initialPhotosUrls;
        } else {
            // For create mode, we check if anything is filled at all (or if it differs from a potentially loaded draft)
            // But easiest safeguard is: if anything is typed/rated, ask.
            hasChanges = formState.rating > 0 || formState.content.trim().length > 0 || formState.photos.length > 0;
        }

        if (hasChanges && !submitting) {
            Alert.alert(
                t('discardChanges') || 'Discard Changes?',
                t('discardChangesMessage') || 'You have unsaved changes. Are you sure you want to discard them?',
                [
                    { text: t('keepEditing') || 'Keep Editing', style: 'cancel' },
                    { text: t('discard') || 'Discard', style: 'destructive', onPress: () => { clearDraft(); onClose(); } }
                ]
            );
        } else {
            onClose();
        }
    };

    const startUpload = async (uri: string, id: string) => {
        const uploadTask = (async () => {
            try {
                const publicUrl = await uploadOptimizedImage(uri, 'images', 'reviews');
                setFormState(prev => ({
                    ...prev,
                    photos: prev.photos.map(p => p.id === id ? { ...p, publicUrl, uploading: false } : p)
                }));
                return publicUrl;
            } catch (error) {
                console.error("Upload error:", error);
                setFormState(prev => ({
                    ...prev,
                    photos: prev.photos.filter(p => p.id !== id)
                }));
                Alert.alert(t('uploadFailed'), t('uploadErrorMsg'));
                return null;
            } finally {
                pendingUploads.current.delete(id);
            }
        })();

        pendingUploads.current.set(id, uploadTask);
        return uploadTask;
    };

    const handleAddPhoto = async (useCamera: boolean = false) => {
        if (formState.photos.length >= 5) return;

        try {
            let result;
            if (useCamera) {
                const [cameraPerm, galleryPerm] = await Promise.all([
                    ImagePicker.requestCameraPermissionsAsync(),
                    MediaLibrary.requestPermissionsAsync(),
                ]);
                if (cameraPerm.status !== 'granted') return Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));
                
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') return Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));

                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0].uri) {
                const uri = result.assets[0].uri;
                const id = Math.random().toString(36).substring(7);

                if (useCamera) {
                    saveImageToGallery(uri);
                }

                setFormState(prev => ({
                    ...prev,
                    photos: [...prev.photos, { id, uri, uploading: true }]
                }));
                startUpload(uri, id);
            }
        } catch (error) {
            console.error("Gallery/Camera error:", error);
        }
    };

    const removePhoto = (index: number) => {
        setFormState(prev => {
            const newPhotos = [...prev.photos];
            newPhotos.splice(index, 1);
            return { ...prev, photos: newPhotos };
        });
    };

    return (
        <AppModal
            visible={visible}
            onClose={handleCloseAttempt}
            title={formState.title}
            subtitle={tourName}
            alignment="center"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={{ width: '100%' }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ paddingTop: 8 }}>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star, index) => (
                                <Animated.View
                                    key={star}
                                >
                                    <AnimatedPressable onPress={() => setFormState(prev => ({ ...prev, rating: star }))} interactionScale="medium" haptic="selection">
                                        <Ionicons
                                            name={star <= formState.rating ? "star" : "star-outline"}
                                            size={42}
                                            color={star <= formState.rating ? theme.gold : theme.textTertiary}
                                            style={{ marginHorizontal: 4 }}
                                        />
                                    </AnimatedPressable>
                                </Animated.View>
                            ))}
                        </View>

                        <View style={{ alignItems: 'center', marginBottom: 20, height: 20 }}>
                            {formState.rating > 0 && (
                                <TextComponent style={{ fontSize: 14 }} color={theme.primary} bold variant="body">
                                    {formState.rating === 5 ? t('amazing') : formState.rating === 4 ? t('good') : formState.rating === 3 ? t('okay') : t('notGreat')}
                                </TextComponent>
                            )}
                        </View>

                        <TextComponent style={styles.label} color={theme.textSecondary} bold variant="caption">{t('writeReview')}</TextComponent>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bgInput, color: theme.textPrimary, borderColor: theme.borderInput }]}
                            placeholder={t('reviewPlaceholder')}
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            numberOfLines={4}
                            value={formState.content}
                            onChangeText={(text) => setFormState(prev => ({ ...prev, content: text }))}
                            textAlignVertical="top"
                        />

                        <View style={styles.photoSection}>
                            <View style={styles.uploadButtonsRow}>
                                <AnimatedPressable
                                    style={[styles.addPhotoButton, { borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                                    onPress={() => handleAddPhoto(false)}
                                    disabled={formState.photos.length >= 5}
                                    interactionScale="subtle"
                                >
                                    <Ionicons name="images" size={20} color={theme.primary} />
                                    <TextComponent style={styles.addPhotoText} color={theme.textPrimary} bold variant="caption">
                                        {t('gallery')}
                                    </TextComponent>
                                </AnimatedPressable>

                                <AnimatedPressable
                                    style={[styles.addPhotoButton, { borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                                    onPress={() => handleAddPhoto(true)}
                                    disabled={formState.photos.length >= 5}
                                    interactionScale="subtle"
                                >
                                    <Ionicons name="camera" size={20} color={theme.primary} />
                                    <TextComponent style={styles.addPhotoText} color={theme.textPrimary} bold variant="caption">
                                        {t('camera')}
                                    </TextComponent>
                                </AnimatedPressable>

                                <View style={styles.countBadge}>
                                    <TextComponent color={theme.textTertiary} bold variant="caption">
                                        {formState.photos.length}/5
                                    </TextComponent>
                                </View>
                            </View>

                            <View style={styles.photoList}>
                                {formState.photos.map((item, index) => (
                                    <Animated.View key={item.id} entering={FadeInDown.springify()}>
                                        <View style={styles.photoItem}>
                                            <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
                                            {item.uploading && (
                                                <View style={[styles.uploadingOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                                                    <ActivityIndicator size="small" color="#fff" />
                                                </View>
                                            )}
                                            <AnimatedPressable
                                                style={[styles.deletePhotoBtn, { backgroundColor: theme.error }]}
                                                onPress={() => removePhoto(index)}
                                                haptic="light"
                                            >
                                                <Ionicons name="close" size={12} color="#fff" />
                                            </AnimatedPressable>
                                        </View>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <AnimatedButton
                                title={isWaitingForUploads ? t('waitingForUploads') || 'Processing Photos...' : (formState.mode === 'edit' ? t('updateReview') : t('submitReview'))}
                                onPress={handlePress}
                                variant="primary"
                                loading={submitting || isWaitingForUploads}
                                disabled={submitting || isWaitingForUploads}
                                style={styles.submitButton}
                                icon={isWaitingForUploads ? undefined : "send"}
                            />
                        </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </KeyboardAvoidingView>
        </AppModal>
    );
}

const styles = StyleSheet.create({
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderRadius: 16,
        padding: 16,
        height: 220,
        marginBottom: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    photoSection: {
        marginBottom: 16,
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 8,
        flex: 1,
    },
    uploadButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    countBadge: {
        paddingHorizontal: 8,
    },
    addPhotoText: {
        fontWeight: '700',
        fontSize: 13,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoItem: {
        position: 'relative',
        width: 50,
        height: 50,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    deletePhotoBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    footer: {
        marginTop: 0,
        marginBottom: 0,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
    },
});
