import nodemailer from "nodemailer";

export const sendInviteEmail = async (
  email: string,
  tempPassword: string
) => {

  const MAIL_USER = process.env.MAIL_USER;
  const MAIL_PASS = process.env.MAIL_PASS;

  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  /* ================= ENV CHECK ================= */

  if (!MAIL_USER || !MAIL_PASS) {

    console.log("MAIL ENV NOT SET — DEV MODE");
    console.log("User Email:", email);
    console.log("Temporary Password:", tempPassword);
    console.log("Login URL:", loginUrl);

    return;
  }

  try {

    /* ================= SMTP ================= */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP READY");

    /* ================= EMAIL HTML ================= */

    const html = `
    <div style="
      font-family:Arial, sans-serif;
      max-width:520px;
      margin:auto;
      padding:24px;
      background:#ffffff;
      border-radius:10px;
      border:1px solid #f1f5f9;
    ">

      <h2 style="color:#dc2626;margin-bottom:10px">
        Welcome to Room Booking System
      </h2>

      <p style="color:#374151">
        Your account has been created by the administrator.
      </p>

      <p>
        <b>Email:</b> ${email}
      </p>

      <p>
        <b>Temporary Password:</b>
        <span style="
          background:#fef2f2;
          padding:6px 10px;
          border-radius:6px;
          font-weight:600;
          border:1px solid #fecaca;
        ">
          ${tempPassword}
        </span>
      </p>

      <p style="margin-top:12px;color:#374151">
        Please login using this password and change it immediately.
      </p>

      <a
        href="${loginUrl}"
        style="
          display:inline-block;
          margin-top:18px;
          padding:12px 22px;
          background:#dc2626;
          color:white;
          text-decoration:none;
          border-radius:8px;
          font-weight:600;
          box-shadow:0 8px 18px rgba(220,38,38,.25);
        "
      >
        Login to System
      </a>

      <p style="
        margin-top:22px;
        font-size:13px;
        color:#6b7280;
      ">
        For security reasons you will be asked to change your password
        after your first login.
      </p>

      <hr style="margin-top:25px;border:none;border-top:1px solid #eee"/>

      <p style="
        font-size:12px;
        color:#9ca3af;
      ">
        Room Booking System
      </p>

    </div>
    `;

    /* ================= SEND ================= */

    const info = await transporter.sendMail({
      from: `"Room Booking System" <${MAIL_USER}>`,
      to: email,
      subject: "Your Room Booking System Account",
      html,
    });

    console.log("User email sent:", info.messageId);

  } catch (error) {

    console.error("EMAIL SEND FAILED:", error);

    console.log("User created but email failed");

  }
};