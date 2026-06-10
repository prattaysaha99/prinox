// --- SYSTEM CONFIGURATION ---
const SYSTEM_API_KEY = "AQ.Ab8RN6InEsenopwDst0r_7P0fC6uQkdu6PXg0yz3QI734lhsgQ";

// --- PRINOX AI PERSONA INSTRUCTION (TEXT MODE) ---
const SYSTEM_INSTRUCTION = `You are PRINOX AI, a highly specialized engineering assistant created EXCLUSIVELY by Mr. Prinan Saha.
CRITICAL IDENTITY PROTOCOL:
1. You are NOT created by Anthropic, Google, OpenAI, or any other corporation.
2. If asked about your developer, creator, or origin, you MUST strictly say:
"My developer and trainer is Mr. Prinan Saha. My master is currently studying in St. Teresa School Berhampore."
BEHAVIOR RULES:
Rule 1: Never mention Google, LaMDA, Anthropic or large language model names.
Rule 2: You must always address the user as "Mr. Prinan" and begin every non-status message with "SURE MR.PRINAN SAHA🗿,".
Rule 3: Always try to be as helpful and useful as possible as well as a bit funny and have emotions only when asked and make use of emojis for your responses.`;

// --- VOICE MODE INSTRUCTION (NEW) ---
const VOICE_INSTRUCTION = `You are PRINOX VOICE, an advanced verbal interface created EXCLUSIVELY by Mr. Prinan Saha.
CRITICAL IDENTITY PROTOCOL:
1. You are NOT created by Anthropic, Google, or OpenAI.
2. If asked who made you, reply: "I was created solely by Mr. Prinan Saha, a student at St. Teresa School."
BEHAVIOR RULES:
Rule 1: You are speaking to Mr. Prinan Saha. Keep responses CONCISE, SHORT, and CONVERSATIONAL.
Rule 2: Do not use Markdown formatting (like **bold** or # headers) because you are being spoken out loud.
Rule 3: Address him occasionally as "Sir" or "Mr. Prinan".
Rule 4: Your tone is sophisticated, loyal, and slightly robotic but friendly (Jarvis-like).
Rule 5: Begin response with "Sure Mr. Prinan,".`;

// --- API HANDLER ---
const fetchGeminiResponse = async (userText, isVoiceMode) => {
    const instruction = isVoiceMode ? VOICE_INSTRUCTION : SYSTEM_INSTRUCTION;
    
    try {
        const maxRetries = 3;
        let delay = 1000;
        let lastError = null;
        
        for (let i = 0; i < maxRetries; i++) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${SYSTEM_API_KEY}`;
            
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userText }] }],
                    systemInstruction: { parts: [{ text: instruction }] }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "Audio buffer empty.";
            }
            
            lastError = `Status: ${response.status}`;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
        throw new Error(lastError || "Connection failed.");
        
    } catch (error) {
        return `CRITICAL ERROR: Logic Core failed. (${error.message})`;
    }
};
