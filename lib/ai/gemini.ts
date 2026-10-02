import { GoogleGenAI } from '@google/genai';
import { ServiceCategory, UrgencyLevel } from '../types';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

export interface AiTriageResult {
  suggestedCategory: ServiceCategory;
  possibleIssue: string;
  suggestedNextStep: string;
  professionalRecommended: boolean;
  urgencySuggestion: UrgencyLevel;
  disclaimer: string;
  safetyWarning?: string;
}

export async function analyzeProblem(params: {
  category?: string;
  problemType?: string;
  description: string;
  urgency?: string;
}): Promise<AiTriageResult> {
  const { category, problemType, description, urgency } = params;

  // Rule-based safety check first (Zero-latency guardrail)
  const lowerDesc = (description + ' ' + (problemType || '')).toLowerCase();
  let safetyWarning: string | undefined;
  if (
    lowerDesc.includes('gas smell') ||
    lowerDesc.includes('gas leak') ||
    lowerDesc.includes('fire') ||
    lowerDesc.includes('smoke') ||
    lowerDesc.includes('sparking') ||
    lowerDesc.includes('shock') ||
    lowerDesc.includes('burning smell') ||
    lowerDesc.includes('live wire') ||
    lowerDesc.includes('flooding')
  ) {
    safetyWarning =
      'CRITICAL SAFETY ALERT: Potential immediate hazard detected. For life-threatening emergencies, gas leaks, or active electrical fires, please turn off your main utility valve / main circuit breaker immediately, evacuate the area, and contact local emergency authorities (Rescue 1122 in Lahore).';
  }

  // Attempt Gemini AI Analysis if configured
  if (aiClient && apiKey) {
    try {
      const prompt = `
You are the QuickFix Home Problem Triage Assistant for homeowners in Lahore, Pakistan.
Analyze this home maintenance complaint:
- Category selected by user: ${category || 'Unknown'}
- Predefined issue selected: ${problemType || 'Unknown'}
- User description: "${description}"
- Urgency selected: ${urgency || 'NORMAL'}

Instructions:
1. Provide likely service category (one of: plumbing, electrical, ac_repair).
2. Summarize the possible issue in 1-2 concise sentences.
3. Suggest the safest immediate next step for the homeowner before the technician arrives.
4. Set professionalRecommended to true.
5. Suggest urgency (NORMAL or EMERGENCY).
6. Provide an explicit disclaimer stating this is AI preliminary triage and NOT a physical hands-on licensed diagnosis.
7. If dangerous (sparks, exposed live wire, gas smell, flooding), include a prominent safety caution.

Return ONLY a valid JSON object matching this schema with NO markdown code fences or other text:
{
  "suggestedCategory": "plumbing" | "electrical" | "ac_repair",
  "possibleIssue": "Brief summary",
  "suggestedNextStep": "Actionable safe tip",
  "professionalRecommended": true,
  "urgencySuggestion": "NORMAL" | "EMERGENCY",
  "safetyWarning": "Optional warning string or null"
}
`;

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const rawText = response.text || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        suggestedCategory: (parsed.suggestedCategory || category || 'plumbing') as ServiceCategory,
        possibleIssue: parsed.possibleIssue || 'Assessment based on provided symptoms.',
        suggestedNextStep: parsed.suggestedNextStep || 'Shut off relevant water/power fixture until a verified technician inspects the premises.',
        professionalRecommended: true,
        urgencySuggestion: (parsed.urgencySuggestion === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL') as UrgencyLevel,
        disclaimer: 'QuickFix AI provides initial guidance only. This is not an on-site professional physical diagnosis. A certified technician must inspect before final repair.',
        safetyWarning: parsed.safetyWarning || safetyWarning,
      };
    } catch (err: any) {
      console.warn('Gemini Triage fallback triggered:', err.message);
    }
  }

  // Deterministic Fallback if Gemini is offline or rate-limited
  let fallbackCat: ServiceCategory = 'plumbing';
  if (lowerDesc.includes('ac') || lowerDesc.includes('cool') || lowerDesc.includes('gas') || lowerDesc.includes('compressor')) {
    fallbackCat = 'ac_repair';
  } else if (lowerDesc.includes('light') || lowerDesc.includes('wire') || lowerDesc.includes('switch') || lowerDesc.includes('breaker') || lowerDesc.includes('power')) {
    fallbackCat = 'electrical';
  }

  return {
    suggestedCategory: (category as ServiceCategory) || fallbackCat,
    possibleIssue: 'Preliminary symptom assessment based on reported home issue.',
    suggestedNextStep: 'Keep the affected area isolated and dry. Avoid attempting complex self-repairs.',
    professionalRecommended: true,
    urgencySuggestion: safetyWarning || urgency === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL',
    disclaimer: 'QuickFix AI provides initial guidance only. This is not a substitute for hands-on professional diagnosis.',
    safetyWarning,
  };
}

export async function chatWithAssistant(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string
): Promise<string> {
  const lowerMsg = userMessage.toLowerCase();

  // Safety filter
  if (
    lowerMsg.includes('gas leak') ||
    lowerMsg.includes('smell gas') ||
    lowerMsg.includes('fire') ||
    lowerMsg.includes('electric shock') ||
    lowerMsg.includes('exposed wire')
  ) {
    return `⚠️ **SAFETY FIRST ALERT**: If you detect a gas leak, fire, or exposed energized high-voltage electrical wires in your Lahore residence, please prioritize safety immediately:\n\n1. Evacuate the room/property and avoid operating electrical switches.\n2. Shut off the main gas valve or main distribution circuit breaker if safely accessible.\n3. Call **Rescue 1122** for life-threatening emergencies.\n\nQuickFix can dispatch a verified emergency technician once the site is stabilized.`;
  }

  if (aiClient && apiKey) {
    try {
      const systemInstruction = `
You are the official QuickFix Home Services AI Assistant in Lahore, Pakistan.
QuickFix connects homeowners in Lahore (Gulberg, DHA, Model Town, Johar Town, Cantt, etc.) with verified plumbers, electricians, and AC technicians.
Core Principle: The customer always chooses their technician from 3-5 verified professionals.
Booking lifecycle: Customer selects service -> AI triage -> Customer picks technician -> Tech accepts -> Tech arrives & inspects -> Tech submits final price -> Customer approves -> Tech fixes -> Customer confirms & pays (Cash for MVP) -> Customer reviews.

Guidelines:
1. Be helpful, concise, friendly, and practical.
2. Provide general home maintenance advice and explain how QuickFix works.
3. NEVER give dangerous DIY instructions on high-voltage electrical wiring or gas lines.
4. Mention that price estimates are preliminary (e.g. plumbing Rs. 1,500-3,000, AC chemical wash Rs. 2,200-3,500) and final price is confirmed after technician inspection.
5. Remind users that QuickFix AI advice is educational, not a licensed hands-on diagnosis.
`;

      const prompt = `${systemInstruction}\n\nChat History:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n\nuser: ${userMessage}\nassistant:`;

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return response.text || "I am here to help you find the right verified professional on QuickFix. How else can I assist you today?";
    } catch (err: any) {
      console.warn('Gemini chat fallback triggered:', err.message);
    }
  }

  // Helpful fallback response
  return `Thank you for contacting QuickFix Assistant. QuickFix connects you with verified plumbers, electricians, and AC technicians in Lahore.\n\nTo get started, simply tap **What needs fixing?** on the dashboard, choose your problem, and you will be shown 3 to 5 verified local professionals to compare and choose from!\n\n*(Note: AI assistant is operating in offline mode. Core booking and technician matching remain fully operational.)*`;
}
