const porService = require("../services/porService");

// POR Controllers
exports.createPor = async (req, res) => {
  try {
    const por = await porService.createPor(req.body);
    res.status(201).json(por);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPor = async (req, res) => {
  try {
    const porList = await porService.getAllPor();
    res.status(200).json(porList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPorById = async (req, res) => {
  try {
    const por = await porService.getPorById(req.params.id);
    if (!por) {
      return res.status(404).json({ message: "POR not found" });
    }
    res.status(200).json(por);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePor = async (req, res) => {
  try {
    const por = await porService.updatePor(req.params.id, req.body);
    if (!por) {
      return res.status(404).json({ message: "POR not found" });
    }
    res.status(200).json(por);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePor = async (req, res) => {
  try {
    const por = await porService.deletePor(req.params.id);
    if (!por) {
      return res.status(404).json({ message: "POR not found" });
    }
    res.status(200).json({ message: "POR deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPorByUserId = async (req, res) => {
  try {
    const porList = await porService.getPorByUserId(req.params.userId);
    res.status(200).json(porList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PrivilegeType Controllers
exports.createPrivilegeType = async (req, res) => {
  try {
    const privilegeType = await porService.createPrivilegeType(req.body);
    res.status(201).json(privilegeType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPrivilegeTypes = async (req, res) => {
  try {
    const privilegeTypes = await porService.getAllPrivilegeTypes();
    res.status(200).json(privilegeTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrivilegeTypeById = async (req, res) => {
  try {
    const privilegeType = await porService.getPrivilegeTypeById(req.params.id);
    if (!privilegeType) {
      return res.status(404).json({ message: "Privilege type not found" });
    }
    res.status(200).json(privilegeType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrivilegeType = async (req, res) => {
  try {
    const privilegeType = await porService.updatePrivilegeType(
      req.params.id,
      req.body
    );
    if (!privilegeType) {
      return res.status(404).json({ message: "Privilege type not found" });
    }
    res.status(200).json(privilegeType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePrivilegeType = async (req, res) => {
  try {
    const privilegeType = await porService.deletePrivilegeType(req.params.id);
    if (!privilegeType) {
      return res.status(404).json({ message: "Privilege type not found" });
    }
    res.status(200).json({ message: "Privilege type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
