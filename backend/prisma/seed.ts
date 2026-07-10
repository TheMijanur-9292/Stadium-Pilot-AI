import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting normalized database seeding...');

  // 1. Clear existing data
  await prisma.announcement.deleteMany();
  await prisma.crowdZone.deleteMany();
  await prisma.transportationHub.deleteMany();
  await prisma.emergencyPoint.deleteMany();
  await prisma.foodVendor.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const organizerPassword = await bcrypt.hash('Organizer@123', 10);
  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const volunteerPassword = await bcrypt.hash('Volunteer@123', 10);
  const fanPassword = await bcrypt.hash('Fan@123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@stadiumpilot.com',
      password: adminPassword,
      fullName: 'Arthur Admin',
      role: Role.ADMIN,
      preferredLanguage: 'English',
      accessibilityPreference: 'None',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@stadiumpilot.com',
      password: organizerPassword,
      fullName: 'Oliver Organizer',
      role: Role.ORGANIZER,
      preferredLanguage: 'English',
      accessibilityPreference: 'None',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@stadiumpilot.com',
      password: staffPassword,
      fullName: 'Sarah Staff',
      role: Role.VENUE_STAFF,
      preferredLanguage: 'Spanish',
      accessibilityPreference: 'None',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    },
  });

  const volunteer = await prisma.user.create({
    data: {
      email: 'volunteer@stadiumpilot.com',
      password: volunteerPassword,
      fullName: 'Valerie Volunteer',
      role: Role.VOLUNTEER,
      preferredLanguage: 'English',
      accessibilityPreference: 'None',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    },
  });

  const fan = await prisma.user.create({
    data: {
      email: 'fan@stadiumpilot.com',
      password: fanPassword,
      fullName: 'Frank Fan',
      role: Role.FAN,
      preferredLanguage: 'English',
      accessibilityPreference: 'Wheelchair',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    },
  });

  console.log('👤 Created users for all roles.');

  // 4. Create Venues
  const venue1 = await prisma.venue.create({
    data: {
      stadiumName: 'MetLife Stadium',
      city: 'New York/New Jersey',
      country: 'USA',
      capacity: 82500,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      stadiumName: 'SoFi Stadium',
      city: 'Los Angeles',
      country: 'USA',
      capacity: 70000,
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      stadiumName: 'BC Place',
      city: 'Vancouver',
      country: 'Canada',
      capacity: 54000,
    },
  });

  console.log('🏟️ Created venues.');

  // 5. Create Facilities for MetLife Stadium
  await prisma.facility.createMany({
    data: [
      {
        venueId: venue1.id,
        type: 'RESTROOM',
        name: 'Restroom Block A',
        floor: 'Concourse Level 1',
        location: 'Near Section 112',
      },
      {
        venueId: venue1.id,
        type: 'PRAYER_ROOM',
        name: 'Interfaith Prayer Room',
        floor: 'Concourse Level 1',
        location: 'Near Section 130',
      },
      {
        venueId: venue1.id,
        type: 'MEDICAL_CENTER',
        name: 'First Aid Station 1',
        floor: 'Concourse Level 1',
        location: 'Near Section 110',
      },
      {
        venueId: venue1.id,
        type: 'MERCHANDISE',
        name: 'World Cup Store Main',
        floor: 'Concourse Level 1',
        location: 'Entrance Lobby',
      },
    ],
  });

  console.log('🚻 Created facilities.');

  // 6. Food Vendors
  await prisma.foodVendor.createMany({
    data: [
      {
        venueId: venue1.id,
        name: 'Stadia Burgers',
        category: 'Burgers & Fries',
        priceRange: '$$',
        halal: false,
        vegetarian: true,
        vegan: true,
      },
      {
        venueId: venue1.id,
        name: 'Taco World Cup',
        category: 'Mexican Street Food',
        priceRange: '$',
        halal: true,
        vegetarian: true,
        vegan: true,
      },
      {
        venueId: venue1.id,
        name: 'Green Corner',
        category: 'Healthy Bowls & Salads',
        priceRange: '$$',
        halal: true,
        vegetarian: true,
        vegan: true,
      },
    ],
  });

  console.log('🍔 Created food vendors.');

  // 7. Emergency Points
  await prisma.emergencyPoint.createMany({
    data: [
      {
        venueId: venue1.id,
        type: 'FIRST_AID',
        location: 'Section 110',
      },
      {
        venueId: venue1.id,
        type: 'SECURITY_POST',
        location: 'Gate B Entrance Lobby',
      },
      {
        venueId: venue1.id,
        type: 'FIRE_EXIT',
        location: 'Behind Section 114',
      },
      {
        venueId: venue1.id,
        type: 'SOS_PHONE',
        location: 'Section 112 Lobby',
      },
    ],
  });

  console.log('🚨 Created emergency points.');

  // 8. Transportation Hubs
  await prisma.transportationHub.createMany({
    data: [
      {
        venueId: venue1.id,
        type: 'BUS_STOP',
        location: 'Lot K Shuttle Station',
      },
      {
        venueId: venue1.id,
        type: 'SUBWAY_STATION',
        location: 'Stadium Transit Center',
      },
      {
        venueId: venue1.id,
        type: 'TAXI_STAND',
        location: 'Gate C Ride-Share Zone',
      },
      {
        venueId: venue1.id,
        type: 'PARKING_LOT',
        location: 'MetLife Parking Lot A',
      },
    ],
  });

  console.log('🚌 Created transportation hubs.');

  // 9. Crowd Zones
  await prisma.crowdZone.createMany({
    data: [
      {
        venueId: venue1.id,
        section: 'Gate A Entry Lobby',
        crowdLevel: 'HIGH',
      },
      {
        venueId: venue1.id,
        section: 'Gate B Entry Lobby',
        crowdLevel: 'LOW',
      },
      {
        venueId: venue1.id,
        section: 'Concourse Section 112',
        crowdLevel: 'CRITICAL',
      },
      {
        venueId: venue1.id,
        section: 'Concourse Section 104',
        crowdLevel: 'MEDIUM',
      },
    ],
  });

  console.log('📡 Created crowd zones.');

  // 10. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Transit Congestion Alert',
        description: 'Heavy passenger traffic at Stadium Transit Center. Shuttle buses are running every 3 minutes as an alternative.',
        priority: 'HIGH',
      },
      {
        title: 'Lost Child Protocol Active',
        description: 'A child wearing an England jersey has been reported lost near Gate B. Please report any details to nearest staff.',
        priority: 'CRITICAL',
      },
    ],
  });

  console.log('📢 Created announcements.');
  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
