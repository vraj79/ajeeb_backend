const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

const stripe = require('stripe')("sk_test_51NPR2pSFZfBDhScQYWp61q7zCCyK2h0BmNkpFIwuJrrRWJSWckS94JX4455aXt0OAP3C9YszqPFAPMdIorS4M2mt00rUZn12ij")

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        metadata: {
            company: "V Group of Companies"
        },
    })

    res.status(200).json({ success: true, client_secret: myPayment.client_secret })
})

exports.sendStripePublishableKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY })
})