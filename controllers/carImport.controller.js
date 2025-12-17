const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const csv = require("csv-parser");

const prisma = new PrismaClient();

// Helper to parse numbers from strings
function parseNumber(value) {
  if (!value || value.toString().trim() === "") return null;

  const str = value.toString().trim();

  // Try to extract number from common patterns
  const match = str.match(/\d+\.?\d*/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }

  // Try direct conversion
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Validate a single row
function validateRow(row, rowNumber) {
  const errors = [];

  // Check required fields
  const requiredFields = [
    { key: "Make Name", value: row["Make Name"] },
    { key: "Model Name", value: row["Model Name"] },
    { key: "Engine Type", value: row["Engine Type"] },
    { key: "Body Type", value: row["Body Type"] },
  ];

  requiredFields.forEach((field) => {
    if (!field.value || field.value.toString().trim() === "") {
      errors.push(`${field.key} is required`);
    }
  });

  // Check numeric fields
  const numericFields = [
    { key: "Engine Cylinders", value: row["Engine Cylinders"] },
    { key: "Engine Size", value: row["Engine Size"] },
    { key: "Engine Horsepower Hp", value: row["Engine Horsepower Hp"] },
    { key: "Engine Horsepower Rpm", value: row["Engine Horsepower Rpm"] },
    { key: "Body Doors", value: row["Body Doors"] },
    { key: "Body Seats", value: row["Body Seats"] },
  ];

  numericFields.forEach((field) => {
    if (field.value && field.value.toString().trim() !== "") {
      const num = parseNumber(field.value);
      if (num === null) {
        errors.push(`${field.key} must be a number (got: "${field.value}")`);
      }
    }
  });

  // If there are errors, return them
  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  // Prepare data for database
  const carData = {
    make_name: row["Make Name"].trim(),
    model_name: row["Model Name"].trim(),
    trim_name: row["Trim Name"] ? row["Trim Name"].trim() : null,
    trim_description: row["Trim Description"]
      ? row["Trim Description"].trim()
      : null,
    engine_type: row["Engine Type"].trim(),
    engine_fuel_type: row["Engine Fuel Type"]
      ? row["Engine Fuel Type"].trim()
      : null,
    engine_drive_type: row["Engine Drive Type"]
      ? row["Engine Drive Type"].trim()
      : null,
    body_type: row["Body Type"].trim(),
  };

  // Parse numeric values
  const numericData = {
    engine_cylinders: row["Engine Cylinders"],
    engine_size: row["Engine Size"],
    engine_horsepower_hp: row["Engine Horsepower Hp"],
    engine_horsepower_rpm: row["Engine Horsepower Rpm"],
    body_doors: row["Body Doors"],
    body_seats: row["Body Seats"],
  };

  Object.keys(numericData).forEach((key) => {
    const dbField = key;
    if (numericData[key] && numericData[key].toString().trim() !== "") {
      const num = parseNumber(numericData[key]);
      carData[dbField] = num;
    } else {
      carData[dbField] = null;
    }
  });

  return { isValid: true, errors: [], data: carData };
}

// Create log file content
function createLogFile(results) {
  let log = "=".repeat(60) + "\n";
  log += "CSV UPLOAD LOG\n";
  log += "=".repeat(60) + "\n\n";

  log += `Import Date: ${new Date().toLocaleString()}\n`;
  log += `Total Rows Processed: ${results.totalRows}\n`;
  log += `Valid Rows: ${results.validRows}\n`;
  log += `Invalid Rows: ${results.invalidRows}\n`;
  log += `Successfully Inserted: ${results.insertedRows}\n\n`;

  if (results.errors.length > 0) {
    log += "ERROR DETAILS:\n";
    log += "-".repeat(60) + "\n\n";

    results.errors.forEach((error, index) => {
      log += `Error ${index + 1}:\n`;
      log += `Row: ${error.rowNumber}\n`;

      if (error.errors && error.errors.length > 0) {
        error.errors.forEach((err) => {
          log += `  - ${err}\n`;
        });
      }

      log += `Data: ${JSON.stringify(error.data, null, 2)}\n`;
      log += "-".repeat(40) + "\n\n";
    });
  } else {
    log += "No errors found. All rows imported successfully.\n";
  }

  log += "=".repeat(60) + "\n";
  log += "END OF LOG\n";
  log += "=".repeat(60) + "\n";

  return log;
}

// Import CSV function
const importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const filePath = req.file.path;
    const results = {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      insertedRows: 0,
      errors: [],
    };

    // Read CSV file
    const cars = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          results.totalRows++;

          // Validate row
          const validation = validateRow(row, results.totalRows);

          if (validation.isValid) {
            results.validRows++;
            cars.push(validation.data);
          } else {
            results.invalidRows++;
            results.errors.push({
              rowNumber: results.totalRows,
              data: row,
              errors: validation.errors,
            });
          }
        })
        .on("end", async () => {
          try {
            // Delete temp file
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            // Insert valid rows to database
            for (const car of cars) {
              try {
                await prisma.car.create({
                  data: car,
                });
                results.insertedRows++;
              } catch (error) {
                results.invalidRows++;
                results.validRows--;
                results.errors.push({
                  rowNumber: "Database Insert",
                  data: car,
                  errors: [error.message],
                });
              }
            }

            // Create log file
            const logContent = createLogFile(results);
            const logFileName = `upload-log-${Date.now()}.txt`;

            // Ensure logs directory exists
            if (!fs.existsSync("logs")) {
              fs.mkdirSync("logs", { recursive: true });
            }

            fs.writeFileSync(`logs/${logFileName}`, logContent);

            // Send response
            res.status(200).json({
              success: true,
              message: "CSV import completed",
              summary: {
                totalRows: results.totalRows,
                validRows: results.validRows,
                invalidRows: results.invalidRows,
                insertedRows: results.insertedRows,
              },
              logFile: logFileName,
              errors: results.errors.slice(0, 10), // Show first 10 errors
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during import",
    });
  }
};

// Download log file function
const downloadLog = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = `logs/${filename}`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Log file not found",
      });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to download log file",
    });
  }
};

module.exports = {
  importCSV,
  downloadLog,
};
