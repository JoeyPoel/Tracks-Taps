import OnboardingItem from '@/src/components/OnboardingItem';
import { useTheme } from '@/src/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Beer, Map, Swords, Trophy } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Find Your Quest',
        description: 'Discover hidden gems and curated tours. Your next great adventure is just a tap away.',
        icon: Map,
        image: require('@/assets/images/onboarding/map.png'),
    },
    {
        id: '2',
        title: 'Level Up Your City',
        description: 'Turn your city exploration into an RPG. Earn XP, unlock achievements, and dominate the leaderboard.',
        icon: Trophy,
        image: require('@/assets/images/onboarding/challengeComplete.png'),
    },
    {
        id: '3',
        title: 'Battle Your Squad',
        description: 'Create a team, challenge your friends, and compete in real-time challenges for glory.',
        icon: Swords,
        image: require('@/assets/images/onboarding/trophy.png'),
    },
    {
        id: '4',
        title: 'The Pub Golf Legend',
        description: 'Experience the ultimate Pub Golf mode. Track scores, hit pars, and become the legend of the night.',
        icon: Beer,
        image: require('@/assets/images/onboarding/pubgolf.png'),
    },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function OnboardingScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const isLastSlide = currentIndex === slides.length - 1;

    // Direct style object to avoid re-render conflicts with Reanimated 2/3 style of hooks for simple layout changes
    const buttonStyle = {
        width: (isLastSlide ? '100%' : '30%') as any,
        borderRadius: isLastSlide ? 12 : 30,
        backgroundColor: theme.primary,
    };

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await completeOnboarding();
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/auth/login');
        } catch (error) {
            console.error('Failed to save onboarding status', error);
            router.replace('/auth/login');
        }
    };

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={({ item, index }) => <OnboardingItem item={item} index={index} />}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                keyExtractor={(item) => item.id}
                scrollEventThrottle={32}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: currentIndex === index ? theme.primary : theme.borderPrimary,
                                    width: currentIndex === index ? 24 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    {!isLastSlide && (
                        <Animated.View exiting={FadeOut} entering={FadeIn}>
                            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                                <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    <AnimatedTouchableOpacity
                        onPress={handleNext}
                        style={[styles.animatedButton, buttonStyle]}
                        layout={Layout.springify()}
                    >
                        <Animated.Text
                            key={isLastSlide ? "start" : "next"}
                            entering={FadeIn.duration(300)}
                            exiting={FadeOut.duration(300)}
                            style={[styles.buttonText, { color: theme.primaryText }]} // Text on primary button usually contrast
                            numberOfLines={1}
                        >
                            {isLastSlide ? "Start Playing" : "Next"}
                        </Animated.Text>
                    </AnimatedTouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    footer: {
        padding: 40,
        paddingBottom: 60,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        height: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    animatedButton: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        position: 'absolute',
    },
});
