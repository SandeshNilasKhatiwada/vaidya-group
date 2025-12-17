const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

const prisma = new PrismaClient();

exports.login = async (req, res) => {
  console.log("Received login request");
  const { username, password } = req.body;
  console.log("Login attempt for user:", username);
  console.log("Request body:", req.body);

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, username: user.username });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
