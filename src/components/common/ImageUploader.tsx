import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useImageUploader } from '@/src/hooks/useImageUploader';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextComponent } from './TextComponent';

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

    // Use the hook
    const {
        image,
        uploading,
        pickImage,
        removeImage
    } = useImageUploader({
        initialImage,
        folder,
        onUploadComplete,
        variant
    });

    const isAvatar = variant === 'avatar';
    const containerStyle = isAvatar ? styles.avatarContainer : styles.standardContainer;

    const renderStandard = () => (
        <View style={[styles.previewContainer, styles.standardContainer]}>
            <Image
                source={{ uri: getOptimizedImageUrl(image!, 600) }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="disk"
            />
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
                <Image
                    source={{ uri: getOptimizedImageUrl(image!, 200) }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    cachePolicy="disk"
                />
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
                    <TextComponent style={styles.actionText} color={theme.textPrimary} variant="label">{t('edit')}</TextComponent>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.bgSecondary, borderColor: theme.error }]}
                    onPress={removeImage}
                    disabled={uploading}
                >
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                    <TextComponent style={styles.actionText} color={theme.error} variant="label">{t('remove')}</TextComponent>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, isAvatar && { alignItems: 'center' }]}>
            <TextComponent style={styles.label} color={theme.textSecondary} bold variant="label">{label}</TextComponent>

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
                            {!isAvatar && <TextComponent style={styles.uploadText} color={theme.textSecondary} variant="body">{placeholder}</TextComponent>}
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
        // handled
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
        // handled
    }
});
