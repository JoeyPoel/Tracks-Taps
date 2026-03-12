
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { FormInput } from './FormInput';
import { TextComponent } from './TextComponent';

interface CitySuggestion {
    name: string;
    fullName: string;
}

interface CityPickerProps {
    label: string;
    value: string;
    onSelect: (cityName: string) => void;
    placeholder?: string;
}

export function CityPicker({ label, value, onSelect, placeholder }: CityPickerProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
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
            // Using Teleport API for city autocomplete
            const response = await axios.get(
                `https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}`
            );
            
            const results = response.data?._embedded?.['city:search-results'] || [];
            const mappedResults = results.map((item: any) => ({
                name: item.matching_full_name.split(',')[0],
                fullName: item.matching_full_name
            }));
            
            setSuggestions(mappedResults);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                searchCities(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchCities]);

    const handleSelect = (city: CitySuggestion) => {
        onSelect(city.name);
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
                    placeholder={placeholder || (t as any)('selectCity')}
                    editable={false}
                    pointerEvents="none"
                    rightIcon={<Ionicons name="chevron-down" size={20} color={theme.textSecondary} />}
                />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.bgPrimary }]}>
                        <View style={styles.modalHeader}>
                            <TextComponent bold variant="h3" color={theme.textPrimary}>
                                {(t as any)('selectCity')}
                            </TextComponent>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <FormInput
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder={(t as any)('searchCityPlaceholder') || "Search for a city..."}
                                autoFocus
                                leftIcon={<Ionicons name="search" size={20} color={theme.textSecondary} />}
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                        ) : (
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item, index) => `${item.fullName}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={[styles.suggestionItem, { borderBottomColor: theme.borderPrimary }]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Ionicons name="location-outline" size={18} color={theme.primary} style={styles.itemIcon} />
                                        <View>
                                            <TextComponent bold variant="body" color={theme.textPrimary}>
                                                {item.name}
                                            </TextComponent>
                                            <TextComponent variant="caption" color={theme.textSecondary}>
                                                {item.fullName}
                                            </TextComponent>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    searchQuery.length > 2 ? (
                                        <View style={styles.emptyContainer}>
                                            <TextComponent color={theme.textSecondary}>
                                                {(t as any)('noCitiesFound') || "No cities found"}
                                            </TextComponent>
                                        </View>
                                    ) : null
                                }
                                contentContainerStyle={styles.listContent}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
