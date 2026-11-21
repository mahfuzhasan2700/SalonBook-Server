import User from '../models/User.js';
import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import Transaction from '../models/Transaction.js';

// @desc    Get Admin Dashboard Overview Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalActiveServices,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      successfulPayments,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Service.countDocuments({ status: 'active' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Transaction.countDocuments({ status: 'paid' }),
      Transaction.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalActiveServices,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        successfulPayments,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate admin statistics.',
    });
  }
};

// @desc    Get Customer Dashboard Overview Statistics
// @route   GET /api/customer/stats
// @access  Private/Customer
export const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user._id;

    const [totalAppointments, pending, confirmed, cancelled] = await Promise.all([
      Appointment.countDocuments({ customerId }),
      Appointment.countDocuments({ customerId, status: 'pending' }),
      Appointment.countDocuments({ customerId, status: 'confirmed' }),
      Appointment.countDocuments({ customerId, status: 'cancelled' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalAppointments,
        pending,
        confirmed,
        cancelled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer statistics.',
    });
  }
};

// @desc    Get all registered customers for Admin
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users.',
    });
  }
};

// @desc    Toggle block status of a customer
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block administrator accounts.',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `Customer account has been successfully ${user.isBlocked ? 'suspended' : 'reactivated'}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status.',
    });
  }
};
