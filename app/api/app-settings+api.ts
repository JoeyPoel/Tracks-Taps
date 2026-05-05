import { appSettingsController } from '@/backend/controllers/appSettingsController';

export async function GET(request: Request) {
  return await appSettingsController.getSettings();
}

export async function PATCH(request: Request) {
  return await appSettingsController.updateSettings(request);
}
