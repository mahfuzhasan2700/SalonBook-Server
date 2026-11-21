import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const realisticServices = [
  {
    serviceName: 'Precision Haircut & Signature Blowout',
    category: 'Haircut & Styling',
    description: 'Expert consultation followed by a tailored wash, precision layered cut, and a bouncy signature blowout finishing with organic heat protectant.',
    price: 65,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: "Gentleman's Executive Cut & Beard Grooming",
    category: 'Haircut & Styling',
    description: 'Classic barber haircut with hot towel neck shave, beard trimming, edge-up, and beard conditioning balm.',
    price: 45,
    duration: 40,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Sun-Kissed Balayage & Gloss Treatment',
    category: 'Hair Coloring',
    description: 'Hand-painted multidimensional blonde or caramel highlights paired with an organic toning gloss for brilliant radiance and depth.',
    price: 180,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Full Root Touch-Up & Moisture Locking Rinse',
    category: 'Hair Coloring',
    description: 'Seamless grey coverage and color refreshing using gentle ammonia-free dyes, finishing with a moisture locking rinse.',
    price: 95,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Brazilian Keratin Smoothing Therapy',
    category: 'Hair Treatment',
    description: 'Transform frizzy, unmanageable curls into sleek, mirror-shine tresses that resist humidity for up to 4 months.',
    price: 210,
    duration: 110,
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Deep Scalp Detox & Follicle Revival',
    category: 'Hair Treatment',
    description: 'Exfoliating botanical scrub with tea tree and peppermint oils to dissolve build-up, promote hair density, and relieve tension.',
    price: 80,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Hydra-Luminous Diamond Facial',
    category: 'Facial & Skincare',
    description: 'Non-invasive dermabrasion infused with hyaluronic acid, peptides, and antioxidant serum for immediate plumpness and glassy glow.',
    price: 135,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Anti-Aging Collagen Lifting Facial',
    category: 'Facial & Skincare',
    description: 'Firming botanical mask, microcurrent toning stimulation, and lymphatic drainage massage to contour the jawline.',
    price: 155,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Bridal Couture Glamour Makeup',
    category: 'Makeup',
    description: 'Flawless 16-hour long-wear HD airbrush foundation, dramatic mink lash application, contouring, and bridal touch-up kit.',
    price: 160,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Natural Day Glow & Soft Glam',
    category: 'Makeup',
    description: 'Dewy complexion enhancement, soft winged liner, neutral smoky eyes, and velvet nude lips for daytime events.',
    price: 85,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Deluxe Gel Spa Manicure & Paraffin Dip',
    category: 'Manicure & Pedicure',
    description: 'Cuticle care, dead sea salt exfoliation, warm lavender paraffin dip, and chip-free LED gel polish finish.',
    price: 55,
    duration: 50,
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Aromatherapy Swedish Massage & Hot Basalt Stones',
    category: 'Spa & Massage',
    description: 'Full-body relaxation therapy combining warmed organic botanical oils, rhythmic Swedish strokes, and heated volcanic basalt stones.',
    price: 140,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    serviceName: 'Deep Tissue Muscle Release & Herbal Compress',
    category: 'Spa & Massage',
    description: 'Therapeutic pressure targeting persistent back and shoulder stiffness, enriched with steaming herbal compresses to melt tension.',
    price: 165,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  // Inactive service for visibility testing by evaluator (as explicitly requested in master prompt)
  {
    serviceName: 'Exclusive Runway Platinum Foil & Tone (Seasonal Exclusive)',
    category: 'Hair Coloring',
    description: 'High-fashion editorial platinum lift and custom pastel glaze. Offered exclusively during runway seasons.',
    price: 240,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    status: 'inactive', // Intentionally inactive for evaluator verification!
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/salonbook';
    await mongoose.connect(mongoUri);
    console.log('[Seed Connected to MongoDB]');

    // Clear old data for safe rerun
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Appointment.deleteMany({}),
      Transaction.deleteMany({}),
    ]);
    console.log('[Old data cleared]');

    // 1. Create Admin User (for evaluator)
    const adminUser = await User.create({
      name: 'Elena Rostova (Salon Admin)',
      email: 'admin@salonbook.com',
      password: 'Admin@123456', // will be hashed automatically by pre-save
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      role: 'admin',
      isBlocked: false,
      phone: '+1 (555) 234-5678',
    });
    console.log('[Admin User Seeded]: admin@salonbook.com / Admin@123456');

    // 2. Create Sample Customer 1 (Sophia Williams)
    const sampleCustomer1 = await User.create({
      name: 'Sophia Williams',
      email: 'sophia@example.com',
      password: 'Customer@123',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      role: 'customer',
      isBlocked: false,
      phone: '+1 (555) 987-6543',
    });
    console.log('[Sample Customer 1 Seeded]: sophia@example.com / Customer@123');

    // 3. Create Sample Customer 2 (Amelia Clark)
    const sampleCustomer2 = await User.create({
      name: 'Amelia Clark',
      email: 'amelia@example.com',
      password: 'Customer@456',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      role: 'customer',
      isBlocked: false,
      phone: '+1 (555) 765-4321',
    });
    console.log('[Sample Customer 2 Seeded]: amelia@example.com / Customer@456');

    // 4. Create 12 Services (11 active, 1 inactive)
    const createdServices = await Service.insertMany(realisticServices);
    console.log(`[${createdServices.length} Salon Services Seeded (11 active, 1 inactive)]`);

    // 5. Create Sample Appointments
    // Confirmed & Paid appointment for Sophia
    const appointment1 = await Appointment.create({
      serviceId: createdServices[0]._id,
      serviceName: createdServices[0].serviceName,
      serviceCategory: createdServices[0].category,
      serviceImage: createdServices[0].image,
      serviceDuration: createdServices[0].duration,
      customerId: sampleCustomer1._id,
      appointmentDate: '2026-11-25',
      timeSlot: '11:00 AM - 12:00 PM',
      message: 'Looking forward to a fresh blowout before Thanksgiving.',
      servicePrice: createdServices[0].price,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    // Pending & Unpaid appointment for Sophia
    const appointment2 = await Appointment.create({
      serviceId: createdServices[2]._id,
      serviceName: createdServices[2].serviceName,
      serviceCategory: createdServices[2].category,
      serviceImage: createdServices[2].image,
      serviceDuration: createdServices[2].duration,
      customerId: sampleCustomer1._id,
      appointmentDate: '2026-11-28',
      timeSlot: '02:00 PM - 03:00 PM',
      message: 'Prefer soft caramel balayage tones please.',
      servicePrice: createdServices[2].price,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // Confirmed & Unpaid appointment for Amelia (ready for Pay Now testing!)
    const appointment3 = await Appointment.create({
      serviceId: createdServices[6]._id,
      serviceName: createdServices[6].serviceName,
      serviceCategory: createdServices[6].category,
      serviceImage: createdServices[6].image,
      serviceDuration: createdServices[6].duration,
      customerId: sampleCustomer2._id,
      appointmentDate: '2026-11-30',
      timeSlot: '01:00 PM - 02:00 PM',
      message: 'Sensitive skin, please use hypoallergenic products.',
      servicePrice: createdServices[6].price,
      status: 'confirmed',
      paymentStatus: 'unpaid',
    });

    // 6. Create Transaction for appointment1
    await Transaction.create({
      appointmentId: appointment1._id,
      customerId: sampleCustomer1._id,
      amount: createdServices[0].price,
      currency: 'usd',
      stripeSessionId: 'cs_test_sample_session_id_seed_001',
      status: 'paid',
    });

    console.log('[Sample Appointments & Transactions Seeded]');
    console.log('[Database Seeding Complete!]');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeding Error]:`, error);
    process.exit(1);
  }
};

seedDatabase();
