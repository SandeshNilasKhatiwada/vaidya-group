const { Router } = require("express");
const router = Router();
const { login } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/login", login);

module.exports = router;
