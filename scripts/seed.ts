import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI || 'mongodb+srv://seerupclaude_db_user:ahmad1519@cluster0.72mcmkm.mongodb.net/quickfix?retryWrites=true&w=majority&appName=Cluster0';
const dbName = process.env.MONGODB_DB_NAME || 'quickfix';

async function seed() {
  console.log('Connecting to MongoDB Atlas at:', uri.replace(/:([^@]+)@/, ':****@'));
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to database "${dbName}"`);

  // Clear existing collections
  const collections = ['users', 'technicians', 'bookings', 'serviceRequests', 'reviews', 'disputes', 'notifications', 'adminSettings'];
  for (const c of collections) {
    try {
      await db.collection(c).deleteMany({});
    } catch (e) {
      // collection might not exist yet
    }
  }
  console.log('Cleared existing collections.');

  const adminPassHash = await bcrypt.hash('AdminPass123!', 10);
  const custPassHash = await bcrypt.hash('CustomerPass123!', 10);
  const techPassHash = await bcrypt.hash('TechPass123!', 10);

  const now = new Date();

  // 1. Create Admin
  const adminUser = {
    name: 'QuickFix Admin',
    email: 'admin@quickfix.local',
    phone: '0300-0000001',
    passwordHash: adminPassHash,
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
  const adminRes = await db.collection('users').insertOne(adminUser);
  console.log('Created Admin:', adminUser.email);

  // 2. Create Customers
  const customerAhmad = {
    name: 'Ahmad Khan',
    email: 'ahmad@quickfix.local',
    phone: '0300-1112233',
    passwordHash: custPassHash,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
  const customerSara = {
    name: 'Sara Malik',
    email: 'sara@quickfix.local',
    phone: '0300-4445566',
    passwordHash: custPassHash,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
  const ahmadRes = await db.collection('users').insertOne(customerAhmad);
  const saraRes = await db.collection('users').insertOne(customerSara);
  console.log('Created Customers: ahmad@quickfix.local, sara@quickfix.local');

  // 3. Verified Technicians in Lahore
  const techniciansData = [
    {
      name: 'Tariq Mehmood',
      email: 'tariq.plumber@quickfix.local',
      phone: '0301-5551001',
      services: ['plumbing'],
      skills: ['PPRC Pipe Jointing', 'Sanitary Fitting', 'Leak Detection', 'Geyser Maintenance'],
      experienceYears: 12,
      cnic: '35201-1928374-1',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 38,
      completedJobs: 42,
      serviceArea: 'Gulberg (Central Lahore)',
      location: {
        type: 'Point',
        coordinates: [74.3436, 31.5204],
        address: 'Main Boulevard, Gulberg, Lahore',
      },
      availability: 'AVAILABLE_NOW',
      emergencyAvailable: true,
      priceEstimateMin: 1500,
      priceEstimateMax: 3000,
      bio: 'Master certified plumber with 12 years experience across commercial & residential properties in Gulberg and central Lahore.',
    },
    {
      name: 'Usman Ali',
      email: 'usman.electric@quickfix.local',
      phone: '0302-5551002',
      services: ['electrical'],
      skills: ['DB Circuit Breaker Faults', 'Short Circuit Triage', 'UPS & Inverter Wiring', 'Ceiling Fixtures'],
      experienceYears: 9,
      cnic: '35201-9876543-3',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 45,
      completedJobs: 51,
      serviceArea: 'DHA Phase 5 & 6',
      location: {
        type: 'Point',
        coordinates: [74.3985, 31.4728],
        address: 'Commercial Area, DHA Phase 5, Lahore',
      },
      availability: 'AVAILABLE_NOW',
      emergencyAvailable: true,
      priceEstimateMin: 1200,
      priceEstimateMax: 2800,
      bio: 'Certified electrician specializing in rapid fault-finding, breaker tripping, and clean wiring throughout DHA & Cantt.',
    },
    {
      name: 'Muhammad Rashid',
      email: 'rashid.ac@quickfix.local',
      phone: '0303-5551003',
      services: ['ac_repair'],
      skills: ['Inverter PCB Diagnosis', 'Refrigerant R410 Gas Refill', 'Master Jet Wash Service', 'Compressor Repair'],
      experienceYears: 8,
      cnic: '35201-4455667-7',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 52,
      completedJobs: 58,
      serviceArea: 'Model Town',
      location: {
        type: 'Point',
        coordinates: [74.3218, 31.4883],
        address: 'Link Road, Model Town, Lahore',
      },
      availability: 'AVAILABLE_NOW',
      emergencyAvailable: true,
      priceEstimateMin: 2000,
      priceEstimateMax: 4000,
      bio: 'Factory-trained HVAC technician for Daikin, Gree, Haier, and Kenwood inverter split AC units.',
    },
    {
      name: 'Bilal Hussain',
      email: 'bilal.plumber@quickfix.local',
      phone: '0304-5551004',
      services: ['plumbing'],
      skills: ['Drain Unblocking', 'Water Tank Cleaning', 'Water Motor Pump Repair', 'Faucet Repairs'],
      experienceYears: 6,
      cnic: '35201-2233445-5',
      verificationStatus: 'VERIFIED',
      rating: 4.7,
      reviewCount: 24,
      completedJobs: 29,
      serviceArea: 'Johar Town',
      location: {
        type: 'Point',
        coordinates: [74.2796, 31.4697],
        address: 'Khayaban-e-Firdousi, Johar Town, Lahore',
      },
      availability: 'AVAILABLE_LATER',
      emergencyAvailable: false,
      priceEstimateMin: 1500,
      priceEstimateMax: 2800,
      bio: 'Reliable plumber available for scheduled home repairs and emergency unblocking in Johar Town & Faisal Town.',
    },
    {
      name: 'Zeeshan Akram',
      email: 'zeeshan.ac@quickfix.local',
      phone: '0305-5551005',
      services: ['ac_repair'],
      skills: ['Indoor Leak Repair', 'Capacitor Replacement', 'Gas Leak Brazing', 'Chemical Wash'],
      experienceYears: 7,
      cnic: '35201-3344556-9',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 19,
      completedJobs: 22,
      serviceArea: 'Lahore Cantt',
      location: {
        type: 'Point',
        coordinates: [74.3854, 31.5392],
        address: 'Saddar Bazar, Cantt, Lahore',
      },
      availability: 'AVAILABLE_NOW',
      emergencyAvailable: true,
      priceEstimateMin: 2200,
      priceEstimateMax: 4500,
      bio: '5-star rated AC specialist serving Cantt, Cavalary Ground, and Gulberg with top quality diagnostic tools.',
    },
    {
      name: 'Hamza Farooq',
      email: 'hamza.electric@quickfix.local',
      phone: '0306-5551006',
      services: ['electrical'],
      skills: ['Earthing System Check', 'LED & Chandelier Installation', 'Phase Changeover Switches'],
      experienceYears: 5,
      cnic: '35201-7788990-1',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 31,
      completedJobs: 36,
      serviceArea: 'Faisal Town',
      location: {
        type: 'Point',
        coordinates: [74.3039, 31.4877],
        address: 'Kotha Pind Road, Faisal Town, Lahore',
      },
      availability: 'AVAILABLE_NOW',
      emergencyAvailable: true,
      priceEstimateMin: 1000,
      priceEstimateMax: 2500,
      bio: 'Friendly and precise domestic electrician. Fast response in Faisal Town, Garden Town, and Model Town.',
    },
  ];

  const createdTechIds: ObjectId[] = [];

  for (const t of techniciansData) {
    const userDoc = {
      name: t.name,
      email: t.email,
      phone: t.phone,
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const uRes = await db.collection('users').insertOne(userDoc);
    const techDoc = {
      ...t,
      userId: uRes.insertedId,
      createdAt: now,
      updatedAt: now,
    };
    const tRes = await db.collection('technicians').insertOne(techDoc);
    createdTechIds.push(tRes.insertedId);
  }
  console.log(`Created ${techniciansData.length} verified technicians in Lahore.`);

  // 4. Pending Technicians for Admin Verification Review
  const pendingApplicants = [
    {
      name: 'Kamran Butt',
      email: 'kamran.butt@quickfix.local',
      phone: '0307-8889900',
      services: ['plumbing'],
      skills: ['Sanitary pipe replacement', 'Water tank fitting'],
      experienceYears: 4,
      cnic: '35201-5566778-9',
      verificationStatus: 'PENDING',
      verificationDocuments: {
        adminNotes: 'Submitted National ID card scan and diploma. Awaiting admin review.',
      },
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      serviceArea: 'Wapda Town',
      location: {
        type: 'Point',
        coordinates: [74.2589, 31.4428],
        address: 'Wapda Town Roundabout, Lahore',
      },
      availability: 'OFFLINE',
      emergencyAvailable: false,
      priceEstimateMin: 1500,
      priceEstimateMax: 3000,
      bio: 'Plumbing technician applicant seeking verification on QuickFix.',
    },
    {
      name: 'Naveed Qureshi',
      email: 'naveed.ac@quickfix.local',
      phone: '0308-1122998',
      services: ['ac_repair'],
      skills: ['Split AC gas refill', 'General servicing'],
      experienceYears: 6,
      cnic: '35201-9988776-5',
      verificationStatus: 'PENDING',
      verificationDocuments: {
        adminNotes: 'Awaiting phone interview and skill certificate confirmation.',
      },
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      serviceArea: 'Shadman',
      location: {
        type: 'Point',
        coordinates: [74.3289, 31.5381],
        address: 'Jail Road, Shadman, Lahore',
      },
      availability: 'OFFLINE',
      emergencyAvailable: false,
      priceEstimateMin: 2000,
      priceEstimateMax: 4000,
      bio: 'Experienced HVAC technician applying for onboarding.',
    },
  ];

  for (const p of pendingApplicants) {
    const userDoc = {
      name: p.name,
      email: p.email,
      phone: p.phone,
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    const uRes = await db.collection('users').insertOne(userDoc);
    await db.collection('technicians').insertOne({
      ...p,
      userId: uRes.insertedId,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log('Created 2 pending technician applications for admin review.');

  // 5. Admin Settings with 15% Platform Commission
  await db.collection('adminSettings').insertOne({
    commissionRate: 0.15,
    launchCity: 'Lahore',
    emergencyFeeMultiplier: 1.5,
    supportedCategories: ['plumbing', 'electrical', 'ac_repair'],
    contactPhone: '+92 300 1234567',
    contactEmail: 'support@quickfix.pk',
    updatedAt: now,
    auditLogs: [
      {
        adminId: adminRes.insertedId.toString(),
        action: 'PLATFORM_INITIALIZATION',
        details: 'QuickFix Lahore platform launched with 15% standard commission rate.',
        timestamp: now,
      },
    ],
  });
  console.log('Initialized platform admin settings (commission: 15%).');

  // 6. Create sample completed booking with review for Tariq Mehmood
  const tariqTech = await db.collection('technicians').findOne({ name: 'Tariq Mehmood' });
  if (tariqTech) {
    const sampleBooking = {
      bookingCode: 'QF-782190',
      customerId: ahmadRes.insertedId,
      customerName: 'Ahmad Khan',
      customerPhone: '0300-1112233',
      technicianId: tariqTech._id,
      technicianName: tariqTech.name,
      technicianPhone: tariqTech.phone,
      serviceRequestId: new ObjectId(),
      serviceCategory: 'plumbing',
      problemType: 'water_leak',
      description: 'Severe water pipe leaking under kitchen counter.',
      urgency: 'NORMAL',
      address: 'House 42, Block H, Gulberg II, Lahore',
      status: 'PAID',
      estimatedPriceMin: 1500,
      estimatedPriceMax: 3000,
      finalPrice: 2200,
      commissionRate: 0.15,
      commissionAmount: 330,
      technicianAmount: 1870,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      acceptedAt: new Date(Date.now() - 86400000),
      arrivedAt: new Date(Date.now() - 82800000),
      startedAt: new Date(Date.now() - 79200000),
      completedAt: new Date(Date.now() - 72000000),
      paidAt: new Date(Date.now() - 71000000),
      createdAt: new Date(Date.now() - 90000000),
      updatedAt: new Date(Date.now() - 71000000),
    };
    const bRes = await db.collection('bookings').insertOne(sampleBooking);

    // Add review
    await db.collection('reviews').insertOne({
      bookingId: bRes.insertedId,
      customerId: ahmadRes.insertedId,
      customerName: 'Ahmad Khan',
      technicianId: tariqTech._id,
      rating: 5,
      comment: 'Tariq arrived punctually with professional tools and replaced the damaged PPRC elbow cleanly. Highly recommended!',
      createdAt: new Date(Date.now() - 70000000),
    });
    console.log('Created sample completed booking & review.');
  }

  await client.close();
  console.log('\n--- SEED COMPLETE ---');
  console.log('Test Accounts:');
  console.log('  Admin:       admin@quickfix.local      / AdminPass123!');
  console.log('  Customer:    ahmad@quickfix.local      / CustomerPass123!');
  console.log('  Customer 2:  sara@quickfix.local       / CustomerPass123!');
  console.log('  Plumber:     tariq.plumber@quickfix.local / TechPass123!');
  console.log('  Electrician: usman.electric@quickfix.local / TechPass123!');
  console.log('  AC Tech:     rashid.ac@quickfix.local  / TechPass123!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
