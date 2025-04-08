const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
storage: multer.memoryStorage(),
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Project CRUD Routes
router.post('/',upload.single('image'), projectController.createProject);
router.get('/api/', projectController.getAllProjects);
router.get('/:id', projectController.getProject);
router.put('/:id',upload.single('image'), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Project Application Routes
router.post('/:projectId/apply', projectController.applyForProject);
router.get('/:projectId/applications', projectController.getApplicationsForProject);
router.get('/user/applications', projectController.getUserApplications);
router.delete('/applications/:applicationId', projectController.withdrawApplication);

// Project Member Management Routes
router.post('/:projectId/members/:userId', projectController.addMember);
router.delete('/:projectId/members/:userId', projectController.removeMember);
router.get('/:projectId/members', projectController.getProjectMembers);
router.get('/user/projects', projectController.getUserProjects);

module.exports = router;