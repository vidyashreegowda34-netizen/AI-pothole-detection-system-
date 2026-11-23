const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticate, optionalAuth, requireRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public and optional auth routes
router.get('/', optionalAuth, issueController.getIssues);
router.get('/map', issueController.getMapIssues);
router.get('/:id', optionalAuth, issueController.getIssueById);

// Citizen issue creation (up to 3 photos)
router.post('/', authenticate, upload.array('photos', 3), issueController.createIssue);

// Upvote and Comment
router.post('/:id/upvote', authenticate, issueController.toggleUpvote);
router.post('/:id/comment', authenticate, issueController.addComment);

// Citizen Reopen
router.post('/:id/reopen', authenticate, issueController.reopenIssue);

// Officer status update and resolution proof upload
router.patch(
  '/:id/status',
  authenticate,
  requireRoles('OFFICER', 'ADMIN'),
  upload.array('resolutionPhotos', 3),
  issueController.updateStatus
);

module.exports = router;
