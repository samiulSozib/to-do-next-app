import { NextApiRequest, NextApiResponse } from 'next';

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
  const { event } = req.body as { event: Event };

  if (event.op === 'UPDATE' && event.data.new.completed) {
    const { user_id, title } = event.data.new;

    try {
      // Fetch the user's email
      // const userEmail = await getUserEmail(user_id);
      const userEmail = "samiuljust2018@gmail.com";

      // Send email notification
      await fetch(`/api/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: 'Task Completed Notification',
          text: `The task  has been marked as completed.`,
        }),
      });

      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Error handling webhook' });
    }
  } else {
    res.status(200).json({ message: 'No action taken' });
  }
}
