const opportunityService = require('../services/opportunityService');



  // Event Controllers
  const createOpportunity = async (req, res) => {
    try {
      const opportunityData = req.body;
      const imageFile = req.file; // Assuming you're using multer for file uploads

      const newOpportunity = await opportunityService.createOpportunity(opportunityData, imageFile);
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: newOpportunity
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await opportunityService.getAllOpportunities(req.query);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await opportunityService.getOpportunityById(req.params.id);
    res.json(opportunity);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunityData = req.body;
    const imageFile = req.file; // Assuming you're using multer for file uploads

    const updatedOpportunity = await opportunityService.updateOpportunity(
      id,
      opportunityData,
      imageFile
    );

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      data: updatedOpportunity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    await opportunityService.deleteOpportunity(req.params.id);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



module.exports = {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
};