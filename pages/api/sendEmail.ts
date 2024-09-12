import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or any other email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
    host: 'mail.nodescript-it.com', // Replace with your cPanel mail server
    port: 465,                    // Port for SSL
    secure: true,                 // Use SSL
    auth: {
      user: 'contact@nodescript-it.com', // Replace with your cPanel email address
      pass: '1ts1Tc_2w6^=',       // Replace with your cPanel email password
    },
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { to, subject, text } = req.body as { to: string; subject: string; text: string };

  try {
    await transporter.sendMail({
      from: 'samiulcse2018@gmail.com',
      to,
      subject,
      text,
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
}
