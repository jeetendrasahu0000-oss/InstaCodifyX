// ── POST /api/payment/verify ─────────────────────────────────────────────────
// Replace your existing verify route with this updated version

router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    plan,   // includes plan.finalAmount if discount was applied
  } = req.body;

  // 1. Signature verify
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Signature mismatch." });
  }

  try {
    // 2. Fetch existing active subscription BEFORE creating new one
    const existingSub = await Subscription.findOne({ userId, status: "active" });

    let startDate = new Date();
    let endDate   = new Date(Date.now() + plan.durationDays * 86400000);

    // Calculate remaining days on old plan (for mail)
    let remainingDays    = 0;
    let discountApplied  = 0;
    let previousPlanInfo = null;

    if (existingSub) {
      const now = new Date();
      const end = new Date(existingSub.endDate);
      remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

      // SAME PLAN → extend
      if (existingSub.planName === plan.name) {
        existingSub.endDate = new Date(end.getTime() + plan.durationDays * 86400000);
        await existingSub.save();
        const user = await User.findById(userId).select("email fullname");
        if (user?.email) {
          await sendPlanActivatedMail({
            to:            user.email,
            candidateName: user.fullname || "User",
            planName:      plan.name,
            amount:        plan.price,
            finalAmount:   plan.price,
            startDate:     existingSub.startDate,
            endDate:       existingSub.endDate,
            paymentId:     razorpay_payment_id,
          });
        }
        return res.json({ success: true, message: "Plan extended successfully" });
      }

      // UPGRADE → expire old, get previousPlanInfo for mail
      if (plan.price > existingSub.amount) {
        previousPlanInfo = {
          planName:      existingSub.planName,
          endDate:       existingSub.endDate,
          remainingDays,
          originalPrice: existingSub.amount,
        };

        // discount = finalAmount difference
        discountApplied = plan.finalAmount
          ? Math.round(plan.price - plan.finalAmount)
          : 0;

        existingSub.status = "expired";
        await existingSub.save();
      }

      // DOWNGRADE → schedule after current ends
      if (plan.price < existingSub.amount) {
        startDate = existingSub.endDate;
        endDate   = new Date(new Date(existingSub.endDate).getTime() + plan.durationDays * 86400000);
      }
    }

    // 3. Create new subscription
    const sub = await Subscription.create({
      userId,
      planId:    plan._id,
      planName:  plan.name,
      amount:    plan.price,
      startDate,
      endDate,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
    });

    // 4. Fetch user email
    const user = await User.findById(userId).select("email fullname");

    // 5. Send activation mail with all details
    if (user?.email) {
      await sendPlanActivatedMail({
        to:              user.email,
        candidateName:   user.fullname || "User",
        planName:        plan.name,
        amount:          plan.price,
        finalAmount:     plan.finalAmount ?? plan.price,
        startDate,
        endDate,
        paymentId:       razorpay_payment_id,
        previousPlan:    previousPlanInfo,    // null for new/downgrade, object for upgrade
        discountApplied: discountApplied,     // 0 if no discount
      });
      await Subscription.findByIdAndUpdate(sub._id, { emailSent: true });
    }

    res.json({ success: true, subscriptionId: sub._id });

  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, message: "Internal error." });
  }
});