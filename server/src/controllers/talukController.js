const prisma = require('../config/db');

exports.getTaluks = async (req, res) => {
  try {
    const taluks = await prisma.taluk.findMany({
      include: {
        wards: {
          orderBy: { wardNumber: 'asc' },
        },
        _count: {
          select: { issues: true },
        },
      },
    });

    return res.status(200).json({ success: true, taluks });
  } catch (error) {
    console.error('getTaluks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch taluks' });
  }
};
