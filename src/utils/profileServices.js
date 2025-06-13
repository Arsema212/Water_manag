import { mockProfileService } from './mockProfileService';

// This will be the main service import for components
const profileService = {
  async saveProfile(userId, profileData) {
    // TODO: Replace with real PostgreSQL API call when ready
    // return await postgresSaveProfile(userId, profileData);
    return await mockProfileService.saveProfile(userId, profileData);
  },

  async getProfile(userId) {
    // TODO: Replace with real PostgreSQL API call when ready
    // return await postgresGetProfile(userId);
    return await mockProfileService.getProfile(userId);
  }
};

// For testing/dev purposes
export const testing = {
  ...mockProfileService
};

export default profileService;