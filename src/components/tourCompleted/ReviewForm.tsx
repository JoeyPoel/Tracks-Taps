import { TextComponent } from '@/src/components/common/TextComponent';
import { uploadOptimizedImage } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton } from '../common/AnimatedButton';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { saveImageToGallery } from '../../utils/imageUtils';

interface ReviewPhoto {
    id: string;
    uri: string;
    publicUrl?: string;
    uploading: boolean;
}

interface ReviewFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, content: string, photos: string[]) => void;
    submitting: boolean;
    tourName?: string;
}

export default function ReviewForm({ visible, onClose, onSubmit, submitting, tourName = "the tour" }: ReviewFormProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [photos, setPhotos] = useState<ReviewPhoto[]>([]);

    // Reset state when modal opens
    React.useEffect(() => {
        if (visible) {
            setRating(0);
            setContent('');
            setPhotos([]);
        }
    }, [visible]);

    const handlePress = () => {
        if (rating === 0) {
            Alert.alert(t('error'), t('pleaseSelectStars') || 'Please select a star rating.');
            return;
        }

        if (!content.trim()) {
            Alert.alert(t('error'), t('pleaseWriteReview') || 'Please write a short review.');
            return;
        }

        const stillUploading = photos.some(p => p.uploading);
        if (stillUploading) {
            Alert.alert(t('pleaseWait'), t('uploadsInProgress') || 'Please wait for photos to finish uploading.');
            return;
        }

        const urls = photos.map(p => p.publicUrl).filter(Boolean) as string[];
        onSubmit(rating, content, urls);
    };

    const startUpload = async (uri: string, id: string) => {
        try {
            const publicUrl = await uploadOptimizedImage(uri, 'images', 'reviews');
            setPhotos(prev => prev.map(p => p.id === id ? { ...p, publicUrl, uploading: false } : p));
        } catch (error) {
            console.error("Upload error:", error);
            setPhotos(prev => prev.filter(p => p.id !== id)); // Remove if failed
            Alert.alert(t('uploadFailed'), t('uploadErrorMsg'));
        }
    };

    const handleAddPhoto = async (useCamera: boolean = false) => {
        if (photos.length >= 5) return;

        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') return Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));
                
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

                // If taken with camera, save to gallery optimistically
                if (useCamera) {
                    saveImageToGallery(uri);
                }

                // OPTIMISTIC UI: Add to state immediately
                setPhotos(prev => [...prev, { id, uri, uploading: true }]);

                // Start background upload
                startUpload(uri, id);
            }
        } catch (error) {
            console.error("Gallery/Camera error:", error);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                onPress={() => {
                    Keyboard.dismiss();
                    onClose();
                }}
            >
                {/* Main Card */}
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    style={[styles.modalContent, { backgroundColor: theme.bgSecondary }]}
                >
                    <Pressable onPress={Keyboard.dismiss}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">{t('rateExperience')}</TextComponent>
                                <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                                    {tourName}
                                </TextComponent>
                            </View>
                            <AnimatedPressable onPress={onClose} interactionScale="subtle" style={styles.closeBtn}>
                                <XMarkIcon size={24} color={theme.textSecondary} />
                            </AnimatedPressable>
                        </View>

                        {/* Star Rating - Bigger & Centered */}
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star, index) => (
                                <Animated.View
                                    key={star}
                                    entering={FadeInDown.delay(index * 50).springify()}
                                >
                                    <AnimatedPressable onPress={() => setRating(star)} interactionScale="medium" haptic="selection">
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={42}
                                            color={star <= rating ? theme.gold : theme.textTertiary}
                                            style={{ marginHorizontal: 4 }}
                                        />
                                    </AnimatedPressable>
                                </Animated.View>
                            ))}
                        </View>

                        {/* Rating Label */}
                        <View style={{ alignItems: 'center', marginBottom: 20, height: 20 }}>
                            {rating > 0 && (
                                <TextComponent style={{ fontSize: 14 }} color={theme.primary} bold variant="body">
                                    {rating === 5 ? t('amazing') : rating === 4 ? t('good') : rating === 3 ? t('okay') : t('notGreat')}
                                </TextComponent>
                            )}
                        </View>

                        {/* Input Area */}
                        <TextComponent style={styles.label} color={theme.textSecondary} bold variant="caption">{t('writeReview')}</TextComponent>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bgInput, color: theme.textPrimary, borderColor: theme.borderInput }]}
                            placeholder={t('reviewPlaceholder')}
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            numberOfLines={4}
                            value={content}
                            onChangeText={setContent}
                            textAlignVertical="top"
                        />

                        {/* Photo Upload Section */}
                        <View style={styles.photoSection}>
                            <View style={styles.uploadButtonsRow}>
                                <AnimatedPressable
                                    style={[styles.addPhotoButton, { borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                                    onPress={() => handleAddPhoto(false)}
                                    disabled={photos.length >= 5}
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
                                    disabled={photos.length >= 5}
                                    interactionScale="subtle"
                                >
                                    <Ionicons name="camera" size={20} color={theme.primary} />
                                    <TextComponent style={styles.addPhotoText} color={theme.textPrimary} bold variant="caption">
                                        {t('camera')}
                                    </TextComponent>
                                </AnimatedPressable>

                                <View style={styles.countBadge}>
                                    <TextComponent color={theme.textTertiary} bold variant="caption">
                                        {photos.length}/5
                                    </TextComponent>
                                </View>
                            </View>

                            <View style={styles.photoList}>
                                {photos.map((item, index) => (
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

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <AnimatedButton
                                title={t('submitReview')}
                                onPress={handlePress}
                                variant="primary"
                                loading={submitting}
                                disabled={submitting}
                                style={styles.submitButton}
                                icon="send"
                            />
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    closeBtn: {
        padding: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
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
        height: 110,
        marginBottom: 20,
        borderWidth: 1,
        fontSize: 16,
    },
    photoSection: {
        marginBottom: 24,
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
        marginTop: 8,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
    },
});
