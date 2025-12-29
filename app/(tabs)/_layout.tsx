import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import {
    MagnifyingGlassIcon as MagnifyingGlassOutline,
    MapIcon as MapOutline,
    PlusCircleIcon as PlusCircleOutline,
    UserGroupIcon as UserGroupOutline,
    UserIcon as UserOutline,
} from 'react-native-heroicons/outline';
import {
    MagnifyingGlassIcon as MagnifyingGlassSolid,
    MapIcon as MapSolid,
    PlusCircleIcon as PlusCircleSolid,
    UserGroupIcon as UserGroupSolid,
    UserIcon as UserSolid,
} from 'react-native-heroicons/solid';

import { TabBar } from '@/src/components/navigation/TabBar';

export default function TabLayout() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: t('explore'),
                    tabBarLabel: t('explore'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused
                            ? <MagnifyingGlassSolid size={size} color={color} />
                            : <MagnifyingGlassOutline size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="join"
                options={{
                    title: t('join'),
                    tabBarLabel: t('join'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused
                            ? <UserGroupSolid size={size} color={color} />
                            : <UserGroupOutline size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: t('create'),
                    tabBarLabel: t('create'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused
                            ? <PlusCircleSolid size={size} color={color} />
                            : <PlusCircleOutline size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: t('map'),
                    tabBarLabel: t('map'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused
                            ? <MapSolid size={size} color={color} />
                            : <MapOutline size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile'),
                    tabBarLabel: t('profile'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused
                            ? <UserSolid size={size} color={color} />
                            : <UserOutline size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen name="team-setup" options={{ href: null }} />
            <Tabs.Screen name="lobby" options={{ href: null }} />
            <Tabs.Screen name="tour/[id]" options={{ href: null }} />
            <Tabs.Screen name="active-tour/[id]" options={{ href: null }} />

            <Tabs.Screen name="tour-waiting-lobby/[id]" options={{ href: null }} />
            <Tabs.Screen name="tour-completed/[id]" options={{ href: null }} />
            <Tabs.Screen name="profile/personal-info" options={{ href: null }} />
            <Tabs.Screen name="profile/preferences" options={{ href: null }} />
            <Tabs.Screen name="profile/achievements" options={{ href: null }} />
            <Tabs.Screen name="profile/saved-trips/index" options={{ href: null }} />
            <Tabs.Screen name="profile/saved-trips/[id]" options={{ href: null }} />
            <Tabs.Screen name="profile/friends" options={{ href: null }} />
            <Tabs.Screen name="profile/friend-profile" options={{ href: null }} />
            <Tabs.Screen name="profile/tours-done" options={{ href: null }} />
            <Tabs.Screen name="profile/tours-created" options={{ href: null }} />

        </Tabs>
    );
}
