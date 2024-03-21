const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "https://smart-health-supply-chain-client.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("health-supply-chain-assignment-6");
    const collection = db.collection("users");
    const supplyCollection = db.collection("supplies");
    const volunteerCollection = db.collection("volunteers");
    const testimonialCollection = db.collection("testimonials");
    const commentCollection = db.collection("comments");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================

    // Create Supply

    app.post("/api/v1/supply", async (req, res) => {
      try {
        const { title, category, description, amount, image, email } = req.body;

        await supplyCollection.insertOne({
          title,
          category,
          description,
          amount,
          image,
          email,
        });

        res.status(201).json({
          success: true,
          message: "Supply added successfully",
        });
      } catch (error) {
        console.error("Error adding supply:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add supply",
          error: error.message,
        });
      }
    });

    // Get All Supplies
    app.get("/api/v1/supply", async (req, res) => {
      try {
        const query = {};
        const result = await supplyCollection
          .find(query)
          .sort({ amount: -1 })
          .toArray();

        res.status(200).json({
          success: true,
          data: result,
          message: "Supplies retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving supplies:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve supplies",
          error: error.message,
        });
      }
    });

    // Get Single Supply
    app.get("/api/v1/supply/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const supply = await supplyCollection.findOne(query);

        res.status(200).json({
          success: true,
          data: supply,
          message: "Supply retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving supply:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve supply",
          error: error.message,
        });
      }
    });

    // Delete single supply

    app.delete("/api/v1/supply/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        await supplyCollection.deleteOne(query);
        res.status(200).json({
          success: true,
          message: "Supply deteled successfully",
        });
      } catch (error) {
        console.error("Error deleting supply:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete supply",
          error: error.message,
        });
      }
    });

    // Update Supply

    app.put("/api/v1/supply/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateFields = req.body;

        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({
            success: false,
            message: "No fields to update provided",
          });
        }

        const query = { _id: new ObjectId(id) };
        const updateData = { $set: updateFields };

        const result = await supplyCollection.updateOne(query, updateData);

        res.status(200).json({
          success: true,
          message: "Supply updated successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update supply",
          error: error.message,
        });
      }
    });

    // ==============================================================

    // Create Volunteer

    app.post("/api/v1/volunteer", async (req, res) => {
      try {
        const { name, email, phone, location, image } = req.body;

        await volunteerCollection.insertOne({
          name,
          email,
          phone,
          location,
          image,
        });

        res.status(201).json({
          success: true,
          message: "Volunteer added successfully",
        });
      } catch (error) {
        console.error("Error adding volunteer:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add volunteer",
          error: error.message,
        });
      }
    });

    // Get All Volunteer
    app.get("/api/v1/volunteer", async (req, res) => {
      try {
        const query = {};
        const result = await volunteerCollection.find(query).toArray();

        res.status(200).json({
          success: true,
          data: result,
          message: "Volunteers retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving volunteers:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve volunteers",
          error: error.message,
        });
      }
    });

    // ==============================================================

    // Create Testimonial

    app.post("/api/v1/testimonial", async (req, res) => {
      try {
        const { author, image, description } = req.body;

        await testimonialCollection.insertOne({
          author,
          description,
          image,
        });

        res.status(201).json({
          success: true,
          message: "Testimonial added successfully",
        });
      } catch (error) {
        console.error("Error adding testimonial:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add testimonial",
          error: error.message,
        });
      }
    });

    // Get All Testimonials
    app.get("/api/v1/testimonial", async (req, res) => {
      try {
        const query = {};
        const result = await testimonialCollection.find(query).toArray();

        res.status(200).json({
          success: true,
          data: result,
          message: "Testimonials retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving testimonials:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve testimonials",
          error: error.message,
        });
      }
    });

    // ==============================================================

    // Post Comment

    app.post("/api/v1/comment", async (req, res) => {
      try {
        const { name, comment } = req.body;

        await commentCollection.insertOne({
          name,
          comment,
        });

        res.status(201).json({
          success: true,
          message: "Comment added successfully",
        });
      } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add comment",
          error: error.message,
        });
      }
    });

    // Get All Comments
    app.get("/api/v1/comment", async (req, res) => {
      try {
        const query = {};
        const result = await commentCollection.find(query).toArray();

        res.status(200).json({
          success: true,
          data: result,
          message: "Comments retrieved successfully",
        });
      } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve comments",
          error: error.message,
        });
      }
    });

    // ==============================================================

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
