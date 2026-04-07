const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Inventory = require('./models/Inventory');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Inventory.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin Owner',
      email: 'admin@cecilia.com',
      password: 'admin123',
      role: 'admin',
      phone: '+254700000000'
    });

    // Create employee users
    const employee1 = await User.create({
      name: 'Jane Smith',
      email: 'jane@cecilia.com',
      password: 'employee123',
      role: 'employee',
      phone: '+254700000001'
    });

    const employee2 = await User.create({
      name: 'Mary Johnson',
      email: 'mary@cecilia.com',
      password: 'employee123',
      role: 'employee',
      phone: '+254700000002'
    });

    // Create sample inventory
    const inventoryItems = [
      {
        itemName: 'Elegant Summer Dress',
        category: 'Dress',
        buyingPrice: 800,
        sellingPrice: 1500,
        quantity: 25,
        size: 'M',
        color: 'Floral Blue',
        supplier: 'Nairobi Fashion Hub'
      },
      {
        itemName: 'Classic White Blouse',
        category: 'Blouse',
        buyingPrice: 500,
        sellingPrice: 950,
        quantity: 30,
        size: 'S',
        color: 'White',
        supplier: 'City Suppliers'
      },
      {
        itemName: 'Slim Fit Jeans',
        category: 'Jeans',
        buyingPrice: 1000,
        sellingPrice: 1800,
        quantity: 20,
        size: 'L',
        color: 'Dark Blue',
        supplier: 'Denim Co.'
      },
      {
        itemName: 'Casual T-Shirt',
        category: 'T-shirt',
        buyingPrice: 300,
        sellingPrice: 600,
        quantity: 50,
        size: 'M',
        color: 'Black',
        supplier: 'Basic Wear Ltd'
      },
      {
        itemName: 'Formal Jacket',
        category: 'Jacket',
        buyingPrice: 2000,
        sellingPrice: 3500,
        quantity: 10,
        size: 'L',
        color: 'Navy Blue',
        supplier: 'Premium Fashion'
      },
      {
        itemName: 'Pleated Skirt',
        category: 'Skirt',
        buyingPrice: 600,
        sellingPrice: 1100,
        quantity: 15,
        size: 'S',
        color: 'Beige',
        supplier: 'Nairobi Fashion Hub'
      }
    ];

    await Inventory.insertMany(inventoryItems);

    console.log('Data seeded successfully!');
    console.log('\nAdmin Login:');
    console.log('Email: admin@cecilia.com');
    console.log('Password: admin123\n');
    console.log('Employee Login:');
    console.log('Email: jane@cecilia.com');
    console.log('Password: employee123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
