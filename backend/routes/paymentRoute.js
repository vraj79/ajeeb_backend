const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { processPayment, sendStripePublishableKey } = require("../controllers/paymentControllers");

const paymentRouter = express.Router();

paymentRouter.post('/process', isAuthenticatedUser, processPayment)
paymentRouter.get('/stripe/api_key', isAuthenticatedUser, sendStripePublishableKey)

module.exports = paymentRouter;