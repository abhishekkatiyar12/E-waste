const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Customer's full name
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email should be unique for each customer
    },
    password: {
      type: String,
      required: true, // Customer's password (should be encrypted before saving)
    },
    contactNumber: {
      type: String, // Optional: Customer's contact number
    },
    address: {
      type: String, // Optional: Address for deliveries or pickups
    },
  },
  {
    timestamps: true, // Automatically creates and manages `createdAt` and `updatedAt`
  }
);

const customerModel = mongoose.model('Customer', customerSchema);

module.exports = customerModel;
