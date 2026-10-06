const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const User = require('../models/User');
const { Counter } = require('../models/Counter');
const connectDB = require('../config/db');

const initialProducts = [
  {
    name: 'Basmati Rice Premium (25kg)',
    category: 'Grains & Rice',
    price: 1850,
    stock: 50,
    unit: '25kg bag',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Aged long grain aromatic Basmati rice, wholesale export quality packaging.',
    outOfStock: false
  },
  {
    name: 'Refined Mustard Oil Tin (15L)',
    category: 'Edible Oils',
    price: 2150,
    stock: 35,
    unit: '15L tin',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    description: 'Cold-pressed pure kachi ghani mustard oil for commercial kitchens & grocery stores.',
    outOfStock: false
  },
  {
    name: 'Sunflower Refined Oil Pouch Carton (12 x 1L)',
    category: 'Edible Oils',
    price: 1480,
    stock: 28,
    unit: 'Carton (12L)',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=600&q=80',
    description: '12 packets of 1 Litre fortified refined sunflower oil.',
    outOfStock: false
  },
  {
    name: 'Whole Wheat Chakki Atta (50kg)',
    category: 'Flour & Atta',
    price: 1650,
    stock: 40,
    unit: '50kg sack',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: '100% whole grain stone-ground chakki fresh wheat atta.',
    outOfStock: false
  },
  {
    name: 'Refined White Sugar (50kg)',
    category: 'Sugar & Salt',
    price: 2100,
    stock: 22,
    unit: '50kg bag',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80',
    description: 'Grade-M sparkling white crystal sugar wholesale sack.',
    outOfStock: false
  },
  {
    name: 'Toor Dal Desi Unpolished (30kg)',
    category: 'Pulses & Lentils',
    price: 3600,
    stock: 18,
    unit: '30kg bag',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    description: 'Farm fresh unpolished toor dal with high protein content.',
    outOfStock: false
  },
  {
    name: 'Iodized Crystal Salt Bag (50kg)',
    category: 'Sugar & Salt',
    price: 450,
    stock: 6, // Low stock demo!
    unit: '50kg sack',
    minOrderQty: 2,
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80',
    description: 'Vacuum evaporated iodized salt for bulk catering and food manufacturing.',
    outOfStock: false
  },
  {
    name: 'Kashmiri Red Chilli Powder Box (10kg)',
    category: 'Spices',
    price: 3200,
    stock: 0, // Out of stock demo!
    unit: '10kg box',
    minOrderQty: 1,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    description: 'Deep red color, mild pungency Kashmiri mirch powder in bulk corrugated carton.',
    outOfStock: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing products and counters...');
    await Product.deleteMany();

    console.log('Seeding wholesale products...');
    const createdProducts = await Product.insertMany(initialProducts);
    console.log(`✓ Inserted ${createdProducts.length} wholesale products`);

    // Ensure dealer user exists
    const dealerEmail = process.env.DEALER_EMAIL || 'dealer@wholesale.com';
    let dealer = await User.findOne({ email: dealerEmail });
    if (!dealer) {
      dealer = await User.create({
        name: 'Jatin Gumber (Dealer)',
        email: dealerEmail,
        phone: '+91 99999 88888',
        role: 'dealer'
      });
      console.log(`✓ Created Dealer account: ${dealerEmail}`);
    }

    // Initialize Order sequence at 1000 so first order is 1001
    const counter = await Counter.findById('orderId');
    if (!counter) {
      await Counter.create({ _id: 'orderId', seq: 1000 });
      console.log('✓ Initialized Order Counter at 1000 (Next order will be 1001)');
    }

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { initialProducts, seedData };
