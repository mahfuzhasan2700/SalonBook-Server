import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
    },
    // Preserve service display snapshots for permanent audit history
    serviceName: {
      type: String,
      default: '',
    },
    serviceCategory: {
      type: String,
      default: '',
    },
    serviceImage: {
      type: String,
      default: '',
    },
    serviceDuration: {
      type: Number,
      default: 60,
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

// Atomic partial unique index: exactly one pending or confirmed appointment per date and slot across the salon
// Cancellation sets status to 'cancelled', which immediately releases the slot!
appointmentSchema.index(
  { appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
