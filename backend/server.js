const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const homeRoutes = require("./routes/home");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/home", homeRoutes);

app.post("/api/auth/login", async (req, res) => {
  console.log("🔍 Received Login Request:", req.body); // ✅ Log request data

  try {
    const { email, password } = req.body;

    // 1️⃣ Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 2️⃣ Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect password");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login Successful!");
    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/auth/register", async (req, res) => {
  console.log("Received Data:", req.body); // ✅ Logs incoming request data

  try {
    const { name, email, password, role } = req.body;

    // ✅ Check if all fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Validate role against schema
    const validRoles = ["freelancer", "job_provider", "verifier"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role: ${role}. Choose from ${validRoles.join(", ")}` });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // ✅ Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create and save new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error("Error saving user:", error.message); // ✅ Logs specific error message
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
