const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");
const validate = require("../middlewares/validation.middleware");
const {
  createCarSchema,
  updateCarSchema,
  idSchema,
  querySchema,
} = require("../validation/car.validition");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/",
  authMiddleware,
  validate(createCarSchema),
  carController.createCar,
);

router.get("/all", validate(querySchema), carController.getAllCars);

router.get("/:id", validate(idSchema), carController.getCarById);

router.put(
  "/:id",
  validate(idSchema),
  validate(updateCarSchema),
  carController.updateCar,
);

router.delete("/:id", validate(idSchema), carController.deleteCar);

module.exports = router;
