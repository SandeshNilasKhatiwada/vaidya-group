const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new car
const createCar = async (req, res) => {
  try {
    const carData = req.validatedData;

    const car = await prisma.car.create({
      data: carData,
    });

    res.status(201).json({
      success: true,
      data: car,
      message: "Car created successfully",
    });
  } catch (error) {
    console.error("Create car error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A similar car already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create car",
    });
  }
};

// Get all cars
const getAllCars = async (req, res) => {
  try {
    const { page, limit, make, model, bodyType } = req.validatedData;
    const skip = (page - 1) * limit;

    // Build filter
    const where = {};
    if (make) where.make_name = { contains: make };
    if (model) where.model_name = { contains: model };
    if (bodyType) where.body_type = { contains: bodyType };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.car.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get cars error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cars",
    });
  }
};

// Get single car
const getCarById = async (req, res) => {
  try {
    const { id } = req.validatedData;
    console.log("Update data:", req.validatedData);

    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("Get car error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch car",
    });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.validatedData;

    // Validate id
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid ID is required",
      });
    }

    const car = await prisma.car.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: car,
      message: "Car updated successfully",
    });
  } catch (error) {
    console.error("Update car error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update car",
    });
  }
};

// Delete car
const deleteCar = async (req, res) => {
  try {
    const { id } = req.validatedData;

    await prisma.car.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Delete car error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete car",
    });
  }
};

// Search cars
const searchCars = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const cars = await prisma.car.findMany({
      where: {
        OR: [
          { make_name: { contains: query } },
          { model_name: { contains: query } },
          { trim_name: { contains: query } },
          { body_type: { contains: query } },
        ],
      },
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: cars,
      count: cars.length,
    });
  } catch (error) {
    console.error("Search cars error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search cars",
    });
  }
};

module.exports = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  searchCars,
};
