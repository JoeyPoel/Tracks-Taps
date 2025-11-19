export interface Tour {
    id: number;
    title: string;
    location: string;
    description: string;
    stops: number;
    rating: number;
}

export const tours: Tour[] = [
    {
        id: 1,
        title: "Historic London Pub Crawl",
        location: "London",
        description: "Explore the oldest pubs in the city, each with a rich and storied history.",
        stops: 3,
        rating: 4.5,
    },
    {
        id: 2,
        title: "Paris Art Tour",
        location: "Paris",
        description: "Discover the famous art galleries and hidden street art of Paris.",
        stops: 5,
        rating: 4.0,
    },
    {
        id: 3,
        title: "Rome Culinary Experience",
        location: "Rome",
        description: "Taste traditional Roman dishes in the city's best local restaurants.",
        stops: 4,
        rating: 3.7,
    },
];
