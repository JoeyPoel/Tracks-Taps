
import { useLanguage } from '@/src/context/LanguageContext';
import { StopType } from '@/src/types/models';
import { createStopPayload, validateStop } from '@/src/utils/create/stopUtils';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useStopLocation } from './useStopLocation';

export interface StopFormState {
    name: string;
    description: string;
    detailedDescription: string;
    imageUrl: string;
    type: StopType;
    isPubGolfStop: boolean;
    drink: string;
    par: string;
    marker: { latitude: number; longitude: number } | null;
    requiresTicket: boolean;
    isFreeEntry: boolean;
    ticketInfo: string;
    openingHours: string;
    ticketPrice: string;
    ticketPriceOptions: { category: string; price: string }[];
    requiresReservation: string;
    openingHoursType: string;
    hoursOpen: string;
    hoursClose: string;
    hoursWeekdaysOpen: string;
    hoursWeekdaysClose: string;
    hoursWeekendsOpen: string;
    hoursWeekendsClose: string;
    customMondayOpen: string; customMondayClose: string; customMondayClosed: boolean;
    customTuesdayOpen: string; customTuesdayClose: string; customTuesdayClosed: boolean;
    customWednesdayOpen: string; customWednesdayClose: string; customWednesdayClosed: boolean;
    customThursdayOpen: string; customThursdayClose: string; customThursdayClosed: boolean;
    customFridayOpen: string; customFridayClose: string; customFridayClosed: boolean;
    customSaturdayOpen: string; customSaturdayClose: string; customSaturdayClosed: boolean;
    customSundayOpen: string; customSundayClose: string; customSundayClosed: boolean;
}

function parseOpeningHours(str: string) {
    const defaults = {
        openingHoursType: '24h', // default to 24h/public space
        hoursOpen: '09:00',
        hoursClose: '17:00',
        hoursWeekdaysOpen: '09:00',
        hoursWeekdaysClose: '17:00',
        hoursWeekendsOpen: '10:00',
        hoursWeekendsClose: '16:00',
        customMondayOpen: '09:00', customMondayClose: '17:00', customMondayClosed: false,
        customTuesdayOpen: '09:00', customTuesdayClose: '17:00', customTuesdayClosed: false,
        customWednesdayOpen: '09:00', customWednesdayClose: '17:00', customWednesdayClosed: false,
        customThursdayOpen: '09:00', customThursdayClose: '17:00', customThursdayClosed: false,
        customFridayOpen: '09:00', customFridayClose: '17:00', customFridayClosed: false,
        customSaturdayOpen: '10:00', customSaturdayClose: '16:00', customSaturdayClosed: false,
        customSundayOpen: '10:00', customSundayClose: '16:00', customSundayClosed: false,
    };

    if (!str) return defaults;
    if (str.toLowerCase().includes('24 hours') || str.toLowerCase().includes('24h')) {
        return { ...defaults, openingHoursType: '24h' };
    }
    
    if (str.startsWith('Daily:')) {
        const match = str.match(/Daily:\s*([0-9]{2}:[0-9]{2})[–-]([0-9]{2}:[0-9]{2})/);
        if (match) {
            return {
                ...defaults,
                openingHoursType: 'same_everyday',
                hoursOpen: match[1],
                hoursClose: match[2]
            };
        }
    }
    
    if (str.includes('Mon') && str.includes('Sat')) {
        const match = str.match(/Mon[–-](?:Fri|Vri):\s*([0-9]{2}:[0-9]{2})[–-]([0-9]{2}:[0-9]{2}),?\s*Sat[–-](?:Sun|Zon):\s*([0-9]{2}:[0-9]{2})[–-]([0-9]{2}:[0-9]{2})/i);
        if (match) {
            return {
                ...defaults,
                openingHoursType: 'weekdays_same',
                hoursWeekdaysOpen: match[1],
                hoursWeekdaysClose: match[2],
                hoursWeekendsOpen: match[3],
                hoursWeekendsClose: match[4]
            };
        }
    }
    
    const res = { ...defaults, openingHoursType: 'custom' };
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    shortDays.forEach((day, idx) => {
        const reg = new RegExp(`${day}:\\s*([0-9]{2}:[0-9]{2})[–-]([0-9]{2}:[0-9]{2})|${day}:\\s*Closed`, 'i');
        const m = str.match(reg);
        const dayKey = days[idx];
        if (m) {
            if (m[0].toLowerCase().includes('closed')) {
                res[`custom${dayKey}Closed` as 'customMondayClosed'] = true;
            } else {
                res[`custom${dayKey}Open` as 'customMondayOpen'] = m[1];
                res[`custom${dayKey}Close` as 'customMondayClose'] = m[2];
                res[`custom${dayKey}Closed` as 'customMondayClosed'] = false;
            }
        }
    });
    
    return res;
}

