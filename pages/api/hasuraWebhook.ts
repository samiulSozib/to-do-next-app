// import { NextApiRequest, NextApiResponse } from 'next';

// interface Event {
//   op: string;
//   data: {
//     new: {
//       user_id: string;
//       title: string;
//       completed: boolean;
//     };
//   };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { event } = req.body as { event: Event };

//   if (event.op === 'UPDATE' && event.data.new.completed) {
//     const { user_id, title } = event.data.new;

//     try {
//       // Fetch the user's email
//       // const userEmail = await getUserEmail(user_id);
//       const userEmail = "samiuljust2018@gmail.com";

//       // Send email notification
//       await fetch(`https://to-do-next-app-mocha.vercel.app/api/sendEmail`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           to: userEmail,
//           subject: 'Task Completed Notification',
//           text: `The task  has been marked as completed.`,
//         }),
//       });

//       res.status(200).json({ message: 'Notification sent' });
//     } catch (error) {
//       console.error('Error handling webhook:', error);
//       res.status(500).json({ error: 'Error handling webhook' });
//     }
//   } else {
//     res.status(200).json({ message: 'No action taken' });
//   }
// }



import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'mail.nodescript-it.com', // Your cPanel mail server
  port: 465,                     // SSL Port
  secure: true,                  // Use SSL
  auth: {
    user: 'contact@nodescript-it.com', // Your cPanel email address
    pass: '1ts1Tc_2w6^=',      // Your cPanel email password
  },
});

interface Event {
  op: string;
  data: {
    new: {
      user_id: string;
      title: string;
      completed: boolean;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received body:', req.body); // For debugging

  const { event } = req.body as { event: Event };

  if (event.op === 'UPDATE' && event.data.new.completed) {
    const { user_id, title } = event.data.new;
    const userEmail = "samiuljust2018@gmail.com"; // Replace with actual user email retrieval

    try {
      // const response=await transporter.sendMail({
      //   from: 'samiulcse2018@gmail.com', // Your email address
      //   to: userEmail,
      //   subject: 'Task Completed Notification',
      //   text: `The task "${title}" has been marked as completed.`,
      // });
      // console.log(response)
      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  } else {
    res.status(200).json({ message: 'No action taken' });
  }
}
