import { lightTheme, darkTheme } from '../context/theme';

export interface ThemeConfig {
    id: string;
    name: string;
    description: string;
    isHoliday: boolean;
    country?: string;
    specialDate?: { month: number; day: number }; // 1-indexed (e.g. Christmas is month 12, day 25)
    light: Partial<typeof lightTheme>;
    dark: Partial<typeof darkTheme>;
    translations?: Record<string, { name: string; description: string }>;
}

// 18 Holiday / Special Day Themes
export const HOLIDAY_THEMES: Record<string, ThemeConfig> = {
    kings_day: {
        id: 'kings_day',
        name: "King's Day (NL)",
        description: "Celebrating with nationwide flea markets, canal parties, and orange-colored festivities on April 27th",
        isHoliday: true,
        country: 'NL',
        specialDate: { month: 4, day: 27 },
        translations: {
            nl: {
                name: "Koningsdag (NL)",
                description: "Vieren met landelijke vrijmarkten, grachtenfeestjes en oranje festiviteiten op 27 april"
            },
            es: {
                name: "Día del Rey (NL)",
                description: "Celebración con mercadillos en todo el país, fiestas en los canales y festividades naranjas el 27 de abril"
            },
            fr: {
                name: "Fête du Roi (NL)",
                description: "Célébration avec des vide-greniers nationaux, des fêtes sur les canaux et des festivités orange le 27 avril"
            },
            de: {
                name: "Königstag (NL)",
                description: "Feiern mit landesweiten Flohmärkten, Kanalpartys und orangefarbenen Festen am 27. April"
            },
            pl: {
                name: "Dzień Króla (NL)",
                description: "Świętowanie z ogólnokrajowymi pchlimi targami, imprezami na kanałach i pomarańczowymi festiwalami 27 kwietnia"
            }
        },
        light: {
            primary: '#FF8C00', // Orange
            primaryHover: '#E07B00',
            secondary: '#003399', // Royal Blue
            secondaryHover: '#002266',
            bgPrimary: '#FFF5EB',
            fixedGradientFrom: '#FF8C00',
            fixedGradientTo: '#003399',
            starColor: '#FF8C00',
        },
        dark: {
            primary: '#FF9F33',
            primaryHover: '#FFB866',
            secondary: '#3366CC',
            secondaryHover: '#668FDB',
            bgPrimary: '#1F1205',
            bgSecondary: '#2E1D0C',
            fixedGradientFrom: '#FF9F33',
            fixedGradientTo: '#3366CC',
            starColor: '#FF9F33',
        }
    },
    liberation_day: {
        id: 'liberation_day',
        name: "Liberation Day (NL)",
        description: "Marking the end of World War II in the Netherlands and celebrating freedom on May 5th",
        isHoliday: true,
        country: 'NL',
        specialDate: { month: 5, day: 5 },
        light: {
            primary: '#00BFFF', // Freedom Cyan
            primaryHover: '#009ACD',
            secondary: '#DC143C', // Crimson Red
            secondaryHover: '#B22234',
            bgPrimary: '#F0FFFF',
            fixedGradientFrom: '#00BFFF',
            fixedGradientTo: '#DC143C',
        },
        dark: {
            primary: '#00BFFF',
            primaryHover: '#33CCFF',
            secondary: '#FF4D6D',
            secondaryHover: '#FF8093',
            bgPrimary: '#05181F',
            bgSecondary: '#092B38',
            fixedGradientFrom: '#00BFFF',
            fixedGradientTo: '#FF4D6D',
        }
    },
    sinterklaas: {
        id: 'sinterklaas',
        name: "Sinterklaas (NL)",
        description: "Celebrating the traditional feast with sweet treats, poems, and gift-giving on December 5th",
        isHoliday: true,
        country: 'NL',
        specialDate: { month: 12, day: 5 },
        translations: {
            nl: {
                name: "Sinterklaas (NL)",
                description: "Het traditionele feest vieren met zoetigheden, gedichten en cadeautjes op 5 december"
            },
            es: {
                name: "Sinterklaas (NL)",
                description: "Celebración de la fiesta tradicional con dulces, poemas y regalos el 5 de diciembre"
            },
            fr: {
                name: "Saint-Nicolas (NL)",
                description: "Célébration de la fête traditionnelle avec des friandises, des poèmes et des cadeaux le 5 décembre"
            },
            de: {
                name: "Sinterklaas (NL)",
                description: "Feiern des traditionellen Festes mit Süßigkeiten, Gedichten und Geschenken am 5. Dezember"
            },
            pl: {
                name: "Mikołajki (NL)",
                description: "Świętowanie tradycyjnego festiwalu ze słodkimi smakołykami, wierszami i prezentami 5 grudnia"
            }
        },
        light: {
            primary: '#8B4513', // Chocolate Brown
            primaryHover: '#5C2D0C',
            secondary: '#FFD700', // Gold
            secondaryHover: '#E6C200',
            bgPrimary: '#FAF0E6',
            fixedGradientFrom: '#8B4513',
            fixedGradientTo: '#FFD700',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#CD853F',
            primaryHover: '#DB9B5E',
            secondary: '#FFD700',
            secondaryHover: '#FFE066',
            bgPrimary: '#1C0E04',
            bgSecondary: '#29170A',
            fixedGradientFrom: '#CD853F',
            fixedGradientTo: '#FFD700',
            starColor: '#FFD700',
        }
    },
    independence_day: {
        id: 'independence_day',
        name: "Independence Day (US)",
        description: "Commemorating the historic birth of the United States on July 4th with fireworks, parades, and barbecues",
        isHoliday: true,
        country: 'US',
        specialDate: { month: 7, day: 4 },
        translations: {
            nl: {
                name: "Onafhankelijkheidsdag (US)",
                description: "De historische geboorte van de Verenigde Staten herdenken op 4 juli met vuurwerk, parades en barbecues"
            },
            es: {
                name: "Día de la Independencia (US)",
                description: "Conmemoración del nacimiento histórico de los Estados Unidos el 4 de julio con fuegos artificiales, desfiles y barbacoas"
            },
            fr: {
                name: "Jour de l'Indépendance (US)",
                description: "Commémoration de la naissance historique des États-Unis le 4 juillet avec des feux d'artifice, des défilés et des barbecues"
            },
            de: {
                name: "Unabhängigkeitstag (US)",
                description: "Gedenken an die historische Geburt der Vereinigten Staaten am 4. Juli mit Feuerwerk, Paraden und Grillabenden"
            },
            pl: {
                name: "Dzień Niepodległości (US)",
                description: "Upamiętnienie historycznych narodzin Stanów Zjednoczonych 4 lipca przy pomocy fajerwerków, parad i grillowania"
            }
        },
        light: {
            primary: '#B22234', // US Flag Red
            primaryHover: '#8B1A27',
            secondary: '#002868', // US Flag Blue
            secondaryHover: '#001A44',
            bgPrimary: '#F4F7FC',
            fixedGradientFrom: '#002868',
            fixedGradientTo: '#B22234',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#E03C51',
            primaryHover: '#EB6576',
            secondary: '#2E6CC9',
            secondaryHover: '#5C90DB',
            bgPrimary: '#040E1F',
            bgSecondary: '#0B1C38',
            fixedGradientFrom: '#2E6CC9',
            fixedGradientTo: '#E03C51',
            starColor: '#FFD700',
        }
    },
    thanksgiving: {
        id: 'thanksgiving',
        name: "Thanksgiving (US)",
        description: "A North American tradition of giving thanks for the harvest and blessings of the past year",
        isHoliday: true,
        country: 'US',
        specialDate: { month: 11, day: 26 },
        light: {
            primary: '#D2691E', // Chocolate / Rust
            primaryHover: '#B25919',
            secondary: '#FF8C00', // Dark Orange
            secondaryHover: '#E07B00',
            bgPrimary: '#FFF8DC', // Cornsilk
            fixedGradientFrom: '#D2691E',
            fixedGradientTo: '#FF8C00',
        },
        dark: {
            primary: '#E67E22',
            primaryHover: '#F39C12',
            secondary: '#FF9F33',
            secondaryHover: '#FFB866',
            bgPrimary: '#1F1105',
            bgSecondary: '#2E1C0C',
            fixedGradientFrom: '#E67E22',
            fixedGradientTo: '#FF9F33',
        }
    },
    halloween: {
        id: 'halloween',
        name: "Halloween (Global)",
        description: "A fun and spooky night of dressing up, carving pumpkins, and trick-or-treating on October 31st",
        isHoliday: true,
        specialDate: { month: 10, day: 31 },
        light: {
            primary: '#FF7F50', // Coral Orange
            primaryHover: '#FF6347',
            secondary: '#4B0082', // Indigo Purple
            secondaryHover: '#3C0069',
            bgPrimary: '#F7EDFF',
            fixedGradientFrom: '#4B0082',
            fixedGradientTo: '#FF7F50',
            starColor: '#FF7F50',
        },
        dark: {
            primary: '#FF944D',
            primaryHover: '#FFB280',
            secondary: '#8F33FF',
            secondaryHover: '#A366FF',
            bgPrimary: '#0C0614',
            bgSecondary: '#1A0E2B',
            fixedGradientFrom: '#8F33FF',
            fixedGradientTo: '#FF944D',
            starColor: '#FF944D',
        }
    },
    bonfire_night: {
        id: 'bonfire_night',
        name: "Bonfire Night (UK)",
        description: "Marking the failure of the 1605 Gunpowder Plot with fireworks and bonfires on November 5th",
        isHoliday: true,
        country: 'UK',
        specialDate: { month: 11, day: 5 },
        light: {
            primary: '#FF4500', // OrangeRed
            primaryHover: '#CD3700',
            secondary: '#2F4F4F', // Dark Slate Gray
            secondaryHover: '#1C2F2F',
            bgPrimary: '#FFFDF0',
            fixedGradientFrom: '#FF4500',
            fixedGradientTo: '#2F4F4F',
        },
        dark: {
            primary: '#FF6347',
            primaryHover: '#FF8566',
            secondary: '#4D6B6B',
            secondaryHover: '#6E8F8F',
            bgPrimary: '#0F1112',
            bgSecondary: '#1E2224',
            fixedGradientFrom: '#FF6347',
            fixedGradientTo: '#4D6B6B',
        }
    },
    st_georges_day: {
        id: 'st_georges_day',
        name: "St. George's Day (UK)",
        description: "Honoring the patron saint of England and celebrating English heritage on April 23rd",
        isHoliday: true,
        country: 'UK',
        specialDate: { month: 4, day: 23 },
        light: {
            primary: '#E01A22', // England Red
            primaryHover: '#B81218',
            secondary: '#4682B4', // Steel Blue
            secondaryHover: '#36648B',
            bgPrimary: '#FFFFFF',
            bgSecondary: '#F8FAFC',
            fixedGradientFrom: '#E01A22',
            fixedGradientTo: '#4682B4',
        },
        dark: {
            primary: '#FF4D52',
            primaryHover: '#FF8084',
            secondary: '#5C9CD6',
            secondaryHover: '#8FBFE8',
            bgPrimary: '#121214',
            bgSecondary: '#1E1E22',
            fixedGradientFrom: '#FF4D52',
            fixedGradientTo: '#5C9CD6',
        }
    },
    german_unity: {
        id: 'german_unity',
        name: "German Unity Day (DE)",
        description: "Commemorating the anniversary of German reunification in 1990 on October 3rd",
        isHoliday: true,
        country: 'DE',
        specialDate: { month: 10, day: 3 },
        light: {
            primary: '#DD0000', // Flag Red
            primaryHover: '#B20000',
            secondary: '#FFCC00', // Flag Gold
            secondaryHover: '#E6B800',
            bgPrimary: '#FFFDF2',
            fixedGradientFrom: '#000000',
            fixedGradientTo: '#FFCC00',
            starColor: '#FFCC00',
        },
        dark: {
            primary: '#FF3333',
            primaryHover: '#FF6666',
            secondary: '#FFE066',
            secondaryHover: '#FFF0B3',
            bgPrimary: '#0A0A0A',
            bgSecondary: '#171717',
            fixedGradientFrom: '#333333',
            fixedGradientTo: '#FFE066',
            starColor: '#FFE066',
        }
    },
    spain_national: {
        id: 'spain_national',
        name: "Spain National Day (ES)",
        description: "Commemorating historical connections and cultural heritage on October 12th",
        isHoliday: true,
        country: 'ES',
        specialDate: { month: 10, day: 12 },
        translations: {
            nl: {
                name: "Nationale feestdag van Spanje (ES)",
                description: "Historische verbindingen en cultureel erfgoed herdenken op 12 oktober"
            },
            es: {
                name: "Día de la Hispanidad (ES)",
                description: "Conmemoración de las conexiones históricas y el patrimonio cultural el 12 de octubre"
            },
            fr: {
                name: "Fête Nationale d'Espagne (ES)",
                description: "Commémoration des liens historiques et du patrimoine culturel le 12 octobre"
            },
            de: {
                name: "Nationalfeiertag Spaniens (ES)",
                description: "Gedenken an historische Verbindungen und das kulturelle Erbe am 12. Oktober"
            },
            pl: {
                name: "Święto Narodowe Hiszpanii (ES)",
                description: "Upamiętnienie historycznych powiązań i dziedzictwa kulturowego 12 października"
            }
        },
        light: {
            primary: '#C60B1E', // Flag Red
            primaryHover: '#9E0918',
            secondary: '#F1BF00', // Flag Yellow
            secondaryHover: '#D4A800',
            bgPrimary: '#FFFDF5',
            fixedGradientFrom: '#C60B1E',
            fixedGradientTo: '#F1BF00',
            starColor: '#F1BF00',
        },
        dark: {
            primary: '#FF3C4F',
            primaryHover: '#FF707E',
            secondary: '#FFD133',
            secondaryHover: '#FFE066',
            bgPrimary: '#1F0609',
            bgSecondary: '#360A10',
            fixedGradientFrom: '#FF3C4F',
            fixedGradientTo: '#FFD133',
            starColor: '#FFD133',
        }
    },
    la_tomatina: {
        id: 'la_tomatina',
        name: "La Tomatina (ES)",
        description: "A giant food fight festival where participants throw tomatoes for fun on the last Wednesday of August",
        isHoliday: true,
        country: 'ES',
        specialDate: { month: 8, day: 26 },
        light: {
            primary: '#FF2400', // Tomato
            primaryHover: '#D11D00',
            secondary: '#556B2F', // OliveGreen
            secondaryHover: '#3E4E22',
            bgPrimary: '#FFF8F5',
            fixedGradientFrom: '#FF2400',
            fixedGradientTo: '#556B2F',
        },
        dark: {
            primary: '#FF5433',
            primaryHover: '#FF8366',
            secondary: '#7F9E4B',
            secondaryHover: '#A4BD7B',
            bgPrimary: '#140301',
            bgSecondary: '#2B0A06',
            fixedGradientFrom: '#FF5433',
            fixedGradientTo: '#7F9E4B',
        }
    },
    cinco_de_mayo: {
        id: 'cinco_de_mayo',
        name: "Cinco de Mayo (MX)",
        description: "Celebrating the Mexican Army's victory over French forces at the Battle of Puebla on May 5th",
        isHoliday: true,
        country: 'MX',
        specialDate: { month: 5, day: 5 },
        light: {
            primary: '#006847', // Mexican Green
            primaryHover: '#004B33',
            secondary: '#CE1126', // Mexican Red
            secondaryHover: '#A70E1E',
            bgPrimary: '#FFFDF5',
            fixedGradientFrom: '#006847',
            fixedGradientTo: '#CE1126',
            starColor: '#FF8C00',
        },
        dark: {
            primary: '#009A68',
            primaryHover: '#33B28C',
            secondary: '#FF4D60',
            secondaryHover: '#FF8090',
            bgPrimary: '#02120C',
            bgSecondary: '#062B1D',
            fixedGradientFrom: '#009A68',
            fixedGradientTo: '#FF4D60',
            starColor: '#FF8C00',
        }
    },
    day_of_dead: {
        id: 'day_of_dead',
        name: "Day of the Dead (MX)",
        description: "A Mexican celebration dedicated to remembering and honoring family members who have passed away on November 2nd",
        isHoliday: true,
        country: 'MX',
        specialDate: { month: 11, day: 2 },
        light: {
            primary: '#800080', // Purple
            primaryHover: '#600060',
            secondary: '#FF1493', // Deep Pink
            secondaryHover: '#FF69B4',
            bgPrimary: '#FFF5FD',
            fixedGradientFrom: '#800080',
            fixedGradientTo: '#FF1493',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#B833B8',
            primaryHover: '#D666D6',
            secondary: '#FF4DA6',
            secondaryHover: '#FF80C0',
            bgPrimary: '#140114',
            bgSecondary: '#2B042B',
            fixedGradientFrom: '#B833B8',
            fixedGradientTo: '#FF4DA6',
            starColor: '#FFD700',
        }
    },
    st_patricks: {
        id: 'st_patricks',
        name: "St. Patrick's Day (IE)",
        description: "Celebrating Irish culture and the patron saint of Ireland with parades and green themes on March 17th",
        isHoliday: true,
        country: 'IE',
        specialDate: { month: 3, day: 17 },
        light: {
            primary: '#009A49', // Irish Green
            primaryHover: '#007A3A',
            secondary: '#FFD700', // Gold
            secondaryHover: '#D4AF37',
            bgPrimary: '#E8F5E9',
            fixedGradientFrom: '#009A49',
            fixedGradientTo: '#FFD700',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#10B981',
            primaryHover: '#34D399',
            secondary: '#FBBF24',
            secondaryHover: '#FDE68A',
            bgPrimary: '#021C11',
            bgSecondary: '#053E26',
            fixedGradientFrom: '#10B981',
            fixedGradientTo: '#FBBF24',
            starColor: '#FBBF24',
        }
    },
    chinese_new_year: {
        id: 'chinese_new_year',
        name: "Chinese New Year (CN)",
        description: "Welcoming the new lunisolar year with family reunions, dragon dances, and red envelopes",
        isHoliday: true,
        country: 'CN',
        specialDate: { month: 2, day: 10 },
        light: {
            primary: '#EE1C25', // Chinese Red
            primaryHover: '#BF141A',
            secondary: '#FFD700', // Gold
            secondaryHover: '#D4AF37',
            bgPrimary: '#FFF5F5',
            fixedGradientFrom: '#EE1C25',
            fixedGradientTo: '#FFD700',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#FF4D55',
            primaryHover: '#FF8086',
            secondary: '#FFD700',
            secondaryHover: '#FFE066',
            bgPrimary: '#1F0305',
            bgSecondary: '#380B0E',
            fixedGradientFrom: '#FF4D55',
            fixedGradientTo: '#FFD700',
            starColor: '#FFD700',
        }
    },
    christmas: {
        id: 'christmas',
        name: "Christmas (Global)",
        description: "Celebrating the birth of Jesus Christ and sharing warmth with family and friends on December 25th",
        isHoliday: true,
        specialDate: { month: 12, day: 25 },
        light: {
            primary: '#C41E3A', // Cardinal Red
            primaryHover: '#9B111E',
            secondary: '#005F39', // Pine Green
            secondaryHover: '#00472A',
            bgPrimary: '#F5FFFA', // Mint Cream / Snow
            fixedGradientFrom: '#C41E3A',
            fixedGradientTo: '#005F39',
            starColor: '#FFD700',
        },
        dark: {
            primary: '#FF4D66',
            primaryHover: '#FF8093',
            secondary: '#10B981',
            secondaryHover: '#34D399',
            bgPrimary: '#011F11',
            bgSecondary: '#053D22',
            fixedGradientFrom: '#FF4D66',
            fixedGradientTo: '#10B981',
            starColor: '#FFD700',
        }
    },
    valentine: {
        id: 'valentine',
        name: "Valentine's Day (Global)",
        description: "A celebration of love, affection, and friendship on February 14th",
        isHoliday: true,
        specialDate: { month: 2, day: 14 },
        light: {
            primary: '#E0115F', // Rose Red
            primaryHover: '#B00E4A',
            secondary: '#FFB6C1', // Light Pink
            secondaryHover: '#FFA0B0',
            bgPrimary: '#FFF0F5', // Lavender Blush
            fixedGradientFrom: '#E0115F',
            fixedGradientTo: '#FFB6C1',
            starColor: '#E0115F',
        },
        dark: {
            primary: '#FF4D8C',
            primaryHover: '#FF80AF',
            secondary: '#FFB6C1',
            secondaryHover: '#FFD1D9',
            bgPrimary: '#22030E',
            bgSecondary: '#3C071C',
            fixedGradientFrom: '#FF4D8C',
            fixedGradientTo: '#FFB6C1',
            starColor: '#FF4D8C',
        }
    },
    new_year: {
        id: 'new_year',
        name: "New Year's Eve/Day",
        description: "Welcoming the start of the next calendar year with countdowns and fireworks",
        isHoliday: true,
        specialDate: { month: 12, day: 31 },
        light: {
            primary: '#0C1446', // Midnight Navy
            primaryHover: '#050A26',
            secondary: '#FFDF00', // Luxury Gold
            secondaryHover: '#E6C800',
            bgPrimary: '#F4F6F9',
            fixedGradientFrom: '#0C1446',
            fixedGradientTo: '#FFDF00',
            starColor: '#FFDF00',
        },
        dark: {
            primary: '#2E6CC9',
            primaryHover: '#5C90DB',
            secondary: '#FFDF00',
            secondaryHover: '#FFE64D',
            bgPrimary: '#020514',
            bgSecondary: '#080E2B',
            fixedGradientFrom: '#2E6CC9',
            fixedGradientTo: '#FFDF00',
            starColor: '#FFDF00',
        }
    }
};

