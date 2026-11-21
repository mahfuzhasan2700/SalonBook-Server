import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be a positive number'],
    },
    duration: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
      min: [1, 'Duration must be a positive number'],
    },
    image: {
      type: String,
      required: [true, 'Service image is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast search by name & category
serviceSchema.index({ serviceName: 'text', category: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
