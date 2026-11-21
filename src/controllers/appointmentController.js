import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';

// @desc    Submit a new appointment booking request
// @route   POST /api/appointments
// @access  Private/Customer
export const createAppointment = async (req, res) => {
  try {
    const { serviceId, appointmentDate, timeSlot, message } = req.body;

    if (!serviceId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Service, appointment date, and time slot are required.',
      });
    }

    // 1. Verify service exists and is active
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'The requested salon service does not exist.',
      });
    }

    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This salon service is currently unavailable for booking.',
      });
    }

    // 2. Prevent duplicate active appointments for the same date and time slot
    const existingConflict = await Appointment.findOne({
      appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `The time slot (${timeSlot}) on ${appointmentDate} is already reserved. Please select another time or date.`,
      });
    }

    // 3. Create appointment with default status: pending, paymentStatus: unpaid
    const appointment = await Appointment.create({
      serviceId,
      customerId: req.user._id,
      appointmentDate,
      timeSlot,
      message: message || '',
      servicePrice: service.price, // ensure price comes from database
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('serviceId', 'serviceName category price duration image')
      .populate('customerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booking request successfully submitted.',
      appointment: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit appointment request.',
    });
  }
};

// @desc    Get logged in customer's appointments
// @route   GET /api/appointments/my
// @access  Private/Customer
export const getCustomerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user._id })
      .populate('serviceId', 'serviceName category price duration image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve your appointments.',
    });
  }
};

// @desc    Customer cancels pending appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private/Customer
export const cancelCustomerAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Customer can only cancel their own appointments
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this appointment.',
      });
    }

    // Rule: Customer cannot cancel an already confirmed or cancelled appointment
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already ${appointment.status}. Please contact salon administration directly.`,
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment request has been cancelled.',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel appointment.',
    });
  }
};

// @desc    Get all appointments for Admin
// @route   GET /api/appointments/admin/all
// @access  Private/Admin
export const getAdminAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'serviceName category price duration image')
      .populate('customerId', 'name email phone image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointment requests.',
    });
  }
};

// @desc    Admin confirm or cancel appointment
// @route   PATCH /api/appointments/admin/:id/status
// @access  Private/Admin
export const updateAppointmentStatusByAdmin = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "confirmed" or "cancelled".',
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Rule: "Only pending appointments can be confirmed"
    if (status === 'confirmed' && appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm an appointment that is already ${appointment.status}. Only pending appointments can be confirmed.`,
      });
    }

    appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('serviceId', 'serviceName category price duration image')
      .populate('customerId', 'name email phone');

    res.json({
      success: true,
      message: `Appointment successfully marked as ${status}.`,
      appointment: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment status.',
    });
  }
};
