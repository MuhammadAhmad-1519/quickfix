import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { TechnicianDoc, UserDoc, AdminSettingsDoc, BookingDoc, ReviewDoc, DisputeDoc, NotificationDoc } from '../types';

export interface InMemoryStore {
  users: any[];
  technicians: any[];
  serviceRequests: any[];
  bookings: any[];
  reviews: any[];
  disputes: any[];
  notifications: any[];
  adminSettings: any[];
  aiConversations: any[];
}

// Pre-seeded initial data for reliable demo mode
function initializeStore(): InMemoryStore {
  const now = new Date();
  const adminPassHash = bcrypt.hashSync('AdminPass123!', 10);
  const custPassHash = bcrypt.hashSync('CustomerPass123!', 10);
  const techPassHash = bcrypt.hashSync('TechPass123!', 10);

  const adminId = new ObjectId('650000000000000000000001');
  const ahmadId = new ObjectId('650000000000000000000002');
  const saraId = new ObjectId('650000000000000000000003');

  const tariqUserId = new ObjectId('650000000000000000000010');
  const usmanUserId = new ObjectId('650000000000000000000011');
  const rashidUserId = new ObjectId('650000000000000000000012');
  const bilalUserId = new ObjectId('650000000000000000000013');
  const zeeshanUserId = new ObjectId('650000000000000000000014');
  const hamzaUserId = new ObjectId('650000000000000000000015');

  const tariqTechId = new ObjectId('650000000000000000000020');
  const usmanTechId = new ObjectId('650000000000000000000021');
  const rashidTechId = new ObjectId('650000000000000000000022');
  const bilalTechId = new ObjectId('650000000000000000000023');
  const zeeshanTechId = new ObjectId('650000000000000000000024');
  const hamzaTechId = new ObjectId('650000000000000000000025');

  const users: UserDoc[] = [
    {
      _id: adminId,
      name: 'QuickFix Admin',
      email: 'admin@quickfix.local',
      phone: '0300-0000001',
      passwordHash: adminPassHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: ahmadId,
      name: 'Ahmad Khan',
      email: 'ahmad@quickfix.local',
      phone: '0300-1112233',
      passwordHash: custPassHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: saraId,
      name: 'Sara Malik',
      email: 'sara@quickfix.local',
      phone: '0300-4445566',
      passwordHash: custPassHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: tariqUserId,
      name: 'Tariq Mehmood',
      email: 'tariq.plumber@quickfix.local',
      phone: '0301-5551001',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: usmanUserId,
      name: 'Usman Ali',
      email: 'usman.electric@quickfix.local',
      phone: '0302-5551002',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: rashidUserId,
      name: 'Muhammad Rashid',
      email: 'rashid.ac@quickfix.local',
      phone: '0303-5551003',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: bilalUserId,
      name: 'Bilal Hussain',
      email: 'bilal.plumber@quickfix.local',
      phone: '0304-5551004',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: zeeshanUserId,
      name: 'Zeeshan Akram',
      email: 'zeeshan.ac@quickfix.local',
      phone: '0305-5551005',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: hamzaUserId,
      name: 'Hamza Farooq',
      email: 'hamza.electric@quickfix.local',
      phone: '0306-5551006',
      passwordHash: techPassHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const technicians: TechnicianDoc[] = [
    {
      _id: tariqTechId,
      userId: tariqUserId,
      name: 'Tariq Mehmood',
      phone: '0301-5551001',
      email: 'tariq.plumber@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: usmanTechId,
      userId: usmanUserId,
      name: 'Usman Ali',
      phone: '0302-5551002',
      email: 'usman.electric@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: rashidTechId,
      userId: rashidUserId,
      name: 'Muhammad Rashid',
      phone: '0303-5551003',
      email: 'rashid.ac@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: bilalTechId,
      userId: bilalUserId,
      name: 'Bilal Hussain',
      phone: '0304-5551004',
      email: 'bilal.plumber@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: zeeshanTechId,
      userId: zeeshanUserId,
      name: 'Zeeshan Akram',
      phone: '0305-5551005',
      email: 'zeeshan.ac@quickfix.local',
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
      bio: '5-star rated AC specialist serving Cantt, Cavalry Ground, and Gulberg with top quality diagnostic tools.',
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: hamzaTechId,
      userId: hamzaUserId,
      name: 'Hamza Farooq',
      phone: '0306-5551006',
      email: 'hamza.electric@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    // Pending technicians for admin review demonstration
    {
      _id: new ObjectId('650000000000000000000030'),
      userId: new ObjectId('650000000000000000000031'),
      name: 'Kamran Butt',
      phone: '0307-8889900',
      email: 'kamran.butt@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId('650000000000000000000032'),
      userId: new ObjectId('650000000000000000000033'),
      name: 'Naveed Qureshi',
      phone: '0308-1122998',
      email: 'naveed.ac@quickfix.local',
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
      createdAt: now,
      updatedAt: now,
    },
  ];

  const adminSettings: AdminSettingsDoc[] = [
    {
      _id: new ObjectId('650000000000000000000040'),
      commissionRate: 0.15,
      launchCity: 'Lahore',
      emergencyFeeMultiplier: 1.5,
      supportedCategories: ['plumbing', 'electrical', 'ac_repair'],
      contactPhone: '+92 300 1234567',
      contactEmail: 'support@quickfix.pk',
      updatedAt: now,
      auditLogs: [
        {
          adminId: adminId.toString(),
          action: 'PLATFORM_INITIALIZATION',
          details: 'QuickFix Lahore platform launched with 15% standard commission rate.',
          timestamp: now,
        },
      ],
    },
  ];

  const sampleBookingId = new ObjectId('650000000000000000000050');
  const bookings: BookingDoc[] = [
    {
      _id: sampleBookingId,
      bookingCode: 'QF-782190',
      customerId: ahmadId,
      customerName: 'Ahmad Khan',
      customerPhone: '0300-1112233',
      technicianId: tariqTechId,
      technicianName: 'Tariq Mehmood',
      technicianPhone: '0301-5551001',
      serviceRequestId: new ObjectId('650000000000000000000051'),
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
    },
  ];

  const reviews: ReviewDoc[] = [
    {
      _id: new ObjectId('650000000000000000000060'),
      bookingId: sampleBookingId,
      customerId: ahmadId,
      customerName: 'Ahmad Khan',
      technicianId: tariqTechId,
      rating: 5,
      comment: 'Tariq arrived punctually with professional tools and replaced the damaged PPRC elbow cleanly. Highly recommended!',
      createdAt: new Date(Date.now() - 70000000),
    },
  ];

  const notifications: NotificationDoc[] = [
    {
      _id: new ObjectId('650000000000000000000070'),
      userId: ahmadId,
      role: 'CUSTOMER',
      title: 'Welcome to QuickFix Lahore!',
      message: 'Need a plumber, electrician, or AC specialist? We match you with verified Lahore pros in minutes.',
      type: 'SYSTEM',
      read: false,
      createdAt: now,
    },
  ];

  return {
    users,
    technicians,
    serviceRequests: [],
    bookings,
    reviews,
    disputes: [],
    notifications,
    adminSettings,
    aiConversations: [],
  };
}

// Global in-memory singleton
declare global {
  // eslint-disable-next-line no-var
  var _quickFixMemoryStore: InMemoryStore | undefined;
}

export function getMemoryStore(): InMemoryStore {
  if (!global._quickFixMemoryStore) {
    global._quickFixMemoryStore = initializeStore();
  }
  return global._quickFixMemoryStore;
}

// Helper query matcher for in-memory collections
function matchQuery(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    const val = query[key];

    if (key === '_id') {
      const docId = doc._id?.toString();
      const targetId = val?.toString();
      if (docId !== targetId) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof ObjectId)) {
      if ('$in' in val) {
        const itemVal = doc[key];
        const stringVal = itemVal instanceof ObjectId ? itemVal.toString() : itemVal;
        const inValues = val.$in.map((v: any) => (v instanceof ObjectId ? v.toString() : v));
        if (!inValues.includes(stringVal) && !inValues.includes(itemVal)) return false;
        continue;
      }
    }

    if (Array.isArray(doc[key]) && typeof val === 'string') {
      if (!doc[key].includes(val)) return false;
      continue;
    }

    const docVal = doc[key] instanceof ObjectId ? doc[key].toString() : doc[key];
    const compVal = val instanceof ObjectId ? val.toString() : val;

    if (docVal !== compVal) return false;
  }
  return true;
}

// Minimal MongoDB-compatible collection abstraction
export function createMemoryCollection(collectionName: keyof InMemoryStore) {
  return {
    find(query: any = {}) {
      const store = getMemoryStore();
      const items = (store[collectionName] || []).filter((doc: any) => matchQuery(doc, query));
      let result = [...items];

      return {
        sort(sortObj: any) {
          const sortKey = Object.keys(sortObj || {})[0];
          const sortDir = sortKey ? sortObj[sortKey] : -1;
          if (sortKey) {
            result.sort((a, b) => {
              const aVal = a[sortKey];
              const bVal = b[sortKey];
              if (sortDir === -1) return aVal < bVal ? 1 : -1;
              return aVal > bVal ? 1 : -1;
            });
          }
          return this;
        },
        limit(count: number) {
          result = result.slice(0, count);
          return this;
        },
        async toArray() {
          return result;
        },
      };
    },

    async findOne(query: any = {}, options?: any) {
      const store = getMemoryStore();
      const item = (store[collectionName] || []).find((doc: any) => matchQuery(doc, query));
      return item ? { ...item } : null;
    },

    async insertOne(doc: any) {
      const store = getMemoryStore();
      const newDoc = {
        _id: doc._id || new ObjectId(),
        ...doc,
      };
      store[collectionName].push(newDoc);
      return { insertedId: newDoc._id };
    },

    async updateOne(query: any, update: any, options: any = {}) {
      const store = getMemoryStore();
      const index = (store[collectionName] || []).findIndex((doc: any) => matchQuery(doc, query));

      if (index === -1) {
        if (options.upsert) {
          const newDoc = {
            _id: new ObjectId(),
            ...(update.$setOnInsert || {}),
            ...(update.$set || {}),
          };
          store[collectionName].push(newDoc);
          return { matchedCount: 0, modifiedCount: 1, upsertedId: newDoc._id };
        }
        return { matchedCount: 0, modifiedCount: 0 };
      }

      const current = store[collectionName][index];
      if (update.$set) {
        Object.assign(current, update.$set);
      }
      if (update.$inc) {
        for (const k of Object.keys(update.$inc)) {
          current[k] = (current[k] || 0) + update.$inc[k];
        }
      }
      if (update.$push) {
        for (const k of Object.keys(update.$push)) {
          if (!current[k]) current[k] = [];
          if (update.$push[k]?.$each) {
            current[k].push(...update.$push[k].$each);
          } else {
            current[k].push(update.$push[k]);
          }
        }
      }

      return { matchedCount: 1, modifiedCount: 1 };
    },

    async updateMany(query: any, update: any) {
      const store = getMemoryStore();
      let modified = 0;
      for (const item of store[collectionName]) {
        if (matchQuery(item, query)) {
          if (update.$set) Object.assign(item, update.$set);
          modified++;
        }
      }
      return { matchedCount: modified, modifiedCount: modified };
    },

    async deleteMany(query: any = {}) {
      const store = getMemoryStore();
      if (Object.keys(query).length === 0) {
        store[collectionName] = [];
        return { deletedCount: 0 };
      }
      const initial = store[collectionName].length;
      store[collectionName] = store[collectionName].filter((doc: any) => !matchQuery(doc, query));
      return { deletedCount: initial - store[collectionName].length };
    },

    async countDocuments(query: any = {}) {
      const store = getMemoryStore();
      return (store[collectionName] || []).filter((doc: any) => matchQuery(doc, query)).length;
    },

    aggregate(pipeline: any[]) {
      const store = getMemoryStore();
      let data = [...store[collectionName]];

      for (const stage of pipeline) {
        if (stage.$match) {
          data = data.filter((d) => matchQuery(d, stage.$match));
        }
        if (stage.$group) {
          const result: any = { _id: null };
          for (const key of Object.keys(stage.$group)) {
            if (key === '_id') continue;
            const op = stage.$group[key];
            if (op.$sum) {
              const field = op.$sum.replace('$', '');
              result[key] = data.reduce((sum, item) => sum + (item[field] || 0), 0);
            }
          }
          data = [result];
        }
      }

      return {
        async toArray() {
          return data;
        },
      };
    },
  };
}
