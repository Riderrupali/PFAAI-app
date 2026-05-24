import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "mr" | "hi";

export interface AIContext {
  userName: string;
  aiName: string;
  language: Language;
}

const MEMORIES_KEY = "pfaai_memories";
const TAUGHT_KEY = "pfaai_taught";

export async function getMemories(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(MEMORIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getTaughtResponses(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(TAUGHT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveMemory(fact: string): Promise<void> {
  const memories = await getMemories();
  const key = Date.now().toString();
  memories[key] = fact;
  await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
}

async function saveTeachResponse(
  trigger: string,
  response: string
): Promise<void> {
  const taught = await getTaughtResponses();
  taught[trigger.toLowerCase().trim()] = response.trim();
  await AsyncStorage.setItem(TAUGHT_KEY, JSON.stringify(taught));
}

function isGreeting(input: string): boolean {
  const greetings = [
    "hello",
    "hi",
    "hey",
    "helo",
    "hallo",
    "sup",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "namaste",
    "namaskar",
    "नमस्ते",
    "नमस्कार",
    "हाय",
    "हॅलो",
    "हैलो",
    "सुप्रभात",
    "शुभ रात्री",
    "शुभ रात",
    "hy",
    "hii",
  ];
  const lower = input.toLowerCase().trim();
  return greetings.some(
    (g) => lower === g || lower.startsWith(g + " ") || lower.startsWith(g + "!")
  );
}

function isHowAreYou(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    lower.includes("how are you") ||
    lower.includes("how r u") ||
    lower.includes("how are u") ||
    lower.includes("kaasa aahe") ||
    lower.includes("kasa aahe") ||
    lower.includes("kasy aahe") ||
    lower.includes("kaisa hai") ||
    lower.includes("kaise ho") ||
    lower.includes("कसे आहात") ||
    lower.includes("कसा आहे") ||
    lower.includes("कैसे हो") ||
    lower.includes("कैसे हैं")
  );
}

function isNameQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    lower.includes("your name") ||
    lower.includes("who are you") ||
    lower.includes("who r u") ||
    lower.includes("tuze nav") ||
    lower.includes("tera naam") ||
    lower.includes("तुझे नाव") ||
    lower.includes("तेरा नाम") ||
    lower.includes("apna naam") ||
    lower.includes("तुमचं नाव")
  );
}

function isTimeQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    lower.includes("time") ||
    lower.includes("वेळ") ||
    lower.includes("वक्त") ||
    lower.includes("date") ||
    lower.includes("today") ||
    lower.includes("aaj") ||
    lower.includes("आज") ||
    lower.includes("tarikh") ||
    lower.includes("तारीख")
  );
}

function parseMath(input: string): number | null {
  try {
    const match = input.match(/(\d+(\.\d+)?)\s*([\+\-\*\/x×÷])\s*(\d+(\.\d+)?)/);
    if (!match) return null;
    const a = parseFloat(match[1]);
    const op = match[3];
    const b = parseFloat(match[4]);
    if (op === "+" ) return a + b;
    if (op === "-") return a - b;
    if (op === "*" || op === "x" || op === "×") return a * b;
    if (op === "/" || op === "÷") return b !== 0 ? a / b : null;
    return null;
  } catch {
    return null;
  }
}

function parseRememberCommand(input: string): string | null {
  const patterns = [
    /^remember (?:that )?(.+)$/i,
    /^lakshat thev (?:ki )?(.+)$/i,
    /^laksha thev (?:ki )?(.+)$/i,
    /^yaad rakh (?:ki |ke )?(.+)$/i,
    /^save (?:that )?(.+)$/i,
  ];
  for (const pat of patterns) {
    const m = input.trim().match(pat);
    if (m) return m[1].trim();
  }
  return null;
}

