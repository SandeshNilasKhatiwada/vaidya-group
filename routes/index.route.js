const { Router } = require("express");
const router = Router();
const login = require("./user.route");

router.use("/user", login);

module.exports = router;
