const porService = require("../services/miscService");

async function getPrivilegesByUserId1(req, res) {
  const { user_id } = req.params;

  try {
    const privileges = await porService.getPrivilegesByUserId1(user_id);


    res.status(200).json({
      success: true,
      data: privileges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching privileges",
      error: error.message,
    });
  }
}

async function getPrivilegesByUserId(req, res) {
  const { user_id } = req.params;

  try {
    const privileges = await porService.getPrivilegesByUserId(user_id);
    res.status(200).json({
      success: true,
      data: privileges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching privileges",
      error: error.message,
    });
  }
}

async function getPrivilegesByBoardId(req, res) {
  const { board_id } = req.params;

  try {
    const privileges = await porService.getPrivilegesByBoardId(board_id);
    res.status(200).json({
      success: true,
      data: privileges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching privileges by board",
      error: error.message,
    });
  }
}

async function getPrivilegesByClubId(req, res) {
  const { club_id } = req.params;

  try {
    const privileges = await porService.getPrivilegesByClubId(club_id);
    res.status(200).json({
      success: true,
      data: privileges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching privileges by club",
      error: error.message,
    });
  }
}

async function getBoardEntityCounts(req, res) {
  const { board_id } = req.params;

  try {
    const counts = await porService.getBoardEntityCounts(board_id);
    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching board entity counts",
      error: error.message,
    });
  }
}

async function getClubEntityCounts(req, res) {
  const { club_id } = req.params;

  try {
    const counts = await porService.getClubEntityCounts(club_id);
    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching club entity counts",
      error: error.message,
    });
  }
}

module.exports = {
  getPrivilegesByUserId1,
  getPrivilegesByUserId,
  getPrivilegesByBoardId,
  getPrivilegesByClubId,
  getBoardEntityCounts,
  getClubEntityCounts,
};