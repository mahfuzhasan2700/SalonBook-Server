import Service from '../models/Service.js';

// @desc    Get all services with search, category filter, and price sort
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const { search, category, sort, status, limit } = req.query;

    const query = {};

    // Filter by active status for public by default
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    // Search by service name (case-insensitive)
    if (search && search.trim() !== '') {
      query.serviceName = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'All' && category.trim() !== '') {
      query.category = category.trim();
    }

    // Sorting by price (support hyphen, underscore, or short names)
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price-asc' || sort === 'price_asc' || sort === 'asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc' || sort === 'price_desc' || sort === 'desc') {
      sortOption = { price: -1 };
    }

    let servicesQuery = Service.find(query).sort(sortOption);

    if (limit) {
      servicesQuery = servicesQuery.limit(parseInt(limit, 10));
    }

    const services = await servicesQuery;

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch salon services.',
    });
  }
};

// @desc    Get all services for admin dashboard (both active & inactive)
// @route   GET /api/services/admin/all
// @access  Private/Admin
export const getAdminServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin services.',
    });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public / Protected on details page
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salon service ID format.',
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Salon service not found with the specified ID.',
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid service ID provided.',
    });
  }
};

// @desc    Create a new salon service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
  try {
    const { serviceName, category, description, price, duration, image, status } = req.body;

    if (!serviceName || !category || !description || !price || !duration || !image) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, category, description, price, duration, image) are required.',
      });
    }

    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.',
      });
    }

    if (isNaN(numericDuration) || numericDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a valid positive number in minutes.',
      });
    }

    const service = await Service.create({
      serviceName,
      category,
      description,
      price: numericPrice,
      duration: numericDuration,
      image,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Service successfully created.',
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create service.',
    });
  }
};

// @desc    Update salon service
// @route   PATCH /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    const { serviceName, category, description, price, duration, image, status } = req.body;

    if (serviceName) service.serviceName = serviceName;
    if (category) service.category = category;
    if (description) service.description = description;
    if (image) service.image = image;
    if (status && ['active', 'inactive'].includes(status)) service.status = status;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number.',
        });
      }
      service.price = numPrice;
    }

    if (duration !== undefined) {
      const numDuration = Number(duration);
      if (isNaN(numDuration) || numDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a positive number in minutes.',
        });
      }
      service.duration = numDuration;
    }

    const updatedService = await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully.',
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update service.',
    });
  }
};

// @desc    Delete salon service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete service.',
    });
  }
};
