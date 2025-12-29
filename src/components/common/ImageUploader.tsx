import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { uploadImage } from '@/src/services/imageService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void;
    initialImage?: string;
    folder?: string;
    label?: string;
    placeholder?: string;
    variant?: 'standard' | 'avatar';
}

export function ImageUploader({
    onUploadComplete,
    initialImage,
    folder = 'uploads',
    label = "Image",
    placeholder = "Select an image",
    variant = 'standard'
}: ImageUploaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [uploading, setUploading] = useState(false);

    React.useEffect(() => {
        if (initialImage) {
            setImage(initialImage);
        }
    }, [initialImage]);

    const isAvatar = variant === 'avatar';

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: isAvatar ? [1, 1] : [16, 9], // Standard landscape or square for avatar
            quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
            handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        try {
            setUploading(true);
            setImage(uri); // Optimistic update
            const publicUrl = await uploadImage(uri, 'images', folder);
            onUploadComplete(publicUrl);
            setImage(publicUrl);
        } catch (error) {
            Alert.alert(t('uploadFailed'), t('uploadErrorMsg'));
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImage(null);
        onUploadComplete('');
    };

    const containerStyle = isAvatar ? styles.avatarContainer : styles.standardContainer;

    const renderStandard = () => (
        <View style={[styles.previewContainer, styles.standardContainer]}>
            <Image source={{ uri: image! }} style={styles.image} />
            {uploading && (
                <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                    <ActivityIndicator color={theme.primary} size="large" />
                </View>
            )}
            <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: theme.error }]}
                onPress={removeImage}
                disabled={uploading}
            >
                <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.bgSecondary }]}
                onPress={pickImage}
                disabled={uploading}
            >
                <Ionicons name="pencil" size={16} color={theme.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    const renderAvatar = () => (
        <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={[styles.previewContainer, styles.avatarContainer]}>
                <Image source={{ uri: image! }} style={styles.avatarImage} />
                {uploading && (
                    <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                        <ActivityIndicator color={theme.primary} size="large" />
                    </View>
                )}
            </View>
            <View style={styles.avatarActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    <Ionicons name="pencil" size={16} color={theme.textPrimary} />
                    <Text style={[styles.actionText, { color: theme.textPrimary }]}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.bgSecondary, borderColor: theme.error }]}
                    onPress={removeImage}
                    disabled={uploading}
                >
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                    <Text style={[styles.actionText, { color: theme.error }]}>{t('remove')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, isAvatar && { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>

            {image ? (
                isAvatar ? renderAvatar() : renderStandard()
            ) : (
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        containerStyle,
                        { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }
                    ]}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={theme.primary} />
                    ) : (
                        <>
                            <Ionicons name={isAvatar ? "person-outline" : "image-outline"} size={isAvatar ? 40 : 32} color={theme.textSecondary} />
                            {!isAvatar && <Text style={[styles.uploadText, { color: theme.textSecondary }]}>{placeholder}</Text>}
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    standardContainer: {
        height: 200,
        width: '100%',
        borderRadius: 16,
    },
    avatarContainer: {
        height: 120,
        width: 120,
        borderRadius: 60,
    },
    uploadButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '500',
    },
    previewContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    editButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    avatarActions: {
        flexDirection: 'row',
        gap: 12,
        left: 12,

    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
