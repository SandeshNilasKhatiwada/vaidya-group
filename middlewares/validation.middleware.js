const validate = (schema) => (req, res, next) => {
  try {
    // Combine data from body, params, and query
    const data = {
      ...req.body,
      ...req.params,
      ...req.query,
    };

    // Validate the data
    const result = schema.safeParse(data);

    if (!result.success) {
      // Get the first error
      const errors = result.error.errors;
      if (errors && errors.length > 0) {
        const firstError = errors[0];
        return res.status(400).json({
          success: false,
          message: firstError.message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.errors,
        });
      }
    }

    // Attach validated data to request
    req.validatedData = result.data;
    next();
  } catch (err) {
    console.error("Validation error:", err);
    res.status(400).json({
      success: false,
      message: "Validation error occurred",
    });
  }
};

module.exports = validate;
