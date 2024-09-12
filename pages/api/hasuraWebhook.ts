
import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';
import { nhost } from '../../utils/nhost';


let transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  secure: false,
  auth: {
      user: 'samiuljust2018@gmail.com',
      pass: 'qJ90I7C2WhN6bBsR'
  }
})

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

async function getUserEmail(userId: string): Promise<string | null> {
  const query = `
    query GetUserEmail($userId: uuid!) {
      users_by_pk(id: $userId) {
        email
      }
    }
  `;

  // Make GraphQL request with Nhost
  const response = await nhost.graphql.request(query, { userId });

  // Check if the response contains the email
  if (response?.data?.users_by_pk?.email) {
    return response.data.users_by_pk.email;
  } else {
    console.error('No user email found or GraphQL error:', response?.error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received body:', req.body); // For debugging

  const { event } = req.body as { event: Event };

  if (event.op === 'UPDATE' && event.data.new.completed) {
    const { user_id, title } = event.data.new;
    const userEmail = await getUserEmail(user_id);

      if (!userEmail) {
        return res.status(400).json({ error: 'User email not found' });
      }

    try {
      const response=await transporter.sendMail({
        from: 'samiulcse2018@gmail.com', // Your email address
        to: userEmail,
        subject: 'Task Completed Notification',
        text: `The task "${title}" has been marked as completed.`,
      });
      console.log(response)




      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  } else {
    res.status(200).json({ message: 'No action taken' });
  }
}
