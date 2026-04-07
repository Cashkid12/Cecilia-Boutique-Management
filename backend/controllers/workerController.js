const User = require('../models/User');
const Sale = require('../models/Sale');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Private (Admin only)
exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'employee' }).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add worker
// @route   POST /api/workers
// @access  Private (Admin only)
exports.addWorker = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Worker already exists' });
    }

    const worker = await User.create({
      name,
      email,
      password,
      phone,
      role: 'employee'
    });

    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private (Admin only)
exports.updateWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.name = req.body.name || worker.name;
    worker.email = req.body.email || worker.email;
    worker.phone = req.body.phone || worker.phone;
    worker.isActive = req.body.isActive !== undefined ? req.body.isActive : worker.isActive;

    if (req.body.password) {
      worker.password = req.body.password;
    }

    const updatedWorker = await worker.save();
    res.json({
      _id: updatedWorker._id,
      name: updatedWorker.name,
      email: updatedWorker.email,
      phone: updatedWorker.phone,
      role: updatedWorker.role,
      isActive: updatedWorker.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private (Admin only)
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Worker removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker performance
// @route   GET /api/workers/:id/performance
// @access  Private (Admin only)
exports.getWorkerPerformance = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // Today's sales
    const todaySales = await Sale.aggregate([
      { $match: { worker: worker._id, saleDate: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItems: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Weekly sales
    const weeklySales = await Sale.aggregate([
      { $match: { worker: worker._id, saleDate: { $gte: startOfWeek } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItems: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // All time sales
    const allTimeSales = await Sale.aggregate([
      { $match: { worker: worker._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
          totalItems: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      worker: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        isActive: worker.isActive
      },
      today: todaySales[0] || { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 },
      weekly: weeklySales[0] || { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 },
      allTime: allTimeSales[0] || { totalSales: 0, totalProfit: 0, totalItems: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
