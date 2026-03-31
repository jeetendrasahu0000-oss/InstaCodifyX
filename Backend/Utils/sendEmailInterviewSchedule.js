import nodemailer from 'nodemailer'
import { createGoogleMeet } from './googleMeet.js'
import InterviewSchedule from '../Models/InterviewSchedule.js'

export const sendInterviewMail = async ({
  to,
  candidateName,
  date,
  time,
  meetingLink,
  scheduleId,
  accessToken,
  autoGenerate = true
}) => {

  let finalMeetingLink = meetingLink

  // ✅ Generate Meet link using accessToken
  if (autoGenerate && !meetingLink && accessToken) {
    try {
      console.log('🔗 Generating Google Meet link...')

      finalMeetingLink = await createGoogleMeet({
        summary: `Interview with ${candidateName}`,
        date,
        time,
        attendees: [to],
        accessToken
      })

      console.log('✅ Meet link generated:', finalMeetingLink)

      if (scheduleId) {
        await InterviewSchedule.findByIdAndUpdate(scheduleId, {
          meetingLink: finalMeetingLink
        })
      }

    } catch (error) {
      console.error('❌ Meet generation failed:', error.message)
    }
  }

  // 📧 Mail Config
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const formatted = new Date(`${date}T${time}:00`).toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })

  // Date & Time separately for display
  const dateOnly = new Date(`${date}T${time}:00`).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
  const timeOnly = new Date(`${date}T${time}:00`).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  })

  const meetButtonHtml = finalMeetingLink
    ? `
      <div style="text-align:center; margin: 36px 0 28px;">
        <a href="${finalMeetingLink}"
           style="
             display: inline-block;
             background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
             color: #ffffff;
             text-decoration: none;
             padding: 16px 40px;
             border-radius: 50px;
             font-size: 16px;
             font-weight: 700;
             font-family: 'Segoe UI', Arial, sans-serif;
             letter-spacing: 0.3px;
             box-shadow: 0 4px 18px rgba(66,133,244,0.4);
           ">
          🎥 &nbsp; Join Google Meet
        </a>
        <p style="margin: 14px 0 0; font-size: 12px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif;">
          Or copy this link: 
          <a href="${finalMeetingLink}" style="color: #4285F4; word-break: break-all;">${finalMeetingLink}</a>
        </p>
      </div>
    `
    : `
      <div style="
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 10px;
        padding: 14px 20px;
        margin: 24px 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 14px;
        color: #856404;
        text-align: center;
      ">
        ⚠️ &nbsp; Meet link could not be generated. Our team will share it shortly.
      </div>
    `

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Interview Scheduled — CodifyX</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Arial, sans-serif;">

  <!-- Outer Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              border-radius: 20px 20px 0 0;
              padding: 36px 40px 32px;
              text-align: center;
            ">
              <!-- Logo / Brand -->
              <div style="
                display: inline-block;
                background: rgba(255,255,255,0.15);
                border: 2px solid rgba(255,255,255,0.25);
                border-radius: 14px;
                padding: 10px 22px;
                margin-bottom: 20px;
              ">
                <span style="color:#fff; font-size:20px; font-weight:800; letter-spacing:-0.5px;">
                  Codify<span style="color:#a5f3fc;">X</span>
                </span>
              </div>

              <h1 style="
                margin: 0 0 8px;
                color: #ffffff;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
              ">
                Interview Scheduled! 🎯
              </h1>
              <p style="margin:0; color:rgba(255,255,255,0.75); font-size:15px; line-height:1.5;">
                Your interview has been confirmed. Please find the details below.
              </p>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="
              background: #ffffff;
              padding: 40px 40px 32px;
            ">

              <!-- Greeting -->
              <p style="margin: 0 0 24px; font-size:16px; color:#0f172a; font-weight:500;">
                Dear <strong style="color:#6366f1;">${candidateName}</strong>, 👋
              </p>
              <p style="margin: 0 0 28px; font-size:15px; color:#475569; line-height:1.7;">
                We are pleased to inform you that your HR interview with <strong>CodifyX</strong> has been successfully scheduled.
                Please review the details below and join on time.
              </p>

              <!-- Interview Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background: #f8f9fc;
                border: 1.5px solid #e2e8f0;
                border-radius: 16px;
                margin-bottom: 8px;
                overflow: hidden;
              ">
                <!-- Card Header -->
                <tr>
                  <td colspan="2" style="
                    background: #eef2ff;
                    border-bottom: 1.5px solid #e2e8f0;
                    padding: 14px 24px;
                  ">
                    <span style="font-size:13px; font-weight:700; color:#6366f1; letter-spacing:0.5px; text-transform:uppercase;">
                      📋 &nbsp; Interview Details
                    </span>
                  </td>
                </tr>

                <!-- Candidate -->
                <tr>
                  <td style="padding: 16px 24px 8px; width:40%; font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px;">
                    👤 &nbsp; Candidate
                  </td>
                  <td style="padding: 16px 24px 8px; font-size:15px; font-weight:700; color:#0f172a;">
                    ${candidateName}
                  </td>
                </tr>

                <!-- Date -->
                <tr>
                  <td style="padding: 8px 24px; font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px;">
                    📅 &nbsp; Date
                  </td>
                  <td style="padding: 8px 24px; font-size:15px; font-weight:600; color:#0f172a;">
                    ${dateOnly}
                  </td>
                </tr>

                <!-- Time -->
                <tr>
                  <td style="padding: 8px 24px; font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px;">
                    🕐 &nbsp; Time
                  </td>
                  <td style="padding: 8px 24px; font-size:15px; font-weight:600; color:#0f172a;">
                    ${timeOnly} (IST)
                  </td>
                </tr>

                <!-- Mode -->
                <tr>
                  <td style="padding: 8px 24px 16px; font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.4px;">
                    📡 &nbsp; Mode
                  </td>
                  <td style="padding: 8px 24px 16px; font-size:15px; font-weight:600; color:#0f172a;">
                    <span style="
                      background:#dcfce7;
                      color:#16a34a;
                      border-radius:999px;
                      padding: 3px 12px;
                      font-size:13px;
                      font-weight:700;
                    ">● Online — Google Meet</span>
                  </td>
                </tr>
              </table>

              <!-- Meet Button -->
              ${meetButtonHtml}

              <!-- Tips Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background: #fffbeb;
                border: 1.5px solid #fde68a;
                border-radius: 14px;
                margin-top: 8px;
              ">
                <tr>
                  <td style="padding: 18px 24px;">
                    <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#92400e; text-transform:uppercase; letter-spacing:0.4px;">
                      💡 &nbsp; Quick Tips
                    </p>
                    <ul style="margin:0; padding-left:18px; font-size:14px; color:#78350f; line-height:1.9;">
                      <li>Join the meeting <strong>5 minutes early</strong> to test your setup.</li>
                      <li>Ensure your <strong>camera & microphone</strong> are working.</li>
                      <li>Keep a <strong>stable internet connection</strong> ready.</li>
                      <li>Have your <strong>resume</strong> and any relevant documents handy.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <p style="margin: 28px 0 0; font-size:15px; color:#475569; line-height:1.7;">
                We look forward to speaking with you. If you have any questions, feel free to reach out to us at
                <a href="mailto:${process.env.EMAIL_FROM}" style="color:#6366f1; font-weight:600;">${process.env.EMAIL_FROM}</a>.
              </p>
              <p style="margin: 16px 0 0; font-size:15px; color:#0f172a; font-weight:600;">
                Best regards,<br/>
                <span style="color:#6366f1;">The CodifyX Team</span>
              </p>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="
              background: #f8f9fc;
              border-top: 1.5px solid #e2e8f0;
              border-radius: 0 0 20px 20px;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="margin:0 0 6px; font-size:13px; font-weight:700; color:#6366f1; letter-spacing:-0.2px;">
                CodifyX
              </p>
              <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.6;">
                This is an automated email. Please do not reply directly to this message.<br/>
                © ${new Date().getFullYear()} CodifyX. All rights reserved.
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

  await transporter.sendMail({
    from: `"CodifyX" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `🎯 Interview Scheduled | CodifyX — ${dateOnly}`,
    html,
  })

  return { success: true, meetingLink: finalMeetingLink }
}