// 10 Custom Color-only Themes (User themes, restricted to admin edits for now)
export const COLOR_THEMES: ThemeConfig[] = [
    {
        id: 'emerald_forest',
        name: "Emerald Forest",
        description: "Elegant emerald green and fresh mint accents",
        isHoliday: false,
        light: {
            primary: '#059669',
            primaryHover: '#047857',
            secondary: '#10B981',
            secondaryHover: '#34D399',
            bgPrimary: '#F0FDF4',
        },
        dark: {
            primary: '#34D399',
            primaryHover: '#6EE7B7',
            secondary: '#059669',
            secondaryHover: '#10B981',
            bgPrimary: '#06261A',
            bgSecondary: '#0B422E',
        }
    },
    {
        id: 'ocean_breeze',
        name: "Ocean Breeze",
        description: "Vibrant ocean cyan and cool deep sea blue",
        isHoliday: false,
        light: {
            primary: '#0EA5E9',
            primaryHover: '#0284C7',
            secondary: '#0284C7',
            secondaryHover: '#0369A1',
            bgPrimary: '#F0F9FF',
        },
        dark: {
            primary: '#38BDF8',
            primaryHover: '#7DD3FC',
            secondary: '#0EA5E9',
            secondaryHover: '#0284C7',
            bgPrimary: '#042336',
            bgSecondary: '#0B3E5C',
        }
    },
    {
        id: 'sunset_glow',
        name: "Sunset Glow",
        description: "Calm coral red, sunset orange, and gold accents",
        isHoliday: false,
        light: {
            primary: '#F97316',
            primaryHover: '#EA580C',
            secondary: '#F43F5E',
            secondaryHover: '#E11D48',
            bgPrimary: '#FFF7ED',
        },
        dark: {
            primary: '#FB923C',
            primaryHover: '#FDBA74',
            secondary: '#FB7185',
            secondaryHover: '#FDA4AF',
            bgPrimary: '#2B1202',
            bgSecondary: '#4A230B',
        }
    },
    {
        id: 'lavender_fields',
        name: "Lavender Fields",
        description: "Fragrant pastel lavender and deep royal purple",
        isHoliday: false,
        light: {
            primary: '#8B5CF6',
            primaryHover: '#7C3AED',
            secondary: '#A78BFA',
            secondaryHover: '#C4B5FD',
            bgPrimary: '#F5F3FF',
        },
        dark: {
            primary: '#A78BFA',
            primaryHover: '#C4B5FD',
            secondary: '#8B5CF6',
            secondaryHover: '#7C3AED',
            bgPrimary: '#1C0E36',
            bgSecondary: '#311C59',
        }
    },
    {
        id: 'electric_neon',
        name: "Electric Neon",
        description: "Futuristic cyberpunk pink and hyper cyan",
        isHoliday: false,
        light: {
            primary: '#D946EF',
            primaryHover: '#C084FC',
            secondary: '#06B6D4',
            secondaryHover: '#22D3EE',
            bgPrimary: '#FDF4FF',
        },
        dark: {
            primary: '#E879F9',
            primaryHover: '#F472B6',
            secondary: '#22D3EE',
            secondaryHover: '#67E8F9',
            bgPrimary: '#2B0430',
            bgSecondary: '#470C52',
        }
    },
    {
        id: 'nordic_slate',
        name: "Nordic Slate",
        description: "Minimalist gray slate with subzero sky blue hints",
        isHoliday: false,
        light: {
            primary: '#475569',
            primaryHover: '#334155',
            secondary: '#64748B',
            secondaryHover: '#94A3B8',
            bgPrimary: '#F8FAFC',
        },
        dark: {
            primary: '#94A3B8',
            primaryHover: '#CBD5E1',
            secondary: '#475569',
            secondaryHover: '#64748B',
            bgPrimary: '#1E293B',
            bgSecondary: '#334155',
        }
    },
    {
        id: 'monochrome_premium',
        name: "Monochrome Premium",
        description: "Ultra clean onyx black and deep charcoal tones",
        isHoliday: false,
        light: {
            primary: '#1E293B',
            primaryHover: '#0F172A',
            secondary: '#475569',
            secondaryHover: '#334155',
            bgPrimary: '#F1F5F9',
        },
        dark: {
            primary: '#F1F5F9',
            primaryHover: '#FFFFFF',
            secondary: '#64748B',
            secondaryHover: '#94A3B8',
            bgPrimary: '#0F172A',
            bgSecondary: '#1E293B',
        }
    },
    {
        id: 'desert_sand',
        name: "Desert Sand",
        description: "Warm desert terracotta orange and sand colors",
        isHoliday: false,
        light: {
            primary: '#C2410C',
            primaryHover: '#9A3412',
            secondary: '#EAB308',
            secondaryHover: '#CA8A04',
            bgPrimary: '#FEF9C3',
        },
        dark: {
            primary: '#F97316',
            primaryHover: '#FB923C',
            secondary: '#FDE047',
            secondaryHover: '#FEF08A',
            bgPrimary: '#2B1A02',
            bgSecondary: '#472F08',
        }
    },
    {
        id: 'royal_amethyst',
        name: "Royal Amethyst",
        description: "Regal dark amethyst purple with glittering gold accents",
        isHoliday: false,
        light: {
            primary: '#701A75',
            primaryHover: '#4A044E',
            secondary: '#F59E0B',
            secondaryHover: '#D97706',
            bgPrimary: '#FDF4FF',
        },
        dark: {
            primary: '#D946EF',
            primaryHover: '#F472B6',
            secondary: '#FBBF24',
            secondaryHover: '#FDE68A',
            bgPrimary: '#2E0630',
            bgSecondary: '#4A0E4E',
        }
    },
    {
        id: 'sakura_blossom',
        name: "Sakura Blossom",
        description: "Soft pink cherry blossoms under a white sky",
        isHoliday: false,
        light: {
            primary: '#EC4899',
            primaryHover: '#DB2777',
            secondary: '#F472B6',
            secondaryHover: '#F472B6',
            bgPrimary: '#FFF5F7',
        },
        dark: {
            primary: '#F472B6',
            primaryHover: '#FB7185',
            secondary: '#EC4899',
            secondaryHover: '#D946EF',
            bgPrimary: '#260410',
            bgSecondary: '#420B20',
        }
    },
    {
        id: 'blue_yellow_accessibility',
        name: "Blue & Yellow (Deuteranopia/Protanopia)",
        description: "High-contrast blue and yellow color palette designed for red-green color blindness",
        isHoliday: false,
        light: {
            primary: '#005AB5',
            primaryHover: '#004494',
            secondary: '#DC9700',
            secondaryHover: '#B57C00',
            bgPrimary: '#F4F9FF',
        },
        dark: {
            primary: '#70B5FF',
            primaryHover: '#99CAFF',
            secondary: '#FFC44D',
            secondaryHover: '#FFD580',
            bgPrimary: '#001329',
            bgSecondary: '#00244D',
        }
    },
    {
        id: 'red_teal_accessibility',
        name: "Red & Teal (Tritanopia)",
        description: "Optimized red and teal color palette designed for blue-yellow color blindness",
        isHoliday: false,
        light: {
            primary: '#D13438',
            primaryHover: '#A8282B',
            secondary: '#008272',
            secondaryHover: '#006659',
            bgPrimary: '#F2FAF9',
        },
        dark: {
            primary: '#FF6B6B',
            primaryHover: '#FF9494',
            secondary: '#26C6DA',
            secondaryHover: '#80DEEA',
            bgPrimary: '#0F1D1C',
            bgSecondary: '#1C3B38',
        }
    },
    {
        id: 'high_contrast_accessibility',
        name: "High Contrast Monochrome",
        description: "A solid high contrast black and white color palette maximizing general accessibility",
        isHoliday: false,
        light: {
            primary: '#000000',
            primaryHover: '#222222',
            secondary: '#004F9F',
            secondaryHover: '#003366',
            bgPrimary: '#FFFFFF',
        },
        dark: {
            primary: '#FFFFFF',
            primaryHover: '#E0E0E0',
            secondary: '#38BDF8',
            secondaryHover: '#0EA5E9',
            bgPrimary: '#000000',
            bgSecondary: '#1A1A1A',
        }
    }
];

// Combines standard base themes with dynamic overrides
export const getOverriddenTheme = (baseTheme: typeof lightTheme, overrides: Partial<typeof lightTheme>) => {
    return {
        ...baseTheme,
        ...overrides,
        // Ensure challenges match the theme overrides if present
        challenges: {
            ...baseTheme.challenges,
            ...(overrides.challenges || {})
        },
        pubGolf: {
            ...baseTheme.pubGolf,
            ...(overrides.pubGolf || {})
        }
    };
};
