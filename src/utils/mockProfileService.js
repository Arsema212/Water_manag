// Mock database implementation
const mockUsersDB = [];

export const mockProfileService = {
  // Save profile to mock DB
  async saveProfile(userId, profileData) {
    console.log('[MOCK DB] Saving profile:', { userId, ...profileData });
    
    // Simulate DB delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingIndex = mockUsersDB.findIndex(u => u.id === userId);
    
    if (existingIndex >= 0) {
      // Update existing
      mockUsersDB[existingIndex] = { 
        ...mockUsersDB[existingIndex], 
        ...profileData 
      };
    } else {
      // Add new
      mockUsersDB.push({ id: userId, ...profileData });
    }
    
    return { id: userId, ...profileData };
  },

  // Get profile from mock DB
  async getProfile(userId) {
    console.log('[MOCK DB] Fetching profile for user:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsersDB.find(u => u.id === userId);
    return user || null;
  },

  // Utility to clear mock DB (for testing)
  _clear() {
    mockUsersDB.length = 0;
  }
};