import type { NextApiRequest, NextApiResponse } from 'next';

import {OpenAI} from 'openai'

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET, 
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {

    const response=await openai.chat.completions.create({
        messages:[{role:'user',content:`Suggest details for a task based on the title: "${title}"`}],
        model:'gpt-3.5-turbo',
        max_tokens:5
    })

    const suggestions = response.choices[0].message.content;
    res.status(200).json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Error generating suggestions', error });
  }
}
