import nodemailer from "nodemailer";

export const sendInviteEmail = async (
  email: string,
  inviteLink: string
) => {
  const MAIL_USER = process.env.MAIL_USER;
  const MAIL_PASS = process.env.MAIL_PASS;

  /* ================= ENV CHECK ================= */

  if (!MAIL_USER || !MAIL_PASS) {
    console.log("MAIL ENV NOT SET — DEV MODE");
    console.log("Invite link:", inviteLink);
    return;
  }

  try {
    /* ================= TRANSPORT ================= */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });

    /* ================= VERIFY ================= */

    await transporter.verify();
    console.log("SMTP READY");

    /* ================= SEND ================= */

    const info = await transporter.sendMail({
      from: `"Room Booking System" <${MAIL_USER}>`,
      to: email,
      subject: "You're invited to Room Booking System",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Welcome</h2>

          <p>You have been invited to join the Room Booking System.</p>

          <a
            href="${inviteLink}"
            style="
              display:inline-block;
              padding:12px 18px;
              background:#6366f1;
              color:white;
              text-decoration:none;
              border-radius:6px;
              margin-top:10px;
            "
          >
            Set Password
          </a>

          <p style="margin-top:20px;color:#666">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });

    console.log("Invite email sent:", info.messageId);
  } catch (error) {
    console.error("EMAIL SEND FAILED:", error);

    console.log("User created but email failed");
  }
};