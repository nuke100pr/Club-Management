const express = require('express');
const router = express.Router();
const porController = require('../controllers/porController');

// POR Routes
router.post('/por', porController.createPor);
router.get('/por', porController.getAllPor);
router.get('/por/:id', porController.getPorById);
router.get('/por/user/:userId', porController.getPorByUserId);
router.put('/por/:id', porController.updatePor);
router.delete('/por/:id', porController.deletePor);

// PrivilegeType Routes
router.post('/privilege-types', porController.createPrivilegeType);
router.get('/privilege-types', porController.getAllPrivilegeTypes);
router.get('/privilege-types/:id', porController.getPrivilegeTypeById);
router.put('/privilege-types/:id', porController.updatePrivilegeType);
router.delete('/privilege-types/:id', porController.deletePrivilegeType);

module.exports = router;