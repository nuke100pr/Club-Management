const Event = require('../models/Event');
const User = require('../models/User');
const Boards = require('../models/Boards');
const Clubs = require('../models/Clubs');

class StatsService {
  async getStats() {
    try {
      // Count total events
      const totalEvents = await Event.countDocuments();
      
      // Count upcoming events (events with timestamp greater than now)
      const now = new Date().toISOString();
      const upcomingEvents = await Event.countDocuments({ timestamp: { $gt: now } });
      
      // Count total boards
      const totalBoards = await Boards.countDocuments();
      
      // Count total clubs
      const totalClubs = await Clubs.countDocuments();
      
      // Count active users
      const activeUsers = await User.countDocuments({ status: 'active' });
      
      // Count users registered this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const usersRegisteredThisMonth = await User.countDocuments({
        status: 'active',
        registered_at: { $gte: startOfMonth.toISOString() }
      });
      
      // Count banned users
      const bannedUsers = await User.countDocuments({ status: 'banned' });
      
      return {
        totalEvents,
        upcomingEvents,
        totalBoards,
        totalClubs,
        activeUsers,
        usersRegisteredThisMonth,
        bannedUsers
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = new StatsService();