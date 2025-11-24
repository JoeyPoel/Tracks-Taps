export interface Review {
    id: number;
    tourId: number;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    comment: string;
    images?: string[];
}
