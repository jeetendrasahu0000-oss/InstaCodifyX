// Utils/sendPaymentMail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

// ============================================================
// ✅ PLAN ACTIVATED EMAIL
// params:
//   to, candidateName, planName, amount, startDate, endDate, paymentId
//   previousPlan?      { planName, endDate, remainingDays, originalPrice }
//   discountApplied?   number  (₹ saved)
//   finalAmount?       number  (actual charged)
// ============================================================
export const sendPlanActivatedMail = async ({
  to,
  candidateName,
  planName,
  amount, // original plan price
  finalAmount, // actual amount charged (after discount)
  startDate,
  endDate,
  paymentId,
  previousPlan, // { planName, endDate, remainingDays, originalPrice }
  discountApplied, // ₹ discount value
}) => {
  const hasDiscount = discountApplied && discountApplied > 0;
  const isUpgrade = !!previousPlan;
  const charged = finalAmount ?? amount;
  const saved = discountApplied ?? 0;

  // ── Previous plan block (only if upgrade) ───────────────────────────────
  const prevPlanBlock = isUpgrade
    ? `
    <!-- Previous Plan Info -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fafbff;border:1.5px solid #c7d2fe;border-radius:14px;margin-bottom:20px;overflow:hidden;">
      <tr>
        <td colspan="2" style="background:#ede9fe;border-bottom:1.5px solid #c7d2fe;padding:12px 22px;">
          <span style="font-size:12px;font-weight:700;color:#6d28d9;letter-spacing:0.5px;text-transform:uppercase;">
            📦 &nbsp; Previous Subscription
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 22px 5px;width:45%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">Plan</td>
        <td style="padding:10px 22px 5px;font-size:14px;font-weight:700;color:#1e1b4b;">
          <span style="background:#ede9fe;color:#7c3aed;padding:2px 10px;border-radius:999px;font-size:12px;">${previousPlan.planName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:5px 22px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">Original Price</td>
        <td style="padding:5px 22px;font-size:14px;font-weight:600;color:#6b7280;text-decoration:line-through;">
          ₹${previousPlan.originalPrice.toLocaleString("en-IN")}
        </td>
      </tr>
      <tr>
        <td style="padding:5px 22px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">Was Valid Until</td>
        <td style="padding:5px 22px;font-size:13px;font-weight:600;color:#0f172a;">${fmt(previousPlan.endDate)}</td>
      </tr>
      <tr>
        <td style="padding:5px 22px 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">Remaining Days</td>
        <td style="padding:5px 22px 12px;font-size:13px;font-weight:700;color:#7c3aed;">${previousPlan.remainingDays} days carried forward</td>
      </tr>
    </table>
  `
    : "";

  // ── Discount breakdown block ─────────────────────────────────────────────
  const discountBlock = hasDiscount
    ? `
    <!-- Discount Breakdown -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;margin-bottom:20px;overflow:hidden;">
      <tr>
        <td colspan="2" style="background:#dcfce7;border-bottom:1.5px solid #86efac;padding:12px 22px;">
          <span style="font-size:12px;font-weight:700;color:#15803d;letter-spacing:0.5px;text-transform:uppercase;">
            🎁 &nbsp; Upgrade Discount Applied
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 22px 4px;width:55%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">New Plan Price</td>
        <td style="padding:10px 22px 4px;font-size:14px;font-weight:600;color:#6b7280;text-decoration:line-through;">₹${amount.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding:4px 22px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">Remaining Value Adjusted</td>
        <td style="padding:4px 22px;font-size:14px;font-weight:700;color:#16a34a;">− ₹${saved.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding:4px 22px 14px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.3px;">You Paid</td>
        <td style="padding:4px 22px 14px;">
          <span style="font-size:20px;font-weight:800;color:#15803d;">₹${Math.round(charged).toLocaleString("en-IN")}</span>
          <span style="font-size:11px;color:#16a34a;font-weight:600;margin-left:8px;background:#dcfce7;padding:2px 8px;border-radius:999px;">Saved ₹${saved.toLocaleString("en-IN")}</span>
        </td>
      </tr>
    </table>
  `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Plan Activated — CodifyX</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);border-radius:20px 20px 0 0;padding:36px 40px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.25);border-radius:14px;padding:10px 22px;margin-bottom:20px;">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Codify<span style="color:#bbf7d0;">X</span></span>
      </div>
      <div style="font-size:48px;margin-bottom:10px;">${isUpgrade ? "🚀" : "🎉"}</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
        ${isUpgrade ? "Plan Upgraded!" : "Plan Activated!"}
      </h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">
        ${
          isUpgrade
            ? `Your previous plan's value has been adjusted in your new plan`
            : "Your subscription is now live and ready to use"
        }
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background:#fff;padding:36px 40px 32px;">

      <p style="margin:0 0 20px;font-size:16px;color:#0f172a;font-weight:500;">
        Hi <strong style="color:#16a34a;">${candidateName}</strong> 👋
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
        ${
          isUpgrade
            ? `You've successfully upgraded to the <strong>${planName}</strong> plan on <strong>CodifyX</strong>.
             The unused value from your previous <strong>${previousPlan.planName}</strong> plan has been
             <strong style="color:#16a34a;">automatically deducted</strong> — you only paid for what you needed.`
            : `Your <strong>${planName}</strong> plan has been successfully activated on <strong>CodifyX</strong>.
             You now have full access to all premium features. Start exploring!`
        }
      </p>

      ${prevPlanBlock}
      ${discountBlock}

      <!-- New Plan Details -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:16px;margin-bottom:28px;overflow:hidden;">
        <tr>
          <td colspan="2" style="background:#dcfce7;border-bottom:1.5px solid #86efac;padding:13px 22px;">
            <span style="font-size:12px;font-weight:700;color:#15803d;letter-spacing:0.5px;text-transform:uppercase;">
              ✅ &nbsp; ${isUpgrade ? "New" : ""} Subscription Details
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 22px 5px;width:40%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">🏷️ &nbsp; Plan</td>
          <td style="padding:12px 22px 5px;">
            <span style="background:#dcfce7;color:#16a34a;padding:3px 12px;border-radius:999px;font-size:13px;font-weight:700;">${planName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:5px 22px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">💰 &nbsp; Amount Paid</td>
          <td style="padding:5px 22px;font-size:16px;font-weight:800;color:#15803d;">₹${Math.round(charged).toLocaleString("en-IN")}${hasDiscount ? `<span style="font-size:11px;color:#6b7280;font-weight:500;margin-left:6px;">(was ₹${amount.toLocaleString("en-IN")})</span>` : ""}</td>
        </tr>
        <tr>
          <td style="padding:5px 22px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">📅 &nbsp; Starts On</td>
          <td style="padding:5px 22px;font-size:14px;font-weight:600;color:#0f172a;">${fmt(startDate)}</td>
        </tr>
        <tr>
          <td style="padding:5px 22px 14px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">⏳ &nbsp; Valid Until</td>
          <td style="padding:5px 22px 14px;font-size:14px;font-weight:700;color:#16a34a;">${fmt(endDate)}</td>
        </tr>
        <tr>
          <td style="padding:5px 22px 14px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">🔑 &nbsp; Payment ID</td>
          <td style="padding:5px 22px 14px;font-size:11px;color:#94a3b8;font-family:monospace;">${paymentId}</td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
           style="display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 18px rgba(34,197,94,0.35);">
          🚀 &nbsp; Go to Dashboard
        </a>
      </div>

      <p style="margin:24px 0 0;font-size:14px;color:#475569;line-height:1.7;">
        Questions? Reach us at
        <a href="mailto:${process.env.EMAIL_FROM}" style="color:#16a34a;font-weight:600;">${process.env.EMAIL_FROM}</a>.
      </p>
      <p style="margin:12px 0 0;font-size:15px;color:#0f172a;font-weight:600;">
        Happy Coding! 💻<br/>
        <span style="color:#16a34a;">The CodifyX Team</span>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#f8f9fc;border-top:1.5px solid #e2e8f0;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#6366f1;">CodifyX</p>
      <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.6;">
        This is a transaction email. Please do not reply directly.<br/>
        © ${new Date().getFullYear()} CodifyX. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"CodifyX" <${process.env.EMAIL_FROM}>`,
    to,
    subject: isUpgrade
      ? `🚀 Upgraded to ${planName} — ₹${saved.toLocaleString("en-IN")} discount applied!`
      : `✅ ${planName} Plan Activated — Welcome to CodifyX Premium!`,
    html,
  });
};

// ============================================================
// ❌ PLAN EXPIRY EMAIL  (unchanged logic, same polish)
// ============================================================
export const sendPlanExpiredMail = async ({
  to,
  candidateName,
  planName,
  endDate,
  renewUrl,
}) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Plan Expired — CodifyX</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);border-radius:20px 20px 0 0;padding:36px 40px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.25);border-radius:14px;padding:10px 22px;margin-bottom:20px;">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Codify<span style="color:#fed7aa;">X</span></span>
      </div>
      <div style="font-size:48px;margin-bottom:10px;">⏰</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Your Plan Has Expired</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">Renew now to continue enjoying premium features</p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="background:#fff;padding:36px 40px 32px;">

      <p style="margin:0 0 20px;font-size:16px;color:#0f172a;font-weight:500;">
        Hi <strong style="color:#ea580c;">${candidateName}</strong> 👋
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
        Your <strong>${planName}</strong> plan on <strong>CodifyX</strong> expired on
        <strong style="color:#ea580c;">${fmt(endDate)}</strong>.
        Your access to premium features has been paused. Renew today to get back on track!
      </p>

      <!-- Expiry Box -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:16px;margin-bottom:24px;overflow:hidden;">
        <tr>
          <td colspan="2" style="background:#ffedd5;border-bottom:1.5px solid #fed7aa;padding:12px 22px;">
            <span style="font-size:12px;font-weight:700;color:#c2410c;letter-spacing:0.5px;text-transform:uppercase;">
              ⚠️ &nbsp; Expiry Details
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 22px 5px;width:40%;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">🏷️ &nbsp; Plan</td>
          <td style="padding:12px 22px 5px;font-size:15px;font-weight:700;color:#0f172a;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:5px 22px 14px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.3px;">📅 &nbsp; Expired On</td>
          <td style="padding:5px 22px 14px;font-size:15px;font-weight:700;color:#ea580c;">${fmt(endDate)}</td>
        </tr>
      </table>

      <!-- What you're missing -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#fafbff;border:1.5px solid #c7d2fe;border-radius:14px;margin-bottom:28px;">
        <tr>
          <td style="padding:18px 22px;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:0.4px;">
              🔒 &nbsp; What You're Missing
            </p>
            <ul style="margin:0;padding-left:18px;font-size:14px;color:#374151;line-height:2.1;">
              <li>Unlimited code submissions</li>
              <li>AI-powered HR mock interviews</li>
              <li>Live expert sessions</li>
              <li>Priority problem access</li>
            </ul>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${renewUrl || (process.env.CLIENT_URL || "http://localhost:5173") + "/upgrade"}"
           style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 18px rgba(249,115,22,0.35);">
          🔄 &nbsp; Renew My Plan
        </a>
      </div>

      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">
        Need help? Contact us at
        <a href="mailto:${process.env.EMAIL_FROM}" style="color:#ea580c;font-weight:600;">${process.env.EMAIL_FROM}</a>
      </p>
      <p style="margin:12px 0 0;font-size:15px;color:#0f172a;font-weight:600;">
        See you soon! 💪<br/>
        <span style="color:#f97316;">The CodifyX Team</span>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#f8f9fc;border-top:1.5px solid #e2e8f0;border-radius:0 0 20px 20px;padding:20px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#6366f1;">CodifyX</p>
      <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.6;">
        You received this because you had an active subscription.<br/>
        © ${new Date().getFullYear()} CodifyX. All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"CodifyX" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `⏰ Your ${planName} Plan Has Expired — Renew Now!`,
    html,
  });
};
