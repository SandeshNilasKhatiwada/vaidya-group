const { Router } = require("express");
const router = Router();
const login = require("./user.route");
const carRoutes = require("./car.route");
const authMiddleware = require("../middlewares/auth.middleware");

router.use("/user", login);
router.use("/car", authMiddleware, carRoutes);

module.exports = router;