export function useStopForm(
    onSave: (stop: any) => void,
    visible: boolean,
    modes: string[],
    existingStops: any[],
    initialData?: any
) {
    const { t } = useLanguage();
    const isPubGolfEnabled = modes.includes('PUBGOLF');

    // Location Hook
    const { region, setRegion } = useStopLocation(visible, existingStops, initialData);

    const [formState, setFormState] = useState<StopFormState>({
        name: '',
        description: '',
        detailedDescription: '',
        imageUrl: '',
        type: StopType.Viewpoint,
        isPubGolfStop: false,
        drink: '',
        par: '3',
        marker: null,
        requiresTicket: false,
        isFreeEntry: false,
        ticketInfo: '',
        openingHours: '',
        ticketPrice: '',
        ticketPriceOptions: [{ category: 'General', price: '' }],
        requiresReservation: 'NO',
        openingHoursType: '24h',
        hoursOpen: '09:00',
        hoursClose: '17:00',
        hoursWeekdaysOpen: '09:00',
        hoursWeekdaysClose: '17:00',
        hoursWeekendsOpen: '10:00',
        hoursWeekendsClose: '16:00',
        customMondayOpen: '09:00', customMondayClose: '17:00', customMondayClosed: false,
        customTuesdayOpen: '09:00', customTuesdayClose: '17:00', customTuesdayClosed: false,
        customWednesdayOpen: '09:00', customWednesdayClose: '17:00', customWednesdayClosed: false,
        customThursdayOpen: '09:00', customThursdayClose: '17:00', customThursdayClosed: false,
        customFridayOpen: '09:00', customFridayClose: '17:00', customFridayClosed: false,
        customSaturdayOpen: '10:00', customSaturdayClose: '16:00', customSaturdayClosed: false,
        customSundayOpen: '10:00', customSundayClose: '16:00', customSundayClosed: false,
    });

    // Initialize form when visible or initialData changes
    useEffect(() => {
        if (visible) {
            if (initialData) {
                const parsedHours = parseOpeningHours(initialData.openingHours);
                setFormState({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    detailedDescription: initialData.detailedDescription || '',
                    imageUrl: initialData.imageUrl || '',
                    type: initialData.type || StopType.Viewpoint,
                    isPubGolfStop: !!initialData.pubgolfDrink,
                    drink: initialData.pubgolfDrink || '',
                    par: initialData.pubgolfPar ? String(initialData.pubgolfPar) : '3',
                    marker: {
                        latitude: initialData.latitude,
                        longitude: initialData.longitude
                    },
                    requiresTicket: !!initialData.requiresTicket,
                    isFreeEntry: !!initialData.isFreeEntry,
                    ticketInfo: initialData.ticketInfo || '',
                    openingHours: initialData.openingHours || '',
                    ticketPrice: initialData.ticketPrice || '',
                    ticketPriceOptions: (() => {
                        try {
                            if (initialData.ticketPrice && initialData.ticketPrice.startsWith('[')) {
                                return JSON.parse(initialData.ticketPrice);
                            }
                        } catch (e) {}
                        return [{ category: 'General', price: initialData.ticketPrice || '' }];
                    })(),
                    requiresReservation: initialData.requiresReservation || 'NO',
                    ...parsedHours
                });
            } else {
                // Reset to defaults for new stop
                setFormState({
                    name: '',
                    description: '',
                    detailedDescription: '',
                    imageUrl: '',
                    type: StopType.Viewpoint,
                    isPubGolfStop: false,
                    drink: '',
                    par: '3',
                    marker: null,
                    requiresTicket: false,
                    isFreeEntry: false,
                    ticketInfo: '',
                    openingHours: '',
                    ticketPrice: '',
                    ticketPriceOptions: [{ category: 'General', price: '' }],
                    requiresReservation: 'NO',
                    openingHoursType: '24h',
                    hoursOpen: '09:00',
                    hoursClose: '17:00',
                    hoursWeekdaysOpen: '09:00',
                    hoursWeekdaysClose: '17:00',
                    hoursWeekendsOpen: '10:00',
                    hoursWeekendsClose: '16:00',
                    customMondayOpen: '09:00', customMondayClose: '17:00', customMondayClosed: false,
                    customTuesdayOpen: '09:00', customTuesdayClose: '17:00', customTuesdayClosed: false,
                    customWednesdayOpen: '09:00', customWednesdayClose: '17:00', customWednesdayClosed: false,
                    customThursdayOpen: '09:00', customThursdayClose: '17:00', customThursdayClosed: false,
                    customFridayOpen: '09:00', customFridayClose: '17:00', customFridayClosed: false,
                    customSaturdayOpen: '10:00', customSaturdayClose: '16:00', customSaturdayClosed: false,
                    customSundayOpen: '10:00', customSundayClose: '16:00', customSundayClosed: false,
                });
            }
        }
    }, [visible, initialData]);

    const updateField = <K extends keyof StopFormState>(key: K, value: StopFormState[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormState(prev => ({
            ...prev,
            name: '',
            description: '',
            detailedDescription: '',
            imageUrl: '',
            type: StopType.Viewpoint,
            isPubGolfStop: false,
            drink: '',
            par: '3',
            marker: null,
            requiresTicket: false,
            isFreeEntry: false,
            ticketInfo: '',
            openingHours: '',
            ticketPrice: '',
            ticketPriceOptions: [{ category: 'General', price: '' }],
            requiresReservation: 'NO',
            openingHoursType: '24h',
            hoursOpen: '09:00',
            hoursClose: '17:00',
            hoursWeekdaysOpen: '09:00',
            hoursWeekdaysClose: '17:00',
            hoursWeekendsOpen: '10:00',
            hoursWeekendsClose: '16:00',
            customMondayOpen: '09:00', customMondayClose: '17:00', customMondayClosed: false,
            customTuesdayOpen: '09:00', customTuesdayClose: '17:00', customTuesdayClosed: false,
            customWednesdayOpen: '09:00', customWednesdayClose: '17:00', customWednesdayClosed: false,
            customThursdayOpen: '09:00', customThursdayClose: '17:00', customThursdayClosed: false,
            customFridayOpen: '09:00', customFridayClose: '17:00', customFridayClosed: false,
            customSaturdayOpen: '10:00', customSaturdayClose: '16:00', customSaturdayClosed: false,
            customSundayOpen: '10:00', customSundayClose: '16:00', customSundayClosed: false,
        }));
    };

    const handleSave = () => {
        const validation = validateStop(formState, isPubGolfEnabled, t as any);
        if (!validation.valid && validation.message && validation.title) {
            Alert.alert(validation.title, validation.message);
            return;
        }

        const payload = createStopPayload(formState, isPubGolfEnabled);

        // Preserve ID and other fields if editing
        if (initialData) {
            onSave({
                ...initialData,
                ...payload,
                // Make sure we keep the challenges
                challenges: initialData.challenges
            });
        } else {
            onSave(payload);
        }

        resetForm();
    };

    return {
        formState,
        region,
        setRegion,
        isPubGolfEnabled,
        updateField,
        handleSave,
        resetForm
    };
}
