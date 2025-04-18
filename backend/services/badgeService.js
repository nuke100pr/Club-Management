const Badge = require("../models/Badge");
const BadgeType = require("../models/BadgeType");

class BadgeService {
  // BADGE CRUD
  async createBadge(badgeData) {
    const badge = new Badge(badgeData);
    return await badge.save();
  }

  async getAllBadges() {
    const badges = await Badge.find()
      .populate("badge_type_id")
      .populate("user_id");

    // Conditionally populate club_id and board_id
    for (let badge of badges) {
      if (badge.club_id && badge.club_id.toString() !== "") {
        await badge.populate("club_id");
      }
      if (badge.board_id && badge.board_id.toString() !== "") {
        await badge.populate("board_id");
      }
    }

    return badges;
  }

  async getBadgeById(badgeId) {
    const badge = await Badge.findById(badgeId)
      .populate("badge_type_id")
      .populate("user_id");

    // Conditionally populate club_id and board_id
    if (badge.club_id && badge.club_id.toString() !== "") {
      await badge.populate("club_id");
    }
    if (badge.board_id && badge.board_id.toString() !== "") {
      await badge.populate("board_id");
    }

    return badge;
  }

  async getBadgesByUserId(userId) {
    return await Badge.find({ user_id: userId })
      .populate("badge_type_id")
      .sort({ given_on: -1 });
  }

  async updateBadge(badgeId, updateData) {
    return await Badge.findByIdAndUpdate(badgeId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteBadge(badgeId) {
    return await Badge.findByIdAndDelete(badgeId);
  }

  // BADGE TYPE CRUD
  async createBadgeType(badgeTypeData) {
    const badgeType = new BadgeType(badgeTypeData);
    return await badgeType.save();
  }

  async getAllBadgeTypes() {
    return await BadgeType.find().sort({ title: 1 });
  }

  async getBadgeTypeById(badgeTypeId) {
    return await BadgeType.findById(badgeTypeId);
  }

  async updateBadgeType(badgeTypeId, updateData) {
    return await BadgeType.findByIdAndUpdate(badgeTypeId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteBadgeType(badgeTypeId) {
    return await BadgeType.findByIdAndDelete(badgeTypeId);
  }

  // SPECIAL QUERIES
  async getBadgesByType(badgeTypeId) {
    return await Badge.find({ badge_type_id: badgeTypeId })
      .populate("user_id")
      .populate("badge_type_id");
  }
}

module.exports = new BadgeService();
