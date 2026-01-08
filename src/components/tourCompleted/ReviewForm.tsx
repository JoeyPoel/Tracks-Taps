import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
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
                Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));
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
                const publicUrl = await uploadOptimizedImage(result.assets[0].uri, 'images', 'reviews');
                setPhotos([...photos, publicUrl]);
            }
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert(t('uploadFailed'), t('uploadErrorMsg'));
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
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                {/* Main Card */}
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    style={[styles.modalContent, { backgroundColor: theme.bgSecondary }]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">{t('rateExperience')}</TextComponent>
                            <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                                {tourName}
                            </TextComponent>
                        </View>
                        <AnimatedPressable onPress={onClose} interactionScale="subtle" style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
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

                    {/* Rating Label (Optional feedback text based on stars) */}
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
                        <AnimatedPressable
                            style={[styles.addPhotoButton, { borderColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}
                            onPress={handleAddPhoto}
                            disabled={uploading || photos.length >= 5}
                            interactionScale="subtle"
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Ionicons name="camera" size={20} color={theme.primary} />
                            )}
                            <TextComponent style={styles.addPhotoText} color={theme.textPrimary} bold variant="caption">
                                {photos.length === 0 ? t('addPhotos') : `${photos.length}/5`}
                            </TextComponent>
                        </AnimatedPressable>

                        <View style={styles.photoList}>
                            {photos.map((uri, index) => (
                                <Animated.View key={index} entering={FadeInDown.springify()}>
                                    <View style={styles.photoItem}>
                                        <Image source={{ uri }} style={styles.photo} contentFit="cover" />
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
                            disabled={rating === 0 || submitting}
                            style={styles.submitButton}
                            icon="send"
                        />
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center', // Centered card
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
        alignItems: 'flex-start',
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
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 12,
        gap: 8,
    },
    addPhotoText: {
        fontWeight: '600',
        fontSize: 14,
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
        height: 56, // Taller button
        borderRadius: 16,
    },
});
