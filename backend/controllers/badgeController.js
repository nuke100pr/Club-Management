const badgeService = require("../services/badgeService");

// BADGE CONTROLLERS
exports.createBadge = async (req, res) => {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json(badge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBadgeById = async (req, res) => {
  try {
    const badge = await badgeService.getBadgeById(req.params.id);
    if (!badge) return res.status(404).json({ error: "Badge not found" });
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBadgesByUserId = async (req, res) => {
  try {
    const badges = await badgeService.getBadgesByUserId(req.params.userId);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBadge = async (req, res) => {
  try {
    const badge = await badgeService.updateBadge(req.params.id, req.body);
    if (!badge) return res.status(404).json({ error: "Badge not found" });
    res.json(badge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBadge = async (req, res) => {
  try {
    const badge = await badgeService.deleteBadge(req.params.id);
    if (!badge) return res.status(404).json({ error: "Badge not found" });
    res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// BADGE TYPE CONTROLLERS
exports.createBadgeType = async (req, res) => {
  try {
    const badgeType = await badgeService.createBadgeType(req.body);
    res.status(201).json(badgeType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllBadgeTypes = async (req, res) => {
  try {
    const badgeTypes = await badgeService.getAllBadgeTypes();
    res.json(badgeTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBadgeTypeById = async (req, res) => {
  try {
    const badgeType = await badgeService.getBadgeTypeById(req.params.id);
    if (!badgeType)
      return res.status(404).json({ error: "Badge type not found" });
    res.json(badgeType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBadgeType = async (req, res) => {
  try {
    const badgeType = await badgeService.updateBadgeType(
      req.params.id,
      req.body
    );
    if (!badgeType)
      return res.status(404).json({ error: "Badge type not found" });
    res.json(badgeType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBadgeType = async (req, res) => {
  try {
    const badgeType = await badgeService.deleteBadgeType(req.params.id);
    if (!badgeType)
      return res.status(404).json({ error: "Badge type not found" });
    res.json({ message: "Badge type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SPECIAL QUERIES
exports.getBadgesByType = async (req, res) => {
  try {
    const badges = await badgeService.getBadgesByType(req.params.typeId);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
