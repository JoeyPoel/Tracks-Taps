import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AppModal } from './AppModal';
import { FormInput } from './FormInput';
import { TextComponent } from './TextComponent';

interface CitySuggestion {
    name: string;
    fullName: string;
    isManual?: boolean;
    isClear?: boolean;
}

interface CityPickerProps {
    label: string;
    value: string;
    onSelect: (cityName: string) => void;
    placeholder?: string;
}

export function CityPicker({ label, value, onSelect, placeholder }: CityPickerProps) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const searchCities = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Hardcoded to always use English for the city search results
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village&limit=20&lang=en`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Photon returns GeoJSON: { type: 'FeatureCollection', features: [...] }
            const features = data?.features || [];
            
            const mappedResults = features
                .map((feature: any) => {
                    const props = feature.properties;
                    if (!props) return null;
                    
                    const name = props.name;
                    const city = props.city || props.name;
                    const state = props.state;
                    const country = props.country;
                    
                    // Build a nice subtitle (just state, no country)
                    const parts = [];
                    if (state && state !== city) parts.push(state);
                    
                    return {
                        name: city,
                        fullName: parts.length > 0 ? parts.join(', ') : ''
                    };
                })
                .filter((item: any) => item !== null);
            
            // De-duplicate results by fullName
            const uniqueResults = Array.from(new Set(mappedResults.map((r: any) => r.fullName)))
                .map(fullName => mappedResults.find((r: any) => r.fullName === fullName));
            
            setSuggestions(uniqueResults as CitySuggestion[]);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                searchCities(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchCities]);

    const handleSelect = (city: CitySuggestion) => {
        if (city.isClear) {
            onSelect('');
        } else {
            const displayValue = (!city.isManual && city.fullName) 
                ? `${city.name}, ${city.fullName}` 
                : city.name;
            onSelect(displayValue);
        }
        setModalVisible(false);
        setSearchQuery('');
        setSuggestions([]);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <FormInput
                    label={label}
                    value={value}
                    onChange={() => {}} 
                    placeholder={placeholder || t('selectCity')}
                    editable={false}
                    pointerEvents="none"
                    rightIcon={<Ionicons name="chevron-down" size={20} color={theme.textSecondary} />}
                />
            </TouchableOpacity>

            <AppModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={t('selectCity')}
                height="80%"
            >

                        <View style={styles.searchContainer}>
                            <FormInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder={t('searchCityPlaceholder')}
                                autoFocus
                                leftIcon={<Ionicons name="search" size={20} color={theme.textSecondary} />}
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                        ) : (
                            <FlatList
                                data={searchQuery.length > 0 ? [
                                    { 
                                        name: searchQuery, 
                                        fullName: '', 
                                        isManual: true 
                                    }, 
                                    ...suggestions
                                ] : [
                                    ...(value ? [{ name: t('clearSelection'), fullName: '', isClear: true }] : []),
                                    ...suggestions
                                ]}
                                keyExtractor={(item, index) => `${item.isManual ? 'manual' : item.fullName}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={[styles.suggestionItem, { borderBottomColor: theme.borderPrimary }]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Ionicons 
                                            name={item.isClear ? "trash-outline" : item.isManual ? "create-outline" : "location-outline"} 
                                            size={18} 
                                            color={item.isClear ? theme.error : item.isManual ? theme.textSecondary : theme.primary} 
                                            style={styles.itemIcon} 
                                        />
                                        <View>
                                            <TextComponent bold variant="body" color={theme.textPrimary}>
                                                {item.name}
                                            </TextComponent>
                                            {!item.isManual && item.fullName ? (
                                                <TextComponent variant="caption" color={theme.textSecondary}>
                                                    {item.fullName}
                                                </TextComponent>
                                            ) : null}
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    searchQuery.length > 2 ? (
                                        <View style={styles.emptyContainer}>
                                            <TextComponent color={theme.textSecondary}>
                                                {t('noCitiesFound')}
                                            </TextComponent>
                                        </View>
                                    ) : null
                                }
                                contentContainerStyle={styles.listContent}
                            />
                        )}
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    searchContainer: {
        marginBottom: 16,
    },
    loader: {
        marginTop: 40,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemIcon: {
        marginRight: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    listContent: {
        paddingBottom: 40,
    },
});
