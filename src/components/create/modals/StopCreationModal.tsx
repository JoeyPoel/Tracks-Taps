import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useStopForm } from '@/src/hooks/create/useStopForm';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PubGolfSection } from './components/PubGolfSection';
import { StopForm } from './components/StopForm';
import { StopMapPicker } from './components/StopMapPicker';

interface StopCreationModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (stop: any) => void;
    modes: string[];
    existingStops?: any[];
}

export default function StopCreationModal({ visible, onClose, onSave, modes = [], existingStops = [] }: StopCreationModalProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const { formState, region, setRegion, isPubGolfEnabled, updateField, handleSave } = useStopForm(onSave, visible, modes, existingStops);
    const { name, description, detailedDescription, imageUrl, type, isPubGolfStop, drink, par, marker } = formState;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, {backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}>{t('addStop')}</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.bgTertiary }]}>
                        <Ionicons name="close" size={20} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>

                <StopMapPicker
                    region={region}
                    setRegion={setRegion}
                    marker={marker}
                    setMarker={(val) => updateField('marker', val)}
                    existingStops={existingStops}
                    currentStopType={type}
                />

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
                            { backgroundColor: marker ? theme.primary : theme.bgTertiary }
                        ]}
                        onPress={handleSave}
                        disabled={!marker}
                    >
                        <Text style={[
                            styles.saveButtonText,
                            { color: marker ? 'white' : theme.textTertiary }
                        ]}>{t('confirmLocation')}</Text>
                    </TouchableOpacity>
                </View>

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
        justifyContent: 'space-between',
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
