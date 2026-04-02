// Routers/paymentRoutes.js
import express from "express";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Subscription from "../Models/Subscription.js";
import User from "../Models/User.js";
import { sendPlanActivatedMail } from "../Utils/sendPaymentMail.js";

const router = express.Router();

// ── POST /api/payment/create-order ───────────────────────
router.post("/create-order", async (req, res) => {
  const { userId, plan } = req.body;

  try {
    let finalAmount = plan.price;

    const existingSub = await Subscription.findOne({
      userId,
      status: "active"
    });

    if (existingSub && plan.price > existingSub.amount) {
      const now = new Date();
      const end = new Date(existingSub.endDate);

      const remainingDays = Math.ceil(
        (end - now) / (1000 * 60 * 60 * 24)
      );

      if (remainingDays > 0) {
        const perDayPrice =
          existingSub.amount /
          ((new Date(existingSub.endDate) - new Date(existingSub.startDate)) /
            (1000 * 60 * 60 * 24));

        const remainingValue = perDayPrice * remainingDays;

        finalAmount = Math.max(plan.price - remainingValue, 1);
      }
    }

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    res.json({
      order,
      finalAmount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
});

// ── POST /api/payment/verify ─────────────────────────────
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    plan,
  } = req.body;

  // 1. Signature verify
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Signature mismatch." });
  }

  try {
    // 2. Subscription save
    const start = new Date();
    const end = new Date(Date.now() + plan.durationDays * 86400000);

    const sub = await Subscription.create({
      userId,
      planId: plan._id,
      planName: plan.name,
      amount: plan.price,
      startDate: start,
      endDate: end,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    // 3. User email fetch
    const user = await User.findById(userId).select("email fullname");

    // 4. Activation mail
    if (user?.email) {
      await sendPlanActivatedMail({
        to: user.email,
        candidateName: user.fullname || "User",
        planName: plan.name,
        amount: plan.price,
        startDate: start,
        endDate: end,
        paymentId: razorpay_payment_id,
      });
      await Subscription.findByIdAndUpdate(sub._id, { emailSent: true });
    }

    res.json({ success: true, subscriptionId: sub._id });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, message: "Internal error." });
  }
});

// ✅ GET ALL SUBSCRIPTIONS (ADMIN)
router.get("/all-subscriptions", async (req, res) => {
  try {
    const data = await Subscription.find()
      .populate("userId", "fullname email") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Error fetching data" });
  }
});



export default router;
