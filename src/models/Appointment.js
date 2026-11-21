import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    message: {
      type: String,
      default: '',
    },
    servicePrice: {
      type: Number,
      required: [true, 'Service price is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query active appointments by date and slot
appointmentSchema.index({ appointmentDate: 1, timeSlot: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
