import { appSettingsRepository } from '../repositories/appSettingsRepository';
import { userRepository } from '../repositories/userRepository';

export const appSettingsController = {
  async getSettings() {
    try {
      const settings = await appSettingsRepository.getSettings();
      return Response.json(settings || { 
        id: 'global', 
        freeToursEnabled: false, 
        freeToursUntil: null,
        globalThemeOverride: null,
        autoThemeEnabled: true,
        showUnmoderatedTours: false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
  },

  async updateSettings(request: Request) {
    try {
      const body = await request.json();
      const { freeToursEnabled, freeToursUntil, globalThemeOverride, autoThemeEnabled, showUnmoderatedTours, userId } = body;

      if (!userId) {
        return Response.json({ error: 'Missing userId' }, { status: 400 });
      }

      // Verify admin
      const user = await userRepository.getUserProfile(Number(userId));
      if (!user || !(user as any).isAdmin) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const updatedSettings = await appSettingsRepository.updateSettings({
        freeToursEnabled,
        freeToursUntil: freeToursUntil ? new Date(freeToursUntil) : null,
        globalThemeOverride,
        autoThemeEnabled,
        showUnmoderatedTours
      });

      return Response.json(updatedSettings);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return Response.json({ error: 'Failed to update settings', details: error.message }, { status: 500 });
    }
  }
};
