import { userController } from '../../backend-mock/controllers/userController';

export async function GET(request: Request) {
    return await userController.getUser(request);
}
