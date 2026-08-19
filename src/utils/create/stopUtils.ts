
import { StopFormState } from '@/src/hooks/create/useStopForm';

export const validateStop = (
    state: StopFormState,
    isPubGolfEnabled: boolean,
    t: (key: string) => string
) => {
    const { name, isPubGolfStop, drink, par, marker } = state;

    if (!name || !marker) {
        return {
            valid: false,
            message: "Please select a location on the map and enter a name.",
            title: t('missingInfo')
        };
    }

    if (isPubGolfEnabled && isPubGolfStop && (!drink || !par)) {
        return {
            valid: false,
            message: "Please enter the drink and par for this Pub Golf stop.",
            title: t('missingInfo')
        };
    }

    if (state.requiresTicket) {
        const hasEmptyPrice = state.ticketPriceOptions?.some((opt: any) => !opt.price || !opt.price.trim());
        if (hasEmptyPrice) {
            return {
                valid: false,
                message: "Please enter a price for all ticket options or remove them.",
                title: t('missingInfo' as any) || 'Missing Info'
            };
        }
    }

    return { valid: true };
};

export const createStopPayload = (
    state: StopFormState,
    isPubGolfEnabled: boolean
) => {
    const {
        name, description, detailedDescription, imageUrl, type, isPubGolfStop, drink, par, marker,
        requiresTicket, isFreeEntry, ticketInfo, ticketPriceOptions, requiresReservation,
        openingHoursType, hoursOpen, hoursClose, hoursWeekdaysOpen, hoursWeekdaysClose, hoursWeekendsOpen, hoursWeekendsClose
    } = state;

    if (!marker) throw new Error("Marker is required to create a stop payload");

    // Compile openingHours string from structured fields
    let compiledOpeningHours: string | null = null;
    if (openingHoursType === '24h') {
        compiledOpeningHours = "Open 24 hours";
    } else if (openingHoursType === 'same_everyday') {
        if (hoursOpen && hoursClose) {
            compiledOpeningHours = `Daily: ${hoursOpen}–${hoursClose}`;
        }
    } else if (openingHoursType === 'weekdays_same') {
        const weekdaysText = state.hoursWeekdaysClosed ? 'Closed' : `${hoursWeekdaysOpen}–${hoursWeekdaysClose}`;
        const weekendsText = state.hoursWeekendsClosed ? 'Closed' : `${hoursWeekendsOpen}–${hoursWeekendsClose}`;
        compiledOpeningHours = `Mon–Fri: ${weekdaysText}, Sat–Sun: ${weekendsText}`;
    } else if (openingHoursType === 'custom') {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const customParts = shortDays.map((day, idx) => {
            const dayName = days[idx];
            const closed = state[`custom${dayName}Closed` as keyof StopFormState];
            if (closed) return `${day}: Closed`;
            const open = state[`custom${dayName}Open` as keyof StopFormState];
            const close = state[`custom${dayName}Close` as keyof StopFormState];
            return `${day}: ${open}-${close}`;
        });
        compiledOpeningHours = customParts.join(', ');
    }

    return {
        name,
        description,
        detailedDescription,
        imageUrl,
        type,
        latitude: marker.latitude,
        longitude: marker.longitude,
        challenges: [],
        pubgolfDrink: (isPubGolfEnabled && isPubGolfStop) ? drink : null,
        pubgolfPar: (isPubGolfEnabled && isPubGolfStop) ? parseInt(par) : null,
        requiresTicket: requiresTicket || null,
        isFreeEntry: isFreeEntry || null,
        ticketInfo: requiresTicket ? (ticketInfo || null) : null,
        ticketPrice: (requiresTicket && ticketPriceOptions && ticketPriceOptions.length > 0) ? JSON.stringify(ticketPriceOptions) : null,
        requiresReservation: requiresTicket ? (requiresReservation || null) : null,
        openingHours: compiledOpeningHours,
    };
};
