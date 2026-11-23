const prisma = require('../config/db');
const { sendNotification } = require('../services/notifyService');

// Generate unique tracking number e.g. TUM-2026-1042
function generateTrackingNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TUM-${year}-${randomNum}`;
}

/**
 * Report a new Civic Issue
 */
exports.createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      talukId,
      wardId,
      categoryId,
      latitude,
      longitude,
      addressText,
      urgency,
      photoUrls: directPhotoUrls, // In case sent as JSON or offline sync
    } = req.body;

    if (!title || !description || !talukId || !categoryId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, taluk, category, and GPS coordinates are required.',
      });
    }

    // Process uploaded photos
    let photoList = [];
    if (req.files && req.files.length > 0) {
      photoList = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (directPhotoUrls) {
      photoList = Array.isArray(directPhotoUrls) ? directPhotoUrls : JSON.parse(directPhotoUrls || '[]');
    }

    // If still no photo, use a thematic placeholder
    if (photoList.length === 0) {
      photoList = ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'];
    }

    // Lookup Category and Department to calculate SLA
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { department: true },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Selected category does not exist' });
    }

    const slaHours = category.slaHours || 48;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    const trackingNumber = generateTrackingNumber();

    const reporterId = req.user.id;

    // Create Issue
    const issue = await prisma.issue.create({
      data: {
        trackingNumber,
        title,
        description,
        status: 'SUBMITTED',
        urgency: urgency || 'MEDIUM',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        addressText: addressText || null,
        talukId,
        wardId: wardId || null,
        categoryId,
        departmentId: category.departmentId,
        reporterId,
        photoUrls: JSON.stringify(photoList),
        slaDeadline,
        timeline: {
          create: {
            status: 'SUBMITTED',
            actionEn: 'Issue reported by citizen',
            actionKn: 'ನಾಗರಿಕರಿಂದ ದೂರು ದಾಖಲಿಸಲಾಗಿದೆ',
            notes: 'Report received and queued for department verification',
            actorName: req.user.name || 'Citizen',
            actorRole: req.user.role,
          },
        },
      },
      include: {
        category: true,
        department: true,
        taluk: true,
        ward: true,
        timeline: true,
      },
    });

    // Notify Reporter
    await sendNotification({
      userId: reporterId,
      issueId: issue.id,
      titleEn: `Issue Registered: ${trackingNumber}`,
      titleKn: `ದೂರು ದಾಖಲಾಗಿದೆ: ${trackingNumber}`,
      messageEn: `Your report regarding '${title}' has been submitted to ${category.department.nameEn}. SLA Target: ${slaHours}h.`,
      messageKn: `'${title}' ಕುರಿತು ನಿಮ್ಮ ದೂರನ್ನು ${category.department.nameKn} ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಪರಿಹಾರದ ಗಡುವು: ${slaHours} ಗಂಟೆಗಳು.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue,
    });
  } catch (error) {
    console.error('createIssue error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create issue', error: error.message });
  }
};

/**
 * Get issues feed with filtering and search
 */
