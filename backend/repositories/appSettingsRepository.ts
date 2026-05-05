import { prisma } from '../../src/lib/prisma';

export const appSettingsRepository = {
  async getSettings() {
    return await prisma.appSettings.findUnique({
      where: { id: 'global' }
    });
  },

  async updateSettings(data: { freeToursEnabled?: boolean; freeToursUntil?: Date | null }) {
    return await prisma.appSettings.update({
      where: { id: 'global' },
      data
    });
  }
};
