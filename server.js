import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --------------------
// Q/A Pairs
// --------------------
const qaPairs = [
  {
    keywords: [
      "how are you",
      "how r you",
      "how r u",
      "how are u",
      "how r u?",
      "how r u",
    ],
    keywords_bn: ["কেমন আছ", "কেমন আছেন", "কেমন আছো", "তুমি কেমন", "আপনি কেমন"],
    answer_en: "😊 I'm doing great! How can I help you today?",
    answer_bn: "😊 আমি ভালো আছি! কিভাবে আপনাকে সাহায্য করতে পারি?",
  },

  // ✅ ONLINE CLASS
  {
    keywords: ["online", "online class", "online classes", "virtual"],
    keywords_bn: [
      "অনলাইন",
      "অনলাইন ক্লাস",
      "অনলাইন কোর্স",
      "অনলাইনে হয়",
      "অনলাইনে করেন",
      "আপনারা কি অনলাইন ক্লাস করান",
      "অনলাইন কি আছে",
      "অনলাইন সাপোর্ট",
    ],
    answer_en:
      "🖥️ Yes! We provide live online classes with recordings, teacher support, and assignments.",
    answer_bn:
      "🖥️ হ্যাঁ! আমরা লাইভ অনলাইন ক্লাস, রেকর্ডিং, শিক্ষক সাপোর্ট এবং অ্যাসাইনমেন্টসহ ক্লাস প্রদান করি।",
  },

  // ✅ Course Fee
  {
    keywords: [
      "fee",
      "cost",
      "price",
      "tuition",
      "payment",
      "how much",
      "course fee",
    ],
    keywords_bn: ["ফি", "টাকা", "দাম", "খরচ", "কত টাকা", "ফি কত", "কোর্স ফি"],
    answer_en:
      "💰 Course fees vary:\n• Web Development: BDT 10,000 \n• Digital Marketing: BDT 10,000\n• Data Science: BDT 10,000 \n• Spoken English: BDT 3000 \n• Computer Fundamental: BDT 3000 \n\nInstallments available!",
    answer_bn:
      "💰 কোর্স ফি ভিন্ন হতে পারে:\n• ওয়েব ডেভেলপমেন্ট: ৳ ১০,০০০\n• ডিজিটাল মার্কেটিং: ৳ ১০,০০০\n• ডাটা সায়েন্স: ৳ ১০,০০০\n• স্পোকেন ইংলিশ: ৳ ৩০০০ \n• কম্পিউটার ফান্ডামেন্টাল: ৳ ৩০০০\n\nকিস্তিতে পরিশোধের সুবিধা আছে।",
  },

  {
    keywords: ["duration", "how long", "months", "course length"],
    keywords_bn: ["মাস", "সময়", "সময়কাল", "কতদিন", "কত মাস"],
    answer_en:
      "⏰ Typical durations: \n• Web Dev - 6 months \n• Data Science - 6 months \n• Digital Marketing - 6 months \n• Computer Fundamental - 3 months \n• Spoken - 3 months",
    answer_bn:
      "⏰ সাধারণ সময়কাল: \n• Web Dev - ৬ মাস \n• Data Science - ৬ মাস \n• Digital Marketing - ৬ মাস \n• Computer Fundamental - ৩ মাস \n• Spoken - ৩ মাস",
  },

  // ✅ Courses List
  {
    keywords: [
      "course",
      "courses",
      "class",
      "training",
      "program",
      "what courses",
      "course list",
    ],
    keywords_bn: [
      "কোর্স",
      "কোর্সসমূহ",
      "ক্লাস",
      "প্রশিক্ষণ",
      "কি কি কোর্স",
      "কোর্স আছে",
    ],
    answer_en:
      "📚 Our courses:\n• Web Development\n• Digital Marketing\n• Data Science \n• Spoken English\n• Programming Basics\n\nWhich course interests you?",
    answer_bn:
      "📚 আমাদের কোর্সসমূহ:\n• ওয়েব ডেভেলপমেন্ট\n• ডিজিটাল মার্কেটিং\n• ডাটা সায়েন্স \n• স্পোকেন ইংলিশ\n• প্রোগ্রামিং ব্যাসিক \n• কম্পিউটার ফান্ডামেন্টাল \n\nআপনি কোন কোর্সে আগ্রহী?",
  },

  {
    keywords: ["contact", "phone", "email", "reach"],
    keywords_bn: ["যোগাযোগ", "ফোন", "ইমেইল", "নম্বর"],
    answer_en:
      "Contact: \n +880 1876675145 \n codesellacademy@gmail.com \n — We'll respond within 24 hours.",
    answer_bn:
      "যোগাযোগ: \n +৮৮০ ১৮৭৬৬৭৫১৪৫ \n codesellacademy@gmail.com \n — আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।",
  },
];

// --------------------
// Helpers
// --------------------
function containsBengali(text = "") {
  return /[\u0980-\u09FF]/.test(text);
}

function normalize(text = "") {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findAnswer(message) {
  const bengali = containsBengali(message);
  const cleaned = normalize(message);

  for (const qa of qaPairs) {
    const keys = bengali ? qa.keywords_bn || [] : qa.keywords || [];
    for (const k of keys) {
      if (!k) continue;
      const nn = normalize(k);
      if (nn && cleaned.includes(nn)) return qa;
    }
  }

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const qa of qaPairs) {
    const allKeywords = [
      ...(qa.keywords || []).map((x) => normalize(x)),
      ...(qa.keywords_bn || []).map((x) => normalize(x)),
    ];

    let score = 0;
    for (const kw of allKeywords) {
      if (!kw) continue;
      for (const w of words) {
        if (w.length < 2) continue;
        if (kw.includes(w)) score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = qa;
    }
  }

  return bestScore > 0 ? best : null;
}

// --------------------
// Routes
// --------------------
app.post("/chat", (req, res) => {
  try {
    const userMessage = (req.body?.message || "").toString();
    if (!userMessage.trim()) {
      return res.status(400).json({ error: "Message required" });
    }

    const bengali = containsBengali(userMessage);
    const qa = findAnswer(userMessage);

    if (!qa) {
      const fallback = bengali
        ? "🙂 দুঃখিত, আমি সেটা বুঝতে পারিনি। একটু ভিন্নভাবে বলবেন?"
        : "🙂 Sorry, I didn't understand. Could you rephrase?";
      return res.json({ reply: fallback });
    }

    const reply = bengali
      ? qa.answer_bn || qa.answer_en
      : qa.answer_en || qa.answer_bn;

    return res.json({ reply });
  } catch (err) {
    console.error("Server error /chat:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CodeSell Academy Chatbot API",
    time: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "CodeSell Academy Chatbot API is running!",
    endpoints: {
      health: "/health",
      chat: "/chat (POST)",
    },
    version: "1.0.0",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CodeSell Academy Chatbot server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
