const { z } = require("zod");

// Create Car validation
const createCarSchema = z.object({
  make_name: z.string().min(1, "Make name is required"),
  model_name: z.string().min(1, "Model name is required"),
  engine_type: z.string().min(1, "Engine type is required"),
  body_type: z.string().min(1, "Body type is required"),

  // Optional fields with validation
  trim_name: z.string().optional().nullable(),
  trim_description: z.string().optional().nullable(),
  engine_fuel_type: z.string().optional().nullable(),
  engine_drive_type: z.string().optional().nullable(),

  // Numeric fields with coerce to handle string numbers
  engine_cylinders: z.coerce
    .number()
    .int("Cylinders must be a whole number")
    .positive("Cylinders must be positive")
    .max(16, "Cylinders cannot exceed 16")
    .optional()
    .nullable(),

  engine_size: z.coerce
    .number()
    .positive("Engine size must be positive")
    .max(20, "Engine size cannot exceed 20 liters")
    .optional()
    .nullable(),

  engine_horsepower_hp: z.coerce
    .number()
    .int("Horsepower must be a whole number")
    .positive("Horsepower must be positive")
    .max(2000, "Horsepower cannot exceed 2000")
    .optional()
    .nullable(),

  engine_horsepower_rpm: z.coerce
    .number()
    .int("Horsepower RPM must be a whole number")
    .positive("Horsepower RPM must be positive")
    .max(10000, "Horsepower RPM cannot exceed 10000")
    .optional()
    .nullable(),

  body_doors: z.coerce
    .number()
    .int("Doors must be a whole number")
    .min(1, "Doors must be at least 1")
    .max(10, "Doors cannot exceed 10")
    .optional()
    .nullable(),

  body_seats: z.coerce
    .number()
    .int("Seats must be a whole number")
    .min(1, "Seats must be at least 1")
    .max(20, "Seats cannot exceed 20")
    .optional()
    .nullable(),
});

// Update Car validation (all fields optional)
const updateCarSchema = createCarSchema.partial();

// ID validation
const idSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .refine((val) => !isNaN(parseInt(val)), {
      message: "ID must be a valid number",
    }),
});

// Query validation for pagination
const querySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .positive("Page must be positive")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),

  make: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
});

// Search validation
const searchSchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters"),
});

module.exports = {
  createCarSchema,
  updateCarSchema,
  idSchema,
  querySchema,
  searchSchema,
};
