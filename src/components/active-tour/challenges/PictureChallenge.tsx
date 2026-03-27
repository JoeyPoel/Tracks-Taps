import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveImageToGallery, uploadOptimizedImage } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTranslation } from '../../../context/TranslationContext';
import { useTheme } from '../../../context/ThemeContext';
import { TextComponent } from '../../common/TextComponent';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface PictureChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: any) => void;
    index: number;
    isBonus?: boolean;
}

const PictureChallenge: React.FC<PictureChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    index,
    isBonus = false
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { translateText } = useTranslation();
    const isDone = isCompleted || isFailed;
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(true);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const checkDisclaimer = async () => {
            try {
                const value = await AsyncStorage.getItem('@photo_disclaimer_accepted');
                if (value !== 'true') {
                    setDisclaimerAccepted(false);
                }
            } catch (e) {
                // Ignore
            }
        };
        checkDisclaimer();
    }, []);

    const handlePress = async (): Promise<void> => {
        if (!disclaimerAccepted) {
            Alert.alert(
                t('camera') || 'Camera',
                t('challengeImageHelp') || "Challenge photos are stored for your team's review and are not used for the tour description.",
                [
                    { text: t('cancel') || 'Cancel', style: 'cancel' },
                    { 
                        text: t('accept') || 'Accept', 
                        onPress: async () => {
                            await AsyncStorage.setItem('@photo_disclaimer_accepted', 'true');
                            setDisclaimerAccepted(true);
                            await processCameraLaunch();
                        }
                    }
                ]
            );
            return;
        }

        await processCameraLaunch();
    };

    const processCameraLaunch = async (): Promise<void> => {
        try {
            // Request camera + gallery permissions together before opening camera
            // so that saveToLibraryAsync can fire instantly after capture
            const [cameraPermission, galleryPermission] = await Promise.all([
                ImagePicker.requestCameraPermissionsAsync(),
                MediaLibrary.requestPermissionsAsync(),
            ]);

            if (!cameraPermission.granted) {
                Alert.alert(t('permissionNeeded'), t('cameraPermissionMsg') || "Camera access is needed to complete this challenge.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const capturedImage = result.assets[0];

                // Save to gallery instantly — permission already granted above
                saveImageToGallery(capturedImage.uri);

                // Optimistic completion: mark challenge done immediately
                setImageUri(capturedImage.uri);
                onComplete({ ...challenge, imageUrl: capturedImage.uri });

                // Upload in background — no need to block the user
                uploadOptimizedImage(capturedImage.uri, 'images', 'challenge-entries')
                    .catch((uploadError) => {
                        console.warn('[PictureChallenge] Background upload failed:', uploadError);
                    });
            }
        } catch (error) {
            console.error("Camera error", error);
            Alert.alert("Error", "Could not open camera.");
        }
    };

    return (
        <ActiveChallengeCard
            title={translateText(challenge.title)}
            points={challenge.points}
            type="camera"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handlePress}
            actionLabel={t('takePhoto')}
            disabled={isDone}
            index={index}
            isBonus={isBonus}
            translateText={challenge.content}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {translateText(challenge.content)}
            </Text>

            <View style={styles.content}>
                {(imageUri || isCompleted) && (
                    <View style={styles.placeholderImage}>
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.previewImage}
                                contentFit="cover"
                                cachePolicy="disk"
                            />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={40} color={theme.success} />
                                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{t('photoUploaded')}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    helpText: {
        marginBottom: 8,
        opacity: 0.8,
        lineHeight: 16,
    },
    content: {
        marginBottom: 8,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    placeholderImage: {
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        overflow: 'hidden',
    },
    loadingContainer: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});

export default PictureChallenge;
