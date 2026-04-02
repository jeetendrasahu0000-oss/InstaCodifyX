// cron/subscriptionExpiry.js
import cron from "node-cron";
import Subscription from "../Models/Subscription.js";
import User from "../Models/User.js";
import { sendPlanExpiredMail } from "../Utils/sendPaymentMail.js";

// Runs every day at midnight (00:00 IST)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("⏰ Cron: Checking expired subscriptions…");

    try {
      const now = new Date();

      // Find active subscriptions that have expired
      const expired = await Subscription.find({
        status: "active",
        endDate: { $lt: now },
      });

      console.log(`Found ${expired.length} expired subscriptions.`);

      for (const sub of expired) {
        // 1. Mark as expired
        sub.status = "expired";
        await sub.save();

        // 2. Fetch user
        const user = await User.findById(sub.userId).select("email fullname");
        if (!user?.email) continue;

        // 3. Send expiry mail (only once)
        if (!sub.expirySent) {
          try {
            await sendPlanExpiredMail({
              to: user.email,
              candidateName: user.fullname || "User",
              planName: sub.planName,
              endDate: sub.endDate,
              renewUrl: `${process.env.CLIENT_URL}/upgrade`,
            });
            sub.expirySent = true;
            await sub.save();
            console.log(`✅ Expiry mail sent to ${user.email}`);
          } catch (mailErr) {
            console.error(`❌ Mail failed for ${user.email}:`, mailErr.message);
          }
        }
      }

      console.log("✅ Cron job completed.");
    } catch (err) {
      console.error("❌ Cron error:", err.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);
