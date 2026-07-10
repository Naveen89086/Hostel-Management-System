import { config } from '../config/env';
import Groq from 'groq-sdk';

export interface ParsedRequest {
  intent: 'action' | 'query' | 'general';
  actionName: string | null;
  actionParams: Record<string, any>;
  friendlyResponse: string;
  requiresConfirmation: boolean;
  
  // Legacy fields for creating requests
  type?: 'room_allocation' | 'room_change' | 'maintenance' | 'complaint' | 'vacate' | 'general';
  title?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  isActionable?: boolean;
  roomNumber?: string;
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

ROLE-BASED ACCESS CONTROL (RBAC) RULES:
- STUDENT can ONLY check their own status, apply for leave, submit complaints, or trigger SOS.
- WARDEN can ONLY approve/reject leaves, resolve/reject complaints, and resolve emergency alerts.
- ADMIN can ONLY add wardens, toggle maintenance mode, and view all system stats.
- NEVER allow a user to perform an action or view data outside their role. If they ask, refuse politely and set actionName to null.

Your job is to read the user's message, understand the conversational history, and determine their intent. You MUST respond in pure JSON format matching this schema:
{
  "intent": "action" | "query" | "general",
  "actionName": "APPROVE_LEAVE" | "REJECT_LEAVE" | "RESOLVE_COMPLAINT" | "REJECT_COMPLAINT" | "RESOLVE_ALERT" | "ADD_WARDEN" | "TOGGLE_MAINTENANCE" | "CREATE_REQUEST" | "CANCEL_REQUEST" | null,
  "actionParams": { 
     "roomNumber": "string if applicable", 
     "studentName": "string if applicable",
     "email": "string if applicable"
  },
  "friendlyResponse": "Your conversational response. If they asked a question, answer it directly using the context provided. If they requested an action, ask for confirmation.",
  "requiresConfirmation": boolean (true for all state-changing actions like approve, reject, add, delete, resolve),
  
  // Only include these if actionName is "CREATE_REQUEST"
  "type": "room_allocation" | "room_change" | "maintenance" | "complaint" | "vacate" | "general",
  "title": "A short 3-5 word title of their intent",
  "category": "Plumbing, Electrical, General, Cleaning, Leave, Emergency, etc.",
  "urgency": "low" | "medium" | "high" | "critical",
  "isActionable": boolean (true if CREATE_REQUEST)
}

Context for friendly responses:
- If the user explicitly confirms an action you asked about (e.g. they say "Yes" or "Do it"), you must STILL output the actionName and actionParams that they are confirming, but set requiresConfirmation to FALSE so the system executes it.
- If they ask something unrelated to hostel management, politely decline and set intent to "general".
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
        intent: parsedData.intent || 'general',
        actionName: parsedData.actionName || null,
        actionParams: parsedData.actionParams || {},
        friendlyResponse: parsedData.friendlyResponse || "I can help with that!",
        requiresConfirmation: parsedData.requiresConfirmation || false,
        
        type: parsedData.type || 'general',
        title: parsedData.title || 'Inquiry',
        description: userMessage,
        category: parsedData.category || null,
        urgency: parsedData.urgency || 'low',
        isActionable: parsedData.isActionable || false,
      };
    }
  } catch (error) {
    console.error("Groq API Error:", error);
  }

  // Fallback if API fails
  return {
    intent: 'general',
    actionName: null,
    actionParams: {},
    friendlyResponse: "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment!",
    requiresConfirmation: false,
    type: 'general',
    title: 'Unrecognized Request',
    description: userMessage,
    isActionable: false
  };
};
