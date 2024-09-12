
import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';


let transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  secure: false,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
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
    const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT||''
    const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET||'';

  
    const query = `
      query GetUserEmail($userId: uuid!) {
        users(where:{id:{_eq:$userId}}) {
          email
        }
      }
    `;
  
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query,
        variables: { userId },
      }),
    });
  
    const data = await response.json();
    
    if (data?.data?.users[0]?.email) {
      return data.data.users[0].email;
    } else {
      console.error('No user email found');
      return null;
    }
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received body:', req.body); // For debugging

  const { event } = req.body as { event: Event };

  if (event.op === 'UPDATE' && event.data.new.completed) {
    const { user_id, title } = event.data.new;
    

      const user_email=await getUserEmail(user_id)

      if (!user_email) {
        return res.status(400).json({ error: 'User email not found' });
      }

    try {
      await transporter.sendMail({
        from: 'samiulcse2018@gmail.com', // Your email address
        to: user_email,
        subject: 'Task Completed Notification',
        text: `The task "${title}" has been marked as completed."`,
      });
     




      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending email' });
    }
  } else {
    res.status(200).json({ message: 'No action taken' });
  }
}
