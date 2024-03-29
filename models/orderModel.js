const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
      size: {
        type: String,
      },
      orderStatus: {
        type: String,
        enum: ["pending","processing","confirmed","outForDelivery", "shipped", "delivered","return pending","returned","cancelled"],
        default: "pending",
      },
      productPrice: {
        type: Number

      }
    },
  ],
  address: {
    name: String,
    house: String,
    state: String,
    country: String,
    city: String,
    pincode: Number,
    mobile: Number,
  },
  paymentMethod: {
    type: String,
  },
  orderedOn: {
    type: Date,
    default: Date.now,
  },
  deliveredOn: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pendings","processing","confirmed","outForDelivery", "shipped", "delivered", "cancelled","payment pending"],
    default: "pendings",
  },
  orderId: {
    type: Number,
    default: () => Math.floor(100000 + Math.random() * 900000),
  },
  totalAmount: {
    type: Number,
  },
  couponAmount: {
    type: Number,
    default:0
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;