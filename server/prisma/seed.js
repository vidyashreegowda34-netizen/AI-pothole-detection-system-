const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const {
  TALUKS,
  TUMKUR_CITY_WARDS,
  DEPARTMENTS,
  CATEGORIES
} = require('../src/config/constants');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Namma Tumakuru Database Seeding...');

  // 1. Clear existing records in correct relation order
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.issueTimeline.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.taluk.deleteMany();

  console.log('🧹 Existing data purged successfully.');

  // 2. Seed Taluks
  const talukMap = new Map();
  for (const taluk of TALUKS) {
    const created = await prisma.taluk.create({
      data: {
        code: taluk.code,
        nameEn: taluk.nameEn,
        nameKn: taluk.nameKn,
        latitude: taluk.latitude,
        longitude: taluk.longitude,
        isUrban: taluk.isUrban,
      },
    });
    talukMap.set(taluk.code, created);
  }
  console.log(`✅ Seeded ${talukMap.size} Tumkur Taluks`);

  // 3. Seed Tumkur City Wards
  const tumkurCity = talukMap.get('TUMKUR_CITY');
  const wardMap = new Map();
  for (const ward of TUMKUR_CITY_WARDS) {
    const created = await prisma.ward.create({
      data: {
        talukId: tumkurCity.id,
        wardNumber: ward.wardNumber,
        nameEn: ward.nameEn,
        nameKn: ward.nameKn,
      },
    });
    wardMap.set(ward.wardNumber, created);
  }
  console.log(`✅ Seeded ${wardMap.size} Wards for Tumkur City`);

  // 4. Seed Departments
  const deptMap = new Map();
  for (const dept of DEPARTMENTS) {
    const created = await prisma.department.create({
      data: {
        code: dept.code,
        nameEn: dept.nameEn,
        nameKn: dept.nameKn,
        description: dept.description,
      },
    });
    deptMap.set(dept.code, created);
  }
  console.log(`✅ Seeded ${deptMap.size} Government Departments`);

  // 5. Seed Categories
  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const dept = deptMap.get(cat.deptCode);
    if (!dept) continue;

    const created = await prisma.category.create({
      data: {
        code: cat.code,
        nameEn: cat.nameEn,
        nameKn: cat.nameKn,
        departmentId: dept.id,
        slaHours: cat.slaHours,
        icon: cat.icon,
      },
    });
    categoryMap.set(cat.code, created);
  }
  console.log(`✅ Seeded ${categoryMap.size} Issue Categories with SLAs`);

  // 6. Seed Demo Users (Admin, Officers, Citizens)
  const hashedPassword = await bcrypt.hash('tumkur123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      phoneNumber: '9880000001',
      name: 'District Collector Admin',
      role: 'ADMIN',
      password: hashedAdminPassword,
      talukId: tumkurCity.id,
    },
  });

  const officerTcc = await prisma.user.create({
    data: {
      phoneNumber: '9880000002',
      name: 'Suresh Patil (TCC Health Inspector)',
      role: 'OFFICER',
      password: hashedPassword,
      departmentId: deptMap.get('TCC').id,
      talukId: tumkurCity.id,
    },
  });

  const officerPwd = await prisma.user.create({
    data: {
      phoneNumber: '9880000003',
      name: 'Anand Kumar (PWD Junior Engineer)',
      role: 'OFFICER',
      password: hashedPassword,
      departmentId: deptMap.get('PWD').id,
      talukId: tumkurCity.id,
    },
  });

  const officerBescom = await prisma.user.create({
    data: {
      phoneNumber: '9880000004',
      name: 'Manjunath Swamy (BESCOM Lineman)',
      role: 'OFFICER',
      password: hashedPassword,
      departmentId: deptMap.get('BESCOM').id,
      talukId: talukMap.get('GUBBI').id,
    },
  });

  const citizenRamesh = await prisma.user.create({
    data: {
      phoneNumber: '9880000005',
      name: 'Ramesh Gowda',
      role: 'CITIZEN',
      talukId: tumkurCity.id,
    },
  });

  const citizenKavitha = await prisma.user.create({
    data: {
      phoneNumber: '9880000006',
      name: 'Kavitha Murthy',
      role: 'CITIZEN',
      talukId: tumkurCity.id,
    },
  });

  console.log('✅ Seeded Demo Users (Admin, Officers & Citizens)');

  // 7. Seed Sample Issues with Realistic Data across Tumkur
  const now = new Date();

  // Sample Issue 1: Pothole in Kyathsandra
  const issue1 = await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1001',
      title: 'Dangerous deep pothole near Kyathsandra flyover service road',
      description: 'Severe pothole after recent rainfall. Two two-wheelers skidded yesterday. Urgent asphalt patching needed.',
      status: 'IN_PROGRESS',
      urgency: 'HIGH',
      latitude: 13.3421,
      longitude: 77.1425,
      addressText: 'NH-48 Service Road, Near Siddaganga Mutt entrance, Kyathsandra',
      talukId: tumkurCity.id,
      wardId: wardMap.get(3).id,
      categoryId: categoryMap.get('POTHOLE').id,
      departmentId: deptMap.get('PWD').id,
      reporterId: citizenRamesh.id,
      assignedToId: officerPwd.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
      ]),
      slaDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Issue reported by Ramesh Gowda',
            actionKn: 'ರಮೇಶ್ ಗೌಡ ಅವರಿಂದ ದೂರು ದಾಖಲಿಸಲಾಗಿದೆ',
            notes: 'Reported with GPS tag and 2 photos',
            actorName: 'Ramesh Gowda',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
          {
            status: 'VERIFIED',
            actionEn: 'Verified by PWD Assistant Engineer',
            actionKn: 'ಲೋಕೋಪಯೋಗಿ ಇಂಜಿನಿಯರ್ ಅವರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
            notes: 'Site inspection confirmed pothole depth 15cm',
            actorName: 'District Control Room',
            actorRole: 'ADMIN',
            createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
          },
          {
            status: 'ASSIGNED',
            actionEn: 'Assigned to Anand Kumar (PWD)',
            actionKn: 'ಆನಂದ್ ಕುಮಾರ್ (ಲೋಕೋಪಯೋಗಿ) ಅವರಿಗೆ ವಹಿಸಲಾಗಿದೆ',
            notes: 'Patch work road crew scheduled for morning shift',
            actorName: 'Anand Kumar',
            actorRole: 'OFFICER',
            createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          },
          {
            status: 'IN_PROGRESS',
            actionEn: 'Asphalt tar filling crew on site',
            actionKn: 'ಡಾಂಬರು ಹಾಕಿ ಗುಂಡಿ ಮುಚ್ಚುವ ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ',
            notes: 'Gravel rolled, bitumen layer being laid',
            actorName: 'Anand Kumar',
            actorRole: 'OFFICER',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Upvotes and Comments on Issue 1
  await prisma.upvote.create({ data: { issueId: issue1.id, userId: citizenKavitha.id } });
  await prisma.comment.create({
    data: {
      issueId: issue1.id,
      userId: citizenKavitha.id,
      text: 'ನನ್ನ ಸ್ಕೂಟರ್ ಕೂಡ ಇಲ್ಲಿ ಸ್ಕಿಡ್ ಆಗಿತ್ತು, ದಯವಿಟ್ಟು ಬೇಗ ಸರಿಪಡಿಸಿ. (Please fix it soon, very slippery)',
    },
  });
  await prisma.comment.create({
    data: {
      issueId: issue1.id,
      userId: officerPwd.id,
      text: 'Road crew is currently on spot with the roller. Completion expected by this evening.',
      isOfficer: true,
    },
  });

  // Sample Issue 2: Garbage Dump in Mandipet
  const issue2 = await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1002',
      title: 'Solid garbage overflow and foul odor at Mandipet Vegetable Market corner',
      description: 'Vegetable waste and plastic bags not cleared for 3 days. Cattle eating plastic and breeding flies.',
      status: 'SUBMITTED',
      urgency: 'HIGH',
      latitude: 13.3445,
      longitude: 77.1032,
      addressText: 'Market Circle, 2nd Cross, Mandipet, Tumkur',
      talukId: tumkurCity.id,
      wardId: wardMap.get(1).id,
      categoryId: categoryMap.get('GARBAGE').id,
      departmentId: deptMap.get('TCC').id,
      reporterId: citizenKavitha.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
      ]),
      slaDeadline: new Date(now.getTime() + 18 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Issue reported by citizen',
            actionKn: 'ನಾಗರಿಕರಿಂದ ದೂರು ದಾಖಲಿಸಲಾಗಿದೆ',
            notes: 'High priority hygiene complaint',
            actorName: 'Kavitha Murthy',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });
  await prisma.upvote.create({ data: { issueId: issue2.id, userId: citizenRamesh.id } });

  // Sample Issue 3: Streetlights Out in SS Puram (RESOLVED with proof)
  const issue3 = await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1003',
      title: 'Four consecutive streetlights dark on SS Puram 5th Main Road',
      description: 'Entire residential stretch pitch black after sunset. Risk for women and senior citizens walking from bus stop.',
      status: 'RESOLVED',
      urgency: 'MEDIUM',
      latitude: 13.3362,
      longitude: 77.1089,
      addressText: 'SS Puram 5th Main, Opposite Canara Bank',
      talukId: tumkurCity.id,
      wardId: wardMap.get(4).id,
      categoryId: categoryMap.get('STREETLIGHT').id,
      departmentId: deptMap.get('BESCOM').id,
      reporterId: citizenRamesh.id,
      assignedToId: officerBescom.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
      ]),
      resolutionPhotos: JSON.stringify([
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
      ]),
      resolutionNotes: 'Replaced 4 burnt LED fixtures with new 45W energy-saving street lamps. All lights tested operational.',
      resolvedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      slaDeadline: new Date(now.getTime() + 30 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Reported by citizen',
            actionKn: 'ದೂರು ದಾಖಲಿಸಲಾಗಿದೆ',
            actorName: 'Ramesh Gowda',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
          },
          {
            status: 'ASSIGNED',
            actionEn: 'Assigned to BESCOM Maintenance Squad',
            actionKn: 'ಬೆಸ್ಕಾಂ ನಿರ್ವಹಣಾ ತಂಡಕ್ಕೆ ವಹಿಸಲಾಗಿದೆ',
            actorName: 'BESCOM Dispatch',
            actorRole: 'OFFICER',
            createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
          },
          {
            status: 'RESOLVED',
            actionEn: 'New LED fittings installed and verified',
            actionKn: 'ಹೊಸ ಎಲ್‌ಇಡಿ ದೀಪಗಳನ್ನು ಅಳವಡಿಸಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
            notes: 'Replaced 4 burnt LED fixtures. Resolution photo uploaded.',
            actorName: 'Manjunath Swamy',
            actorRole: 'OFFICER',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Sample Issue 4: Drinking Water Pipeline Leakage in Ashok Nagar
  const issue4 = await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1004',
      title: 'Underground drinking water main pipeline burst, severe flooding',
      description: 'Potable water gushing onto the road since 5:00 AM. Water pressure lost for all surrounding residences.',
      status: 'VERIFIED',
      urgency: 'HIGH',
      latitude: 13.3481,
      longitude: 77.0984,
      addressText: 'Ashok Nagar 3rd Cross, Near Water Tank',
      talukId: tumkurCity.id,
      wardId: wardMap.get(2).id,
      categoryId: categoryMap.get('PIPE_LEAK').id,
      departmentId: deptMap.get('KUWSDB').id,
      reporterId: citizenKavitha.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
      ]),
      slaDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Water burst reported',
            actionKn: 'ನೀರು ಸೋರಿಕೆ ವರದಿ ಮಾಡಲಾಗಿದೆ',
            actorName: 'Kavitha Murthy',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
          },
          {
            status: 'VERIFIED',
            actionEn: 'KUWSDB Control room shut gate valve #4',
            actionKn: 'ಜಲಮಂಡಳಿಯಿಂದ ಕವಾಟ #4 ಅನ್ನು ಮುಚ್ಚಲಾಗಿದೆ',
            notes: 'Valve turned off to stop wastage; excavating crew dispatched',
            actorName: 'KUWSDB Officer',
            actorRole: 'OFFICER',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Sample Issue 5: Dangling Live Wire in Gubbi
  await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1005',
      title: 'High tension electricity wire snapped and hanging low near Gubbi bus stand',
      description: 'Cable hanging barely 7 feet above pedestrian walkway. Sparks observed during evening breeze.',
      status: 'ASSIGNED',
      urgency: 'EMERGENCY',
      latitude: 13.3135,
      longitude: 76.9421,
      addressText: 'KSRTC Bus Stand Road, Gubbi Town',
      talukId: talukMap.get('GUBBI').id,
      categoryId: categoryMap.get('ELECTRICITY').id,
      departmentId: deptMap.get('BESCOM').id,
      reporterId: citizenRamesh.id,
      assignedToId: officerBescom.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80',
      ]),
      slaDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Emergency reported by citizen',
            actionKn: 'ತುರ್ತು ವಿದ್ಯುತ್ ಅಪಾಯ ವರದಿಯಾಗಿದೆ',
            actorName: 'Ramesh Gowda',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          },
          {
            status: 'ASSIGNED',
            actionEn: 'Emergency lineman dispatched',
            actionKn: 'ತುರ್ತು ಲೈನ್‌ಮ್ಯಾನ್ ನಿಯೋಜಿಸಲಾಗಿದೆ',
            actorName: 'District Collector Admin',
            actorRole: 'ADMIN',
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Sample Issue 6: Village Borewell Repair in Turuvekere
  await prisma.issue.create({
    data: {
      trackingNumber: 'TUM-2026-1006',
      title: 'Community drinking water borewell motor burnt out in Dabbeghatta village',
      description: 'Over 60 households without drinking water for 2 days. Gram Panchayat waterman reported capacitor failure.',
      status: 'SUBMITTED',
      urgency: 'HIGH',
      latitude: 13.1620,
      longitude: 76.6710,
      addressText: 'Dabbeghatta Grama, Turuvekere Taluk',
      talukId: talukMap.get('TURUVEKERE').id,
      categoryId: categoryMap.get('RURAL_SANITATION').id,
      departmentId: deptMap.get('GRAM_PANCHAYAT').id,
      reporterId: citizenKavitha.id,
      photoUrls: JSON.stringify([
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
      ]),
      slaDeadline: new Date(now.getTime() + 40 * 60 * 60 * 1000),
      timeline: {
        create: [
          {
            status: 'SUBMITTED',
            actionEn: 'Reported by Dabbeghatta villager',
            actionKn: 'ಗ್ರಾಮಸ್ಥರಿಂದ ದೂರು ದಾಖಲಿಸಲಾಗಿದೆ',
            actorName: 'Kavitha Murthy',
            actorRole: 'CITIZEN',
            createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log('✅ Seeded Realistic Civic Issues across Tumkur District');
  console.log('\n🎉 Database Seeding Completed Successfully!\n');
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
