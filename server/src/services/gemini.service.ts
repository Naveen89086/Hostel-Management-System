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

const SYSTEM_PROMPT = `
You are the AI Hostel Management Agent for 'HostelHub'. 
Your job is to read the user's message and determine their intent. You MUST respond in pure JSON format matching this schema:
{
  "type": "room_allocation" | "room_change" | "maintenance" | "complaint" | "vacate" | "general",
  "title": "A short 3-5 word title of their intent",
  "category": "Plumbing, Electrical, General, Cleaning, Leave, etc.",
  "urgency": "low" | "medium" | "high" | "critical",
  "isActionable": boolean (true if they are asking you to perform an action or if they need to be redirected to a form, false if it's just a general question),
  "friendlyResponse": "Your conversational, helpful response to the user. Guide them to the correct dashboard page if they need to perform an action."
}

Context for friendly responses:
- Mess timings: Breakfast 7:30-9AM, Lunch 12:30-2PM, Dinner 7-9PM.
- Leave: Guide them to the 'Apply Leave' page.
- Complaint: Guide them to 'Complaint Management -> New Complaint'.
- Room change: Guide them to 'Room Change Request'.
- If the user asks something unrelated to hostel management, politely decline to answer and set type to "general".
- Always answer intelligently and helpfully.
`;

export const parseHostelRequest = async (userMessage: string, role: string = 'student'): Promise<ParsedRequest> => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `User Role: ${role}\nUser Message: "${userMessage}"` }
      ],
      model: 'llama3-8b-8192',
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
        friendlyResponse: parsedData.friendlyResponse || "I can help with that! Please navigate to the appropriate section in your dashboard."
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
