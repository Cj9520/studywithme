import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testMail() {
  await transporter.verify(); // ← THIS IS IMPORTANT
  console.log("SMTP verified");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Test Mail",
    text: "If you got this, nodemailer works.",
  });

  console.log("Mail sent");
}

testMail().catch(console.error);
