const Por = require("../models/Por");
const PrivilegeType = require("../models/PrivilegeType");

// POR Services
exports.createPor = async (porData) => {
  const { privilegeTypeId, club_id, board_id } = porData;

  // Check if a Por with the same (privilegeTypeId and club_id) exists
  const existingPorWithClub = await Por.findOne({ 
    privilegeTypeId, 
    club_id 
  });

  // Check if a Por with the same (privilegeTypeId and board_id) exists
  const existingPorWithBoard = await Por.findOne({ 
    privilegeTypeId, 
    board_id 
  });

  if (existingPorWithClub || existingPorWithBoard) {
    throw new Error(
      "A Por already exists with the same PrivilegeType and Club/Board combination."
    );
  }

  // If no duplicates, create and save the new Por
  const por = new Por(porData);
  return await por.save();
};

exports.getAllPor = async () => {
  return await Por.find()
    .populate("privilegeTypeId")
    .populate("club_id")
    .populate("board_id")
    .populate("user_id");
};

exports.getPorById = async (id) => {
  return await Por.findById(id)
    .populate("privilegeTypeId")
    .populate("club_id")
    .populate("board_id")
    .populate("user_id");
};

exports.updatePor = async (id, updateData) => {
  return await Por.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deletePor = async (id) => {
  return await Por.findByIdAndDelete(id);
};

exports.getPorByUserId = async (userId) => {
  return await Por.find({ user_id: userId })
    .populate("privilegeTypeId")
    .populate("club_id")
    .populate("board_id")
    .populate("user_id");
};

// PrivilegeType Services
exports.createPrivilegeType = async (privilegeData) => {
  const privilegeType = new PrivilegeType(privilegeData);
  return await privilegeType.save();
};

exports.getAllPrivilegeTypes = async () => {
  return await PrivilegeType.find();
};

exports.getPrivilegeTypeById = async (id) => {
  return await PrivilegeType.findById(id);
};

exports.updatePrivilegeType = async (id, updateData) => {
  return await PrivilegeType.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deletePrivilegeType = async (id) => {
  const deletePrivilegeType = await PrivilegeType.findByIdAndDelete(id);
  const deletePor = await Por.deleteMany({ privilegeTypeId: id });
  return { deletePrivilegeType, deletePor };
};