exports.getIssues = async (req, res) => {
  try {
    const {
      talukId,
      wardId,
      categoryId,
      departmentId,
      status,
      search,
      urgency,
      myReports,
      assignedToMe,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    if (talukId) where.talukId = talukId;
    if (wardId) where.wardId = wardId;
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;

    if (myReports && req.user) {
      where.reporterId = req.user.id;
    }

    if (assignedToMe && req.user) {
      where.OR = [
        { assignedToId: req.user.id },
        { departmentId: req.user.departmentId },
      ];
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { trackingNumber: { contains: search } },
        { addressText: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [issues, totalCount] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          department: true,
          taluk: true,
          ward: true,
          reporter: {
            select: { id: true, name: true, phoneNumber: true },
          },
          assignedOfficer: {
            select: { id: true, name: true, phoneNumber: true },
          },
          _count: {
            select: {
              upvotes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    // Check if current user has upvoted
    const userId = req.user?.id;
    let upvotedIssueIds = new Set();
    if (userId) {
      const upvotes = await prisma.upvote.findMany({
        where: {
          userId,
          issueId: { in: issues.map((i) => i.id) },
        },
      });
      upvotedIssueIds = new Set(upvotes.map((u) => u.issueId));
    }

    const formattedIssues = issues.map((issue) => ({
      ...issue,
      photoUrls: JSON.parse(issue.photoUrls || '[]'),
      resolutionPhotos: issue.resolutionPhotos ? JSON.parse(issue.resolutionPhotos) : [],
      upvotesCount: issue._count.upvotes,
      commentsCount: issue._count.comments,
      isUpvotedByMe: upvotedIssueIds.has(issue.id),
      isOverdue: new Date() > new Date(issue.slaDeadline) && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED',
    }));

    return res.status(200).json({
      success: true,
      issues: formattedIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('getIssues error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch issues' });
  }
};

/**
 * Get map issues for markers and heatmap
 */
exports.getMapIssues = async (req, res) => {
  try {
    const { talukId, categoryId, status } = req.query;
    const where = {};

    if (talukId) where.talukId = talukId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        trackingNumber: true,
        title: true,
        status: true,
        urgency: true,
        latitude: true,
        longitude: true,
        addressText: true,
        createdAt: true,
        category: {
          select: { nameEn: true, nameKn: true, icon: true, code: true },
        },
        taluk: {
          select: { nameEn: true, nameKn: true },
        },
        _count: {
          select: { upvotes: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues: issues.map((item) => ({
        ...item,
        upvotesCount: item._count.upvotes,
      })),
    });
  } catch (error) {
    console.error('getMapIssues error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch map data' });
  }
};

/**
 * Get issue by ID with complete timeline and comments
 */
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        taluk: true,
        ward: true,
        reporter: {
          select: { id: true, name: true, phoneNumber: true },
        },
        assignedOfficer: {
          select: { id: true, name: true, phoneNumber: true, department: true },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, role: true, department: true },
            },
          },
        },
        _count: {
          select: { upvotes: true, comments: true },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    let isUpvotedByMe = false;
    if (req.user) {
      const upvote = await prisma.upvote.findUnique({
        where: {
          issueId_userId: {
            issueId: issue.id,
            userId: req.user.id,
          },
        },
      });
      isUpvotedByMe = !!upvote;
    }

    const responseData = {
      ...issue,
      photoUrls: JSON.parse(issue.photoUrls || '[]'),
      resolutionPhotos: issue.resolutionPhotos ? JSON.parse(issue.resolutionPhotos) : [],
      upvotesCount: issue._count.upvotes,
      commentsCount: issue._count.comments,
      isUpvotedByMe,
      isOverdue: new Date() > new Date(issue.slaDeadline) && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED',
    };

    return res.status(200).json({ success: true, issue: responseData });
  } catch (error) {
    console.error('getIssueById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch issue details' });
  }
};

