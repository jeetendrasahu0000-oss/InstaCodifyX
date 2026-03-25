import nodemailer from "nodemailer";

// ✅ Transporter function (IMPORTANT FIX)
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL credentials missing");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ✅ COMMON SEND FUNCTION (reusable)
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"CodeifyX Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
};

// 🎨 EMAIL TEMPLATE WITH LOGO
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <img 
        src="https://i.pinimg.com/1200x/17/43/c7/1743c7e316bba74fd234568fe0c91acb.jpg" 
        alt="CodeifyX Logo" 
        style="max-width: 80px; height: auto; border-radius: 50%; border: 3px solid #ffffff; margin-bottom: 16px;"
      />
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CodeifyX</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Where Code Meets Creativity</p>
    </div>
    
    <!-- Email Content -->
    <div style="padding: 40px 30px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 24px 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 8px; color: #6c757d; font-size: 13px;">
        © 2024 CodeifyX. All rights reserved.
      </p>
      <p style="margin: 0; color: #6c757d; font-size: 12px;">
        Need help? Contact us at 
        <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none;">${process.env.EMAIL_USER}</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// ✅ APPROVAL EMAIL
export const sendApprovalEmail = async (toEmail, username, loginUrl) => {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h2 style="color: #2d3748; margin-bottom: 12px;">Congratulations, ${username}! 👋</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Your request has been <strong style="color: #48bb78;">approved</strong>! 
        You can now login and start creating amazing problems for our community.
      </p>
      <a href="${loginUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 24px;">
        Login Now →
      </a>
      <div style="background-color: #f0fdf4; border-left: 4px solid #48bb78; padding: 16px; border-radius: 8px; margin-top: 24px;">
        <p style="margin: 0; color: #2d3748; font-size: 14px;">
          💡 <strong>Pro Tip:</strong> Start by creating your first problem set and share it with the community!
        </p>
      </div>
    </div>
  `;
  
  await sendEmail({
    to: toEmail,
    subject: "✅ Your Problem Setter Request Has Been Approved!",
    html: getEmailTemplate(content, "Approved"),
  });
};

// ❌ REJECTION EMAIL
export const sendRejectionEmail = async (toEmail, username) => {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
      <h2 style="color: #2d3748; margin-bottom: 12px;">Hello ${username}</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        We regret to inform you that your request was <strong style="color: #f56565;">not approved</strong> at this time.
      </p>
      <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #2d3748; font-size: 14px;">
          📝 Don't worry! You can improve your application and try again later. 
          Make sure to include detailed information about your experience and problem-solving skills.
        </p>
      </div>
      <p style="color: #718096; font-size: 14px;">
        Need feedback? Reach out to our support team.
      </p>
    </div>
  `;
  
  await sendEmail({
    to: toEmail,
    subject: "❌ Problem Setter Request Update",
    html: getEmailTemplate(content, "Not Approved"),
  });
};

// 📬 REQUEST RECEIVED EMAIL
export const sendRequestReceivedEmail = async (toEmail, username) => {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">📬</div>
      <h2 style="color: #2d3748; margin-bottom: 12px;">Welcome to CodeifyX, ${username}! 👋</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Your request has been successfully received and is now under review.
      </p>
      <div style="background-color: #ebf4ff; border-left: 4px solid #667eea; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; color: #2d3748; font-size: 14px;">
          ⏰ <strong>Review Timeline:</strong> We will review your application within 24–48 hours. 
          You'll receive an email once a decision is made.
        </p>
      </div>
      <p style="color: #718096; font-size: 14px;">
        In the meantime, explore our platform and get familiar with the problem creation tools!
      </p>
    </div>
  `;
  
  await sendEmail({
    to: toEmail,
    subject: "📬 Request Received - CodeifyX Problem Setter Application",
    html: getEmailTemplate(content, "Request Received"),
  });
};

// 🎉 WELCOME EMAIL (Bonus)
export const sendWelcomeEmail = async (toEmail, username) => {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h2 style="color: #2d3748; margin-bottom: 12px;">Welcome to CodeifyX, ${username}!</h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        We're thrilled to have you on board! Get ready to create amazing problems and help fellow developers grow.
      </p>
      <div style="display: flex; justify-content: center; gap: 16px; margin: 24px 0;">
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 12px; flex: 1;">
          <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
          <p style="margin: 0; color: #2d3748; font-weight: 600;">Create Problems</p>
        </div>
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 12px; flex: 1;">
          <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
          <p style="margin: 0; color: #2d3748; font-weight: 600;">Build Community</p>
        </div>
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 12px; flex: 1;">
          <div style="font-size: 24px; margin-bottom: 8px;">🏆</div>
          <p style="margin: 0; color: #2d3748; font-weight: 600;">Earn Recognition</p>
        </div>
      </div>
      <a href="${process.env.APP_URL || 'https://codeifyx.com'}/dashboard" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Go to Dashboard →
      </a>
    </div>
  `;
  
  await sendEmail({
    to: toEmail,
    subject: "🎉 Welcome to CodeifyX! Get Started Today",
    html: getEmailTemplate(content, "Welcome"),
  });
};