function parseTeachCommand(
  input: string
): { trigger: string; response: string } | null {
  const patterns = [
    /when i say[:\s]+["']?(.+?)["']?,?\s+(?:say|reply|tell me)[:\s]+["']?(.+?)["']?$/i,
    /jar mi[:\s]*["']?(.+?)["']?\s+(?:sangitla|sangtlo|boltlo)[,\s]+(?:tar\s+)?["']?(.+?)["']?\s+sang$/i,
    /jab main[:\s]*["']?(.+?)["']?\s+bolun[,\s]+(?:to\s+)?["']?(.+?)["']?\s+bol$/i,
    /["'](.+?)["']\s+(?:sangitlavar|bolaavar)\s+["']?(.+?)["']?\s+sang$/i,
  ];
  for (const pat of patterns) {
    const m = input.trim().match(pat);
    if (m) return { trigger: m[1].trim(), response: m[2].trim() };
  }
  return null;
}

function getGreetingResponse(ctx: AIContext): string {
  const name = ctx.userName || "";
  const nameStr = name ? ` ${name}` : "";
  switch (ctx.language) {
    case "mr":
      return `नमस्ते${nameStr}! 😊 मी ${ctx.aiName} — तुमचा खास मित्र! आज कसे आहात? मी कशात मदत करू?`;
    case "hi":
      return `नमस्ते${nameStr}! 😊 मैं ${ctx.aiName} — आपका खास दोस्त! आज कैसे हैं? मैं क्या मदद करूं?`;
    default:
      return `Hey${nameStr}! 😊 I'm ${ctx.aiName} — your personal best friend! How are you today? What can I help with?`;
  }
}

function getHowAreYouResponse(ctx: AIContext): string {
  switch (ctx.language) {
    case "mr":
      return `मी खूप मस्त आहे! 😄 ${ctx.userName ? ctx.userName + ", " : ""}तुमच्यासाठी नेहमी इथे असतो. तुम्ही कसे आहात?`;
    case "hi":
      return `मैं बहुत अच्छा हूँ! 😄 ${ctx.userName ? ctx.userName + ", " : ""}आपके लिए हमेशा यहाँ हूँ। आप कैसे हैं?`;
    default:
      return `I'm doing great! 😄 ${ctx.userName ? ctx.userName + ", " : ""}I'm always here for you. How about you?`;
  }
}

function getNameResponse(ctx: AIContext): string {
  switch (ctx.language) {
    case "mr":
      return `माझे नाव ${ctx.aiName} आहे! 🤖 मी तुमचा Personal Friend Assistant AI आहे — offline काम करतो आणि नेहमी सोबत असतो!`;
    case "hi":
      return `मेरा नाम ${ctx.aiName} है! 🤖 मैं आपका Personal Friend Assistant AI हूँ — offline काम करता हूँ और हमेशा साथ हूँ!`;
    default:
      return `My name is ${ctx.aiName}! 🤖 I'm your Personal Friend Assistant AI — I work offline and I'm always by your side!`;
  }
}

function getTimeResponse(ctx: AIContext): string {
  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  switch (ctx.language) {
    case "mr":
      return `🕐 आत्ताची वेळ: **${time}**\n📅 आजची तारीख: ${date}`;
    case "hi":
      return `🕐 अभी का समय: **${time}**\n📅 आज की तारीख: ${date}`;
    default:
      return `🕐 Current time: **${time}**\n📅 Today's date: ${date}`;
  }
}

function getRememberConfirmation(fact: string, ctx: AIContext): string {
  switch (ctx.language) {
    case "mr":
      return `✅ लक्षात ठेवलं! "${fact}" — हे माझ्याकडे save झालं आहे. तुम्ही कधीही विचारू शकता!`;
    case "hi":
      return `✅ याद कर लिया! "${fact}" — यह मेरे पास save हो गया है। कभी भी पूछ सकते हैं!`;
    default:
      return `✅ Got it! Remembered: "${fact}" — saved with me. You can ask me anytime!`;
  }
}

function getTeachConfirmation(
  trigger: string,
  response: string,
  ctx: AIContext
): string {
  switch (ctx.language) {
    case "mr":
      return `😊 शिकलो! आता जेव्हा तुम्ही "${trigger}" म्हणाल, तेव्हा मी "${response}" असं उत्तर देईन!`;
    case "hi":
      return `😊 सीख लिया! अब जब आप "${trigger}" बोलेंगे, मैं "${response}" कहूँगा!`;
    default:
      return `😊 Learned! Now when you say "${trigger}", I'll reply "${response}"!`;
  }
}

function getMathResponse(result: number, ctx: AIContext): string {
  switch (ctx.language) {
    case "mr":
      return `🔢 उत्तर आहे: **${result}**`;
    case "hi":
      return `🔢 उत्तर है: **${result}**`;
    default:
      return `🔢 The answer is: **${result}**`;
  }
}

function getMemoryResponse(fact: string, ctx: AIContext): string {
  switch (ctx.language) {
    case "mr":
      return `😊 हो! मला आठवतं — "${fact}"`;
    case "hi":
      return `😊 हाँ! मुझे याद है — "${fact}"`;
    default:
      return `😊 Yes! I remember — "${fact}"`;
  }
}

const generalResponses = {
  en: [
    "Hmm, I didn't quite get that. Could you say it differently? 😊",
    "That's interesting! Tell me more.",
    "I'm offline, so I don't know everything — but whatever you teach me, I'll remember! 📚",
    "I'm always here to listen. Keep talking to me! 😊",
    "Try asking me something — math, time, or teach me new things!",
  ],
  mr: [
    "हम्म, नक्की समजलं नाही. जरा वेगळ्या प्रकारे सांगाल का? 😊",
    "मजेशीर आहे! आणखी सांगा.",
    "मी offline आहे, त्यामुळे सगळं माहित नाही — पण तुम्ही जे शिकवाल ते नक्की लक्षात ठेवेन! 📚",
    "मी नेहमी ऐकायला तयार आहे. बोलत राहा! 😊",
    "मला काहीतरी विचारा — गणित, वेळ, किंवा नवीन गोष्टी शिकवा!",
  ],
  hi: [
    "हम्म, ठीक से समझ नहीं आया। दूसरे तरीके से बताएंगे? 😊",
    "दिलचस्प है! और बताइए।",
    "मैं offline हूँ, इसलिए सब कुछ नहीं जानता — पर आप जो सिखाएंगे वो याद रखूंगा! 📚",
    "मैं हमेशा सुनने के लिए तैयार हूँ। बात करते रहिए! 😊",
    "मुझसे कुछ पूछिए — गणित, समय, या नई बातें सिखाइए!",
  ],
};

export async function processMessage(
  input: string,
  ctx: AIContext
): Promise<string> {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) return "";

  // 1. Check user-taught responses
  const taught = await getTaughtResponses();
  for (const [trigger, resp] of Object.entries(taught)) {
    if (lower.includes(trigger)) return resp;
  }

  // 2. Parse teach command
  const teach = parseTeachCommand(trimmed);
  if (teach) {
    await saveTeachResponse(teach.trigger, teach.response);
    return getTeachConfirmation(teach.trigger, teach.response, ctx);
  }

  // 3. Parse remember command
  const rememberFact = parseRememberCommand(trimmed);
  if (rememberFact) {
    await saveMemory(rememberFact);
    return getRememberConfirmation(rememberFact, ctx);
  }

  // 4. Math
  const mathResult = parseMath(trimmed);
  if (mathResult !== null) {
    return getMathResponse(mathResult, ctx);
  }

  // 5. Greeting
  if (isGreeting(trimmed)) {
    return getGreetingResponse(ctx);
  }

  // 6. How are you
  if (isHowAreYou(trimmed)) {
    return getHowAreYouResponse(ctx);
  }

  // 7. Name
  if (isNameQuery(trimmed)) {
    return getNameResponse(ctx);
  }

  // 8. Time/date
  if (isTimeQuery(trimmed)) {
    return getTimeResponse(ctx);
  }

  // 9. Memory recall — check if query matches any saved memory
  const memories = await getMemories();
  const memValues = Object.values(memories);
  const words = lower.split(/\s+/).filter((w) => w.length > 3);
  for (const mem of memValues) {
    const memLower = mem.toLowerCase();
    if (words.some((w) => memLower.includes(w))) {
      return getMemoryResponse(mem, ctx);
    }
  }

  // 10. General fallback
  const pool = generalResponses[ctx.language] ?? generalResponses["en"];
  return pool[Math.floor(Math.random() * pool.length)];
}
