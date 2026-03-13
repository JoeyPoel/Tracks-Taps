import { useAppWidth } from '@/src/hooks/useAppWidth';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Modal, Platform, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface ImageLightboxProps {
    visible: boolean;
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

/**
 * A reusable full-screen image viewer with horizontal paging.
 */
export function ImageLightbox({ visible, images, initialIndex, onClose }: ImageLightboxProps) {
    const { height: windowHeight } = useWindowDimensions();
    const appWidth = useAppWidth();

    if (!images || images.length === 0) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={32} color="#FFF" />
                </TouchableOpacity>

                {visible && (
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={initialIndex}
                        getItemLayout={(_, index) => ({
                            length: appWidth,
                            offset: appWidth * index,
                            index,
                        })}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        renderItem={({ item }) => (
                            <View 
                                key={item}
                                style={{
                                    width: appWidth,
                                    height: windowHeight,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    source={{ uri: getOptimizedImageUrl(item, 800) }}
                                    style={{
                                        width: appWidth,
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
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
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
