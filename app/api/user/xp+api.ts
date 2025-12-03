import { userController } from '../../../backend-mock/controllers/userController';

export async function POST(request: Request) {
    return await userController.addXp(request);
}
