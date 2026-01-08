import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import { TourDraft } from '@/src/hooks/useCreateTour';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PencilSquareIcon } from 'react-native-heroicons/solid';

interface Props {
    draft: TourDraft;
}

export function ReviewCardHeader({ draft }: Props) {
    const { theme } = useTheme();
    return (
        <View style={styles.imageBackground}>
            <Image
                source={{ uri: getOptimizedImageUrl(draft.imageUrl, 600) }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="disk"
            />
            <LinearGradient
                colors={['transparent', theme.overlay]}
                style={styles.gradient}
            >
                <TouchableOpacity style={[styles.editButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <PencilSquareIcon size={20} color="white" />
                </TouchableOpacity>

                {draft.difficulty && (
                    <View style={[styles.difficultyBadge, { backgroundColor: theme.bgSecondary }]}>
                        <TextComponent style={styles.difficultyText} color={theme.textPrimary} bold variant="caption">
                            {draft.difficulty}
                        </TextComponent>
                    </View>
                )}

                {draft.modes.length > 0 && (
                    <View style={styles.modesContainer}>
                        {draft.modes.filter(m => m !== 'CLASSIC').map((mode, index) => (
                            <View key={index} style={[styles.modeTag, { backgroundColor: theme.secondary }]}>
                                <TextComponent style={styles.modeText} color={theme.textOnSecondary} bold variant="caption">
                                    {mode}
                                </TextComponent>
                            </View>
                        ))}
                    </View>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    imageBackground: {
        height: 200,
        justifyContent: 'flex-end',
    },
    gradient: {
        height: '100%',
        justifyContent: 'space-between',
        padding: 12,
    },
    difficultyBadge: {
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    modesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    modeTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    modeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    editButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 6,
        borderRadius: 20,
    },
});
