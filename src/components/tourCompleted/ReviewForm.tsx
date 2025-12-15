import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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

    const handlePress = () => {
        if (rating > 0) {
            onSubmit(rating, content, photos);
        }
    };

    const handleAddMockPhoto = () => {
        if (photos.length < 5) {
            const mockImages = [
                'https://picsum.photos/100/100?random=1',
                'https://picsum.photos/100/100?random=2',
                'https://picsum.photos/100/100?random=3',
                'https://picsum.photos/100/100?random=4',
                'https://picsum.photos/100/100?random=5',
            ];
            setPhotos([...photos, mockImages[photos.length]]);
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
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>Rate Your Experience</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        How was "{tourName}"? Your feedback helps others!
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={theme.starColor}
                                    style={{ marginHorizontal: 6 }}
                                />
                            </TouchableOpacity>
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

                    <TouchableOpacity
                        style={[styles.addPhotoButton, { backgroundColor: theme.bgTertiary, borderColor: theme.borderSecondary }]}
                        onPress={handleAddMockPhoto}
                    >
                        <Ionicons name="camera-outline" size={20} color={theme.textPrimary} style={{ marginRight: 8 }} />
                        <Text style={[styles.addPhotoText, { color: theme.textPrimary }]}>{t('takePhoto')}</Text>
                        <Text style={[styles.photoCount, { color: theme.textSecondary }]}>{photos.length}/5</Text>
                    </TouchableOpacity>

                    <View style={styles.photoGrid}>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={[styles.deletePhotoBtn, { borderColor: theme.bgSecondary }]}
                                    onPress={() => removePhoto(index)}
                                >
                                    <Ionicons name="close" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.bgDisabled }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>{t('cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.primary, opacity: (rating === 0 || submitting) ? 0.6 : 1 }
                            ]}
                            onPress={handlePress}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={theme.textOnPrimary} />
                            ) : (
                                <Text style={[styles.submitButtonText, { color: theme.textOnPrimary }]}>{t('submitReview')}</Text>
                            )}
                        </TouchableOpacity>
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
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelButtonText: {
        fontWeight: '600',
    },
    submitButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    submitButtonText: {
        fontWeight: 'bold',
    },
});
