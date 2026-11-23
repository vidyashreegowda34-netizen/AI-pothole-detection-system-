const prisma = require('../config/db');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        categories: true,
        _count: {
          select: { issues: true },
        },
      },
    });

    return res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error('getDepartments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
};
