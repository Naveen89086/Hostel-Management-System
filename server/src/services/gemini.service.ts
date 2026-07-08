import { config } from '../config/env';
import Groq from 'groq-sdk';

export interface ParsedRequest {
  type: 'room_allocation' | 'room_change' | 'maintenance' | 'complaint' | 'vacate' | 'general';
  title: string;
  description: string;
  roomNumber: string | null;
  category: string | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  isActionable: boolean;
  friendlyResponse: string;
}

const groq = new Groq({ apiKey: config.groqApiKey });

export const parseHostelRequest = async (
  userMessage: string, 
  role: string = 'student', 
  contextData: string = '', 
  chatHistory: { role: 'user' | 'assistant', content: string }[] = []
): Promise<ParsedRequest> => {
  const SYSTEM_PROMPT = `
You are the AI Hostel Management Agent for 'HostelHub'. 
You are currently talking to a user with the role: ${role.toUpperCase()}.

Here is the real-time database context for this user. You MUST use this data to answer their questions accurately:
${contextData}

Your job is to read the user's message, understand the conversational history, and determine their intent. You MUST respond in pure JSON format matching this schema:
{
  "type": "room_allocation" | "room_change" | "maintenance" | "complaint" | "vacate" | "general",
  "title": "A short 3-5 word title of their intent",
  "category": "Plumbing, Electrical, General, Cleaning, Leave, etc.",
  "urgency": "low" | "medium" | "high" | "critical",
  "isActionable": boolean (true if they are asking you to perform an action or if they need to be redirected to a form, false if it's just a general question or greeting),
  "friendlyResponse": "Your conversational, helpful response to the user. If they asked a question about stats, their room, or requests, answer it directly using the context provided."
}

Context for friendly responses:
- Mess timings: Breakfast 7:30-9AM, Lunch 12:30-2PM, Dinner 7-9PM.
- If the user asks something unrelated to hostel management, politely decline to answer and set type to "general", isActionable to false.
- ALWAYS be helpful and conversational.
`;

  try {
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const aiResponseContent = response.choices[0]?.message?.content;
    
    if (aiResponseContent) {
      const parsedData = JSON.parse(aiResponseContent);
      return {
        type: parsedData.type || 'general',
        title: parsedData.title || 'Inquiry',
        description: userMessage,
        roomNumber: null,
        category: parsedData.category || null,
        urgency: parsedData.urgency || 'low',
        isActionable: parsedData.isActionable || false,
        friendlyResponse: parsedData.friendlyResponse || "I can help with that!"
      };
    }
  } catch (error) {
    console.error("Groq API Error:", error);
  }

  // Fallback if API fails
  return {
    type: 'general',
    title: 'Unrecognized Request',
    description: userMessage,
    roomNumber: null,
    category: null,
    urgency: 'low',
    isActionable: false,
    friendlyResponse: "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment!"
  };
};
