import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppModal } from './AppModal';
import { AnimatedPressable } from './AnimatedPressable';
import { TextComponent } from './TextComponent';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation, SUPPORTED_TRANSLATION_LANGUAGES } from '../../context/TranslationContext';

interface LanguagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    showManagePreferencesHint?: boolean;
}

export const LanguagePickerModal = ({ visible, onClose, showManagePreferencesHint = true }: LanguagePickerModalProps) => {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { targetLanguage, setTargetLanguage } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLanguages = SUPPORTED_TRANSLATION_LANGUAGES.filter(lang => 
        lang.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppModal
            visible={visible}
            onClose={() => {
                onClose();
                setSearchQuery('');
            }}
            title={t('translateTo') || 'Translate To'}
            height="80%"
        >
            <View style={{ flex: 1 }}>
                {showManagePreferencesHint && (
                    <View style={[styles.hintContainer, { backgroundColor: theme.primary + '10' }]}>
                        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                        <TextComponent variant="caption" color={theme.textSecondary} style={styles.hintText}>
                            {t('managePreferencesHint')}
                        </TextComponent>
                    </View>
                )}

                <View style={[styles.searchContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderSecondary }]}>
                    <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.textPrimary }]}
                        placeholder={t('searchLanguagePlaceholder')}
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </Pressable>
                    )}
                </View>

                <FlatList
                    data={filteredLanguages}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => {
                        const isActive = (targetLanguage || language) === item.code;
                        return (
                            <AnimatedPressable
                                onPress={() => {
                                    setTargetLanguage(item.code);
                                    onClose();
                                    setSearchQuery('');
                                }}
                                style={[
                                    styles.modalLanguageItem,
                                    { 
                                        backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                        borderBottomColor: theme.borderSecondary 
                                    }
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                                    <TextComponent style={{ fontSize: 24, marginRight: 16 }}>{item.flag}</TextComponent>
                                    <TextComponent 
                                        color={isActive ? theme.primary : theme.textPrimary} 
                                        bold={isActive} 
                                        variant="body"
                                        numberOfLines={1}
                                    >
                                        {item.label}
                                    </TextComponent>
                                </View>
                                {isActive && <Ionicons name="checkmark-circle" size={20} color={theme.primary} />}
                            </AnimatedPressable>
                        );
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </AppModal>
    );
};

const styles = StyleSheet.create({
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        marginHorizontal: 4,
    },
    hintText: {
        marginLeft: 8,
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    modalLanguageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderRadius: 12,
        marginBottom: 4,
    },
});
