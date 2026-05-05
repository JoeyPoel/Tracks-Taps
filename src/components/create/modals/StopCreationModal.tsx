import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useStopForm } from '@/src/hooks/create/useStopForm';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PubGolfSection } from './components/PubGolfSection';
import { StopForm } from './components/StopForm';
import { StopMapPicker } from './components/StopMapPicker';

interface StopCreationModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (stop: any) => void;
    modes: string[];
    existingStops?: any[];
    initialData?: any;
    editingIndex?: number | null;
}

export default function StopCreationModal({
    visible,
    onClose,
    onSave,
    modes = [],
    existingStops = [],
    initialData,
    editingIndex = null
}: StopCreationModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const { formState, region, setRegion, isPubGolfEnabled, updateField, handleSave } = useStopForm(onSave, visible, modes, existingStops, initialData);
    const { name, description, detailedDescription, imageUrl, type, isPubGolfStop, drink, par, marker } = formState;

    const [isSearching, setIsSearching] = useState(false);
    const formOpacity = React.useRef(new Animated.Value(1)).current;

    const handleSearchStateChange = (active: boolean) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSearching(active);
        
        Animated.timing(formOpacity, {
            toValue: active ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // Reset searching state when modal is closed
    React.useEffect(() => {
        if (!visible) {
            setIsSearching(false);
            formOpacity.setValue(1);
        }
    }, [visible]);

    const handleClose = () => {
        if (isSearching) {
            handleSearchStateChange(false);
        } else {
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>

                {/* Header */}
                <View style={styles.header} pointerEvents="box-none">
                    <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: theme.bgTertiary }]}>
                        <Ionicons name={isSearching ? "arrow-back" : "close"} size={20} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>

                <StopMapPicker
                    region={region}
                    setRegion={setRegion}
                    marker={marker}
                    setMarker={(val) => {
                        updateField('marker', val);
                        // If we set a marker from search, we might want to pre-fill the name (this logic is usually in useStopForm but we ensure layout restores)
                        handleSearchStateChange(false);
                    }}
                    existingStops={existingStops}
                    currentStopType={type}
                    editingIndex={editingIndex}
                    onSearchActiveChange={handleSearchStateChange}
                    isExpanded={isSearching}
                />

                <Animated.View 
                    style={{ flex: 1, opacity: formOpacity }} 
                    pointerEvents={isSearching ? 'none' : 'auto'}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.formContent}>
                            <StopForm
                                name={name} setName={(val) => updateField('name', val)}
                                description={description} setDescription={(val) => updateField('description', val)}
                                detailedDescription={detailedDescription} setDetailedDescription={(val) => updateField('detailedDescription', val)}
                                imageUrl={imageUrl} setImageUrl={(val) => updateField('imageUrl', val)}
                                type={type} setType={(val) => updateField('type', val)}
                            />

                            <PubGolfSection
                                isPubGolfEnabled={isPubGolfEnabled}
                                isPubGolfStop={isPubGolfStop} setIsPubGolfStop={(val) => updateField('isPubGolfStop', val)}
                                drink={drink} setDrink={(val) => updateField('drink', val)}
                                par={par} setPar={(val) => updateField('par', val)}
                            />
                        </ScrollView>
                    </KeyboardAvoidingView>

                    <View style={[styles.footer, { backgroundColor: theme.bgPrimary }]}>
                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: theme.primary }
                            ]}
                            onPress={handleSave}
                        >
                            <TextComponent style={styles.saveButtonText} color="white" bold variant="h3">
                                {t('confirmLocation')}
                            </TextComponent>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 20 : 16,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 10,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    formContent: {
        padding: 24,
        gap: 16,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    saveButton: {
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});
