const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");  
const bcryptjs = require("bcryptjs");
const cors=require('cors')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

mongoose.connect("mongodb+srv://venkatesh:database24@database123.8zv1u.mongodb.net/backend?retryWrites=true&w=majority&appName=database123")
.then(() => {
    console.log("DB connected successfully");
})
.catch((err) => console.log(err));

app.get("/cart/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    try {
        const user = await User.findById(userId).populate("cart.items.product"); 
        if (!user||!user.cart) return res.status(404).json({ message: "User not found" });
        res.json({ cart: user.cart.items || [] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
});


app.post("/update-cart", async (req, res) => {
    const { userId, productId, action } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ message: "User ID and Product ID are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (action === "add") {
            await user.addToCart(productId);
        } else if (action === "remove") {
            await user.removeFromCart(productId);
        }

        const updatedUser = await User.findById(userId).populate("cart.items.product");
        res.json({ message: "Cart updated successfully", cart: updatedUser.cart.items });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error });
    }
});


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
      res.json({ message: "User Registration success" }); // Send success response
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
  
      res.json({
        message: "Login success",
        userId: user._id, // Send user ID in response
        email: user.email,
        username: user.username,
      });
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