/**
 * Update issue status by Officer or Admin
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedToId } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { reporter: true, category: true, department: true },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Process uploaded resolution proof photos
    let resolutionPhotos = issue.resolutionPhotos ? JSON.parse(issue.resolutionPhotos) : [];
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((file) => `/uploads/${file.filename}`);
      resolutionPhotos = [...resolutionPhotos, ...newPhotos];
    } else if (req.body.resolutionPhotos) {
      const extra = Array.isArray(req.body.resolutionPhotos)
        ? req.body.resolutionPhotos
        : JSON.parse(req.body.resolutionPhotos || '[]');
      resolutionPhotos = [...resolutionPhotos, ...extra];
    }

    const updateData = { status };

    if (assignedToId) {
      updateData.assignedToId = assignedToId;
    }

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      updateData.resolutionNotes = notes || 'Issue successfully resolved on site';
      updateData.resolutionPhotos = JSON.stringify(resolutionPhotos);
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    // Map status action text in English & Kannada
    const statusLabels = {
      VERIFIED: { en: 'Issue verified by department triage', kn: 'ಇಲಾಖೆಯು ದೂರನ್ನು ಪರಿಶೀಲಿಸಿದೆ' },
      ASSIGNED: { en: 'Assigned to field officer', kn: 'ಕ್ಷೇತ್ರ ಅಧಿಕಾರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ' },
      IN_PROGRESS: { en: 'Field work currently in progress', kn: 'ದುರಸ್ತಿ ಕಾರ್ಯ ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
      RESOLVED: { en: 'Issue resolved with verification proof', kn: 'ಪುರಾವೆಯೊಂದಿಗೆ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಲಾಗಿದೆ' },
      CLOSED: { en: 'Issue verified and closed', kn: 'ದೂರನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ' },
    };

    const actionText = statusLabels[status] || {
      en: `Status updated to ${status}`,
      kn: `ಸ್ಥಿತಿ ಬದಲಾಗಿದೆ: ${status}`,
    };

    // Update issue and create timeline event in a transaction
    const [updatedIssue] = await prisma.$transaction([
      prisma.issue.update({
        where: { id },
        data: updateData,
        include: { category: true, department: true, taluk: true },
      }),
      prisma.issueTimeline.create({
        data: {
          issueId: id,
          status,
          actionEn: actionText.en,
          actionKn: actionText.kn,
          notes: notes || null,
          actorName: req.user.name || 'Officer',
          actorRole: req.user.role,
        },
      }),
    ]);

    // Send Notification to Reporter
    await sendNotification({
      userId: issue.reporterId,
      issueId: issue.id,
      titleEn: `Update on ${issue.trackingNumber}: ${status}`,
      titleKn: `${issue.trackingNumber} ದೂರಿನ ಹೊಸ ಅಪ್‌ಡೇಟ್: ${actionText.kn}`,
      messageEn: `Your reported issue status has been updated to '${status}'. ${notes ? `Note: ${notes}` : ''}`,
      messageKn: `ನಿಮ್ಮ ದೂರಿನ ಸ್ಥಿತಿಯನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ: '${actionText.kn}'. ${notes ? `ಟಿಪ್ಪಣಿ: ${notes}` : ''}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('updateStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update issue status' });
  }
};

/**
 * Reopen an issue (Citizen only)
 */
exports.reopenIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (issue.reporterId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only the citizen who reported this can reopen it' });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'REOPENED',
        resolvedAt: null,
      },
    });

    await prisma.issueTimeline.create({
      data: {
        issueId: id,
        status: 'REOPENED',
        actionEn: 'Issue reopened by citizen',
        actionKn: 'ನಾಗರಿಕರಿಂದ ದೂರು ಮರುತೆರೆಯಲಾಗಿದೆ',
        notes: reason || 'Problem persists or resolution was unsatisfactory',
        actorName: req.user.name || 'Citizen',
        actorRole: req.user.role,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Issue reopened for further resolution',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('reopenIssue error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reopen issue' });
  }
};

/**
 * Toggle Upvote on an Issue
 */
exports.toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.upvote.findUnique({
      where: {
        issueId_userId: {
          issueId: id,
          userId,
        },
      },
    });

    let upvoted = false;
    if (existing) {
      await prisma.upvote.delete({
        where: { id: existing.id },
      });
      upvoted = false;
    } else {
      await prisma.upvote.create({
        data: {
          issueId: id,
          userId,
        },
      });
      upvoted = true;
    }

    const totalUpvotes = await prisma.upvote.count({ where: { issueId: id } });

    return res.status(200).json({
      success: true,
      upvoted,
      upvotesCount: totalUpvotes,
    });
  } catch (error) {
    console.error('toggleUpvote error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle upvote' });
  }
};

/**
 * Add Comment to Issue
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const isOfficer = req.user.role === 'OFFICER' || req.user.role === 'ADMIN';

    const comment = await prisma.comment.create({
      data: {
        issueId: id,
        userId: req.user.id,
        text: text.trim(),
        isOfficer,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true, department: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};
