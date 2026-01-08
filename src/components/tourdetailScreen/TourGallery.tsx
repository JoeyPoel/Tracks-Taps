import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';
import { TextComponent } from '../common/TextComponent'; // Added import

interface TourGalleryProps {
    images: string[];
}

export default function TourGallery({ images }: TourGalleryProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showEmpty, setShowEmpty] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (!images || images.length === 0) {
            timer = setTimeout(() => {
                setShowEmpty(true);
            }, 800); // 800ms delay before showing "No photos" to avoid flash
        } else {
            setShowEmpty(false);
        }
        return () => clearTimeout(timer);
    }, [images]);

    const openGallery = (index: number) => {
        setSelectedIndex(index);
    };

    const closeGallery = () => {
        setSelectedIndex(null);
    };

    // If no images and waiting period is over, show empty state
    if ((!images || images.length === 0) && showEmpty) {
        return (
            <View style={styles.container}>
                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">{t('gallery') || "Gallery"}</TextComponent>
                <View style={[styles.emptyContainer, { backgroundColor: theme.bgSecondary }]}>
                    <Ionicons name="images-outline" size={32} color={theme.textSecondary} style={{ marginBottom: 8 }} />
                    <TextComponent style={styles.emptyText} color={theme.textSecondary} variant="body">
                        No photos yet. Be the first to share one! 📸
                    </TextComponent>
                </View>
            </View>
        );
    }

    // If no images but still within grace period, show loading skeleton
    if ((!images || images.length === 0) && !showEmpty) {
        return (
            <View style={styles.container}>
                <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">{t('gallery') || "Gallery"}</TextComponent>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {[1, 2, 3].map((key) => (
                        <View key={key} style={styles.imageWrapper}>
                            <Shimmer width={140} height={140} borderRadius={16} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">{t('gallery') || "Gallery"}</TextComponent>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {images.map((img, index) => (
                    <Animated.View
                        key={`${img}-${index}`}
                        entering={FadeInRight.delay(index * 100).springify()}
                    >
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => openGallery(index)}
                            style={styles.imageWrapper}
                        >
                            <Image
                                source={{ uri: getOptimizedImageUrl(img, 200) }}
                                style={styles.image}
                                contentFit="cover"
                                cachePolicy="disk"
                                transition={200}
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.3)']}
                                style={styles.gradient}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Full Screen Viewer Modal */}
            <Modal
                visible={selectedIndex !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={closeGallery}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeGallery}
                    >
                        <Ionicons name="close" size={32} color="#FFF" />
                    </TouchableOpacity>

                    {selectedIndex !== null && (
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={selectedIndex}
                            getItemLayout={(_, index) => ({
                                length: windowWidth,
                                offset: windowWidth * index,
                                index,
                            })}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            renderItem={({ item }) => (
                                <View style={{
                                    width: windowWidth,
                                    height: windowHeight,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Image
                                        source={{ uri: getOptimizedImageUrl(item, 800) }}
                                        style={{
                                            width: windowWidth,
                                            height: windowHeight,
                                        }}
                                        contentFit="contain"
                                        cachePolicy="disk"
                                    />
                                </View>
                            )}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    title: {
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    imageWrapper: {
        width: 140,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        // Soft shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    emptyContainer: {
        marginHorizontal: 20,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.7,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
});
