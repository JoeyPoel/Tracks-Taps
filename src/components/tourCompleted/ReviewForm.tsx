import { uploadImage } from '@/src/services/imageService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton } from '../common/AnimatedButton';
import { AnimatedPressable } from '../common/AnimatedPressable';

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
    const [photos, setPhotos] = useState<string[]>([]);

    const [uploading, setUploading] = useState(false);

    const handlePress = () => {
        if (rating > 0) {
            onSubmit(rating, content, photos);
        }
    };

    const handleAddPhoto = async () => {
        if (photos.length >= 5) return;

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                setUploading(true);
                const publicUrl = await uploadImage(result.assets[0].uri, 'images', 'reviews');
                setPhotos([...photos, publicUrl]);
            }
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Upload Failed", "There was an error uploading your photo.");
        } finally {
            setUploading(false);
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
            <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                    <AnimatedPressable style={styles.closeIcon} onPress={onClose} interactionScale="subtle" haptic="light">
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </AnimatedPressable>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>Rate Your Experience</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        How was "{tourName}"? Your feedback helps others!
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <AnimatedPressable key={star} onPress={() => setRating(star)} interactionScale="medium" haptic="selection">
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={theme.starColor}
                                    style={{ marginHorizontal: 6 }}
                                />
                            </AnimatedPressable>
                        ))}
                    </View>

                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.borderInput, color: theme.textPrimary }]}
                        placeholder={t('reviewPlaceholder')}
                        placeholderTextColor={theme.textTertiary}
                        multiline
                        numberOfLines={4}
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                    />

                    <AnimatedPressable
                        style={[styles.addPhotoButton, { backgroundColor: theme.bgTertiary, borderColor: theme.borderSecondary }]}
                        onPress={handleAddPhoto}
                        interactionScale="subtle"
                        haptic="light"
                        disabled={uploading || photos.length >= 5}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color={theme.textPrimary} style={{ marginRight: 8 }} />
                        ) : (
                            <Ionicons name="camera-outline" size={20} color={theme.textPrimary} style={{ marginRight: 8 }} />
                        )}
                        <Text style={[styles.addPhotoText, { color: theme.textPrimary }]}>
                            {uploading ? t('uploading') : t('takePhoto')}
                        </Text>
                        <Text style={[styles.photoCount, { color: theme.textSecondary }]}>{photos.length}/5</Text>
                    </AnimatedPressable>

                    <View style={styles.photoGrid}>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri }} style={styles.photo} />
                                <AnimatedPressable
                                    style={[styles.deletePhotoBtn, { borderColor: theme.bgSecondary }]}
                                    onPress={() => removePhoto(index)}
                                    interactionScale="subtle"
                                    haptic="warning"
                                >
                                    <Ionicons name="close" size={12} color="#fff" />
                                </AnimatedPressable>
                            </View>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <AnimatedButton
                            title={t('cancel')}
                            onPress={onClose}
                            variant="secondary"
                            style={styles.cancelButton}
                        />

                        <AnimatedButton
                            title={t('submitReview')}
                            onPress={handlePress}
                            variant="primary"
                            loading={submitting}
                            disabled={rating === 0 || submitting}
                            style={styles.submitButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
        textAlign: 'left',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        height: 120,
        marginBottom: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
        borderWidth: 1,
    },
    addPhotoText: {
        fontWeight: '600',
        marginRight: 8,
    },
    photoCount: {
        fontSize: 12,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    photoItem: {
        position: 'relative',
        width: 60,
        height: 60,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    deletePhotoBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FF4757',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        height: 48,
    },
    submitButton: {
        flex: 1,
        height: 48,
    },
});
