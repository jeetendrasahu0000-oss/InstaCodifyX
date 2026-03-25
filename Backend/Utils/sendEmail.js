import nodemailer from 'nodemailer'

// ─── Core email sender ────────────────────────────────────────────────────────
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,          // false for port 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false   // for local dev
      }
    })

    await transporter.sendMail({
      from: `"CodifyX" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })

    console.log(`✅ Email sent to ${to}`)
  } catch (err) {
    console.error('❌ sendEmail error:', err.message)
    throw new Error('Failed to send email.')
  }
}

// ─── OTP Email ────────────────────────────────────────────────────────────────
export const sendOTPEmail = async (to, otp, customMsg = null) => {
  const msg = customMsg || 'Use this code to verify your CodifyX account.'

  await sendEmail(
    to,
    'Your CodifyX Verification Code',
    `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="
              background:#13181f;
              border-radius:16px;
              border:1px solid rgba(48,54,61,0.9);
              overflow:hidden;
            ">
              <!-- Header -->
              <tr>
                <td style="
                  background:linear-gradient(135deg,#6366f1,#8b5cf6);
                  padding:28px 36px;
                  text-align:center;
                ">
                  <div style="
                    display:inline-block;
                    width:50px;height:50px;
                    background:rgba(255,255,255,0.15);
                    border-radius:13px;
                    line-height:50px;
                    font-size:20px;font-weight:800;
                    color:#fff;margin-bottom:12px;
                  ">CX</div>
                  <h1 style="color:#fff;margin:0;font-size:19px;font-weight:700;letter-spacing:-0.3px;">
                    Verification Code
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 36px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.65);font-size:14.5px;line-height:1.65;margin:0 0 24px;">
                    ${msg}
                  </p>

                  <!-- OTP Box -->
                  <div style="
                    background:rgba(99,102,241,0.08);
                    border:1px solid rgba(99,102,241,0.3);
                    border-radius:14px;
                    padding:24px;
                    margin:0 auto 24px;
                    display:inline-block;
                    min-width:220px;
                  ">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#8b949e;letter-spacing:1.5px;text-transform:uppercase;">
                      Your OTP
                    </p>
                    <div style="
                      font-size:44px;font-weight:800;
                      letter-spacing:12px;
                      color:#a78bfa;
                      font-family:'Courier New',monospace;
                      line-height:1;
                    ">${otp}</div>
                  </div>

                  <p style="color:rgba(255,255,255,0.35);font-size:12.5px;margin:0;">
                    Expires in <strong style="color:#a78bfa;">10 minutes</strong>
                    &nbsp;·&nbsp; Never share this code
                  </p>
                </td>
              </tr>

              <!-- Warning -->
              <tr>
                <td style="padding:0 36px 24px;">
                  <div style="
                    background:rgba(248,81,73,0.06);
                    border:1px solid rgba(248,81,73,0.15);
                    border-radius:8px;
                    padding:11px 15px;
                  ">
                    <p style="margin:0;font-size:12px;color:#f85149;">
                      ⚠️ CodifyX will never ask for this code. Do not share it with anyone.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="
                  padding:16px 36px;
                  border-top:1px solid rgba(48,54,61,0.6);
                  text-align:center;
                ">
                  <p style="margin:0;font-size:11.5px;color:rgba(255,255,255,0.2);">
                    © ${new Date().getFullYear()} CodifyX · If you didn't request this, ignore safely.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  )
}

// ─── Password Reset Email ─────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (to, resetLink) => {
  await sendEmail(
    to,
    'Reset your CodifyX password',
    `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="
              background:#13181f;border-radius:16px;
              border:1px solid rgba(48,54,61,0.9);overflow:hidden;
            ">
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a,#1e1b4b);padding:28px 36px;text-align:center;border-bottom:1px solid rgba(48,54,61,0.6);">
                  <div style="display:inline-block;width:50px;height:50px;background:#6366f1;border-radius:13px;line-height:50px;font-size:20px;font-weight:800;color:#fff;margin-bottom:12px;">CX</div>
                  <h1 style="color:#fff;margin:0;font-size:19px;font-weight:700;">Reset Password</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 36px;">
                  <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.65;">
                    Click the button below to reset your password. This link expires in <strong style="color:#e6edf3;">15 minutes</strong>.
                  </p>
                  <div style="text-align:center;margin-bottom:24px;">
                    <a href="${resetLink}" style="
                      display:inline-block;background:#6366f1;color:#fff;
                      text-decoration:none;padding:13px 32px;border-radius:10px;
                      font-size:14px;font-weight:700;
                    ">Reset My Password</a>
                  </div>
                  <p style="margin:0 0 8px;font-size:12px;color:#8b949e;">Or copy this link:</p>
                  <p style="
                    margin:0;padding:10px 14px;
                    background:#0d1117;border:1px solid rgba(48,54,61,0.8);
                    border-radius:8px;font-size:11px;color:#8b949e;
                    word-break:break-all;font-family:'Courier New',monospace;
                  ">${resetLink}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 36px;border-top:1px solid rgba(48,54,61,0.6);text-align:center;">
                  <p style="margin:0;font-size:11.5px;color:rgba(255,255,255,0.2);">
                    © ${new Date().getFullYear()} CodifyX · If you didn't request this, ignore safely.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  )
}