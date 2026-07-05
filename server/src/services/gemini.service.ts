import { config } from '../config/env';

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

interface KnowledgeIntent {
  keywords: string[];
  response: string;
  type?: ParsedRequest['type'];
  title?: string;
  category?: string;
  isActionable?: boolean;
}

const FALLBACK_RESPONSE: ParsedRequest = {
  type: 'general',
  title: 'Unrecognized Request',
  description: 'Unmatched intent',
  roomNumber: null,
  category: null,
  urgency: 'low',
  isActionable: false,
  friendlyResponse: "I'm sorry, I don't have information about that. Please ask a HostelHub-related question."
};

const KNOWLEDGE_BASE: Record<string, KnowledgeIntent[]> = {
  student: [
    {
      keywords: ['apply leave', 'want leave', 'take leave', 'going home', 'holiday', 'leave application', 'leave request', 'leave'],
      response: 'Go to Leave Management → Apply Leave. Select the leave dates, enter the reason for your leave, and click Submit. Your request will be sent to the Warden for approval.',
      type: 'general',
      title: 'Apply Leave',
      isActionable: true
    },
    {
      keywords: ['leave status', 'status of my leave', 'is my leave approved', 'leave approved', 'leave rejected'],
      response: 'Open Leave History to view the status of your submitted leave requests.',
      type: 'general',
      title: 'Check Leave Status',
      isActionable: false
    },
    {
      keywords: ['submit complaint', 'new complaint', 'register complaint', 'file a complaint', 'problem', 'not working', 'complaint', 'water leakage', 'room complaint', 'issue', 'broken', 'repair'],
      response: 'Go to Complaint Management → New Complaint. Select the complaint category, describe your issue, and click Submit.',
      type: 'complaint',
      title: 'Submit Complaint',
      isActionable: true
    },
    {
      keywords: ['my room number', 'what is my room', 'which room am i in', 'room details', 'room info'],
      response: 'You can view your assigned room number in the My Room section of the Student Portal.',
      type: 'general',
      title: 'Room Details',
      isActionable: false
    },
    {
      keywords: ['change room', 'change my room', 'shift room', 'different room', 'swap room', 'move room'],
      response: 'Yes. Go to Room Change Request, provide the reason for the room change, and submit your request. The Warden will review it.',
      type: 'room_change',
      title: 'Room Change Request',
      isActionable: true
    },
    {
      keywords: ['hostel rules', 'rules and regulations', 'timings', 'policy', 'guidelines'],
      response: 'Open the Hostel Rules page to view all hostel regulations and policies.',
      type: 'general',
      title: 'Hostel Rules',
      isActionable: false
    },
    {
      keywords: ['mess timings', 'breakfast time', 'lunch time', 'dinner time', 'food time', 'mess menu', 'eating time', 'food schedule'],
      response: 'Breakfast: 7:30 AM – 9:00 AM\nLunch: 12:30 PM – 2:00 PM\nDinner: 7:00 PM – 9:00 PM',
      type: 'general',
      title: 'Mess Timings',
      isActionable: false
    },
    {
      keywords: ['pay fees', 'hostel fees', 'fee payment', 'pay hostel fee', 'payment', 'due amount'],
      response: 'Go to Fee Management, review your pending fees, and complete the payment using the available payment options.',
      type: 'general',
      title: 'Fee Payment',
      isActionable: true
    }
  ],
  warden: [
    {
      keywords: ['pending leave requests', 'show leave requests', 'leave applications'],
      response: 'Open Leave Management to review all pending leave requests. You can approve or reject them individually.',
      type: 'general',
      title: 'Pending Leave Requests'
    },
    {
      keywords: ['approve leave', 'reject leave', 'how to approve leave'],
      response: 'Go to Leave Management, select the student\'s leave request, review the details, and click Approve or Reject.',
      type: 'general',
      title: 'Approve Leave'
    },
    {
      keywords: ['pending complaints', 'show complaints', 'unresolved complaints'],
      response: 'Open Complaint Management and filter by Pending to view unresolved complaints.',
      type: 'general',
      title: 'Pending Complaints'
    },
    {
      keywords: ['assign room', 'allocate room', 'give room to student'],
      response: 'Go to Room Allocation, select an available room, choose the student, and click Assign.',
      type: 'room_allocation',
      title: 'Room Allocation'
    },
    {
      keywords: ['how many rooms', 'rooms available', 'room availability', 'empty rooms'],
      response: 'Open Room Availability to view the number of available, occupied, and reserved rooms.',
      type: 'general',
      title: 'Room Availability'
    }
  ],
  admin: [
    {
      keywords: ['generate report', 'hostel report', 'download report'],
      response: 'Go to Reports, select the report type and date range, then click Generate Report.',
      type: 'general',
      title: 'Generate Report'
    },
    {
      keywords: ['add student', 'new student', 'register student'],
      response: 'Go to Student Management, click Add Student, enter the student\'s details, and click Save.',
      type: 'general',
      title: 'Add Student'
    },
    {
      keywords: ['add warden', 'new warden', 'register warden'],
      response: 'Go to User Management → Wardens, click Add Warden, enter the required details, and save the information.',
      type: 'general',
      title: 'Add Warden'
    },
    {
      keywords: ['dashboard statistics', 'system statistics', 'total students', 'occupancy'],
      response: 'The Dashboard displays the total number of students, hostel occupancy, available rooms, pending complaints, and other system statistics.',
      type: 'general',
      title: 'Dashboard Statistics'
    },
    {
      keywords: ['manage rooms', 'add room', 'edit room', 'remove room'],
      response: 'Open Room Management to add new rooms, edit existing room details, assign rooms, or remove rooms when necessary.',
      type: 'general',
      title: 'Manage Rooms'
    }
  ]
};

/**
 * Fallback to Administrator if role is admin instead of administrator
 */
const normalizeRole = (role: string): string => {
  const r = role.toLowerCase();
  if (r === 'admin' || r === 'administrator') return 'admin';
  if (r === 'warden') return 'warden';
  return 'student'; // Default to student
};

export const parseHostelRequest = async (userMessage: string, role: string = 'student'): Promise<ParsedRequest> => {
  const normalizedRole = normalizeRole(role);
  const intents = KNOWLEDGE_BASE[normalizedRole] || [];
  
  // Normalize punctuation and convert to lowercase for fuzzy matching
  const message = userMessage.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  const words = message.split(/\s+/);

  let bestMatch: KnowledgeIntent | null = null;
  let highestScore = 0;

  for (const intent of intents) {
    let score = 0;
    for (const keyword of intent.keywords) {
      const normalizedKeyword = keyword.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      
      // Exact full match gets highest score
      if (message === normalizedKeyword) {
        score += 100;
      } 
      // Substring match gets points proportional to its length
      else if (message.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(' ').length * 10;
      }
      // Single word matching (if the keyword is a single word and exists in the message)
      else if (!normalizedKeyword.includes(' ') && words.includes(normalizedKeyword)) {
        score += 5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = intent;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      type: bestMatch.type || 'general',
      title: bestMatch.title || 'Inquiry',
      description: userMessage,
      roomNumber: null,
      category: bestMatch.category || null,
      urgency: 'low',
      isActionable: bestMatch.isActionable || false,
      friendlyResponse: bestMatch.response
    };
  }

  // No intent matched
  return {
    ...FALLBACK_RESPONSE,
    description: userMessage
  };
};
