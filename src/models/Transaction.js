import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },
    currency: {
      type: String,
      default: 'usd',
    },
    stripeSessionId: {
      type: String,
      required: [true, 'Stripe session ID is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['paid', 'failed'],
      default: 'paid',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
