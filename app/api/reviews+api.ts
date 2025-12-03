import { reviewController } from '../../backend-mock/controllers/reviewController';

export async function GET(request: Request) {
    return await reviewController.getReviews(request);
}

export async function POST(request: Request) {
    return await reviewController.createReview(request);
}
