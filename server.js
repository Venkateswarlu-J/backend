const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");  
const bcryptjs = require("bcryptjs");

const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect("mongodb+srv://venkatesh:database24@database123.8zv1u.mongodb.net/backend?retryWrites=true&w=majority&appName=database123")
.then(() => {
    console.log("DB connected successfully");
})
.catch((err) => console.log(err));

app.get("/", async (req, res) => {
    res.json({ message: "Welcome to project" });
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword = await bcryptjs.hash(password, 8);
        const newUser = new User({ username, email, password: hashPassword });

        await newUser.save();
        res.json({ message: "User Registration success" });
        console.log("User Registration success...");
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login success", username: user.username });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Server is running properly on port " + PORT);
});
