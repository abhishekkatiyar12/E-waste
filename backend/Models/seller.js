const mongoose = require("mongoose");

// Define a product schema for e-waste products
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String, // e.g., electronics, batteries, appliances
    required: true,
  },
  condition: {
    type: String, // e.g., "working", "broken", "for recycling"
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number, // Optional: could be a price for resale or recycling
  },
  description: {
    type: String, // Extra details about the item
  },
});

// Define the seller schema
const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true, // The seller's physical location for pickups/drop-offs
    },
    products: {
      type: [productSchema], // Array of products the seller is offering for e-waste
    },
    verified: {
      type: Boolean,
      default: false, // Can be used to track whether the seller has been verified
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Model definition
const sellerModel = mongoose.model('Seller', sellerSchema);

module.exports = sellerModel;
