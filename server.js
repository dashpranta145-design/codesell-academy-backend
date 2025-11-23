import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// UPDATED CORS configuration for production
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://at-codesell-academy.com", // YOUR ACTUAL DOMAIN
        "https://www.at-codesell-academy.com", // WWW version
        "http://localhost:5173", // Dev server
        "http://localhost:3000", // Alternative dev
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-frontend-secret", "Authorization"],
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
const qaPairs = [
  // ✅ FREE/ DEMO - Very specific, should come FIRST
  {
    keywords: [
      "free class",
      "free course",
      "demo class",
      "trial class",
      "free trial",
    ],
    keywords_bn: [
      "ফ্রী ক্লাস",
      "ফ্রি ক্লাস",
      "ডেমো ক্লাস",
      "ট্রায়াল ক্লাস",
      "ফ্রী ট্রায়াল",
    ],
    answer_en:
      "Sorry! \n Currently, we don't offer any free classes. If we arrange one in the future, we will definitely notify you.",
    answer_bn:
      "দুঃখিত! বর্তমানে আমরা কোনো ফ্রি ক্লাস অফার করছি না। ভবিষ্যতে যদি কোনো ফ্রি ক্লাসের ব্যবস্থা করি, অবশ্যই আপনাকে জানানো হবে।",
  },

  // ✅ GUIDE - Specific guidance questions
  {
    keywords: [
      "which course should i take",
      "what should i learn",
      "choose course",
      "select course",
      "career guidance",
      "help me choose",
    ],
    keywords_bn: [
      "কোন কোর্সটা নিব",
      "কি শিখব",
      "কোর্স বাছাই",
      "গাইডলাইন",
      "ক্যারিয়ার গাইড",
      "কোনটা শিখব",
    ],
    answer_en:
      "To choose the right course, first identify your goal (job, skill, or project). Then check your current skill level and match it with a course that fits your experience. Finally, review the syllabus, duration, and career outcome to confirm it aligns with your objective. \n And we codesell academy here to help you to kickstart your tech journey. \n For more information, please contact with us.",
    answer_bn:
      "সঠিক কোর্স বেছে নিতে প্রথমে আপনার লক্ষ্য নির্ধারণ করুন (চাকরি, দক্ষতা, বা প্রজেক্ট)। এরপর নিজের বর্তমান দক্ষতার স্তর মূল্যায়ন করে সেই অনুযায়ী উপযুক্ত কোর্স মিলিয়ে নিন। শেষে সিলেবাস, সময়কাল এবং ক্যারিয়ার ফলাফল দেখে নিশ্চিত করুন কোর্সটি আপনার লক্ষ্য পূরণে সহায়ক হবে। \n আপনার এই পথচলায় সাথে রয়েছি কোডসেল একাডেমী । \n আরো বিস্তারিত জানতে জানতে আমাদের সাথে যোগাযোগ করুন ।",
  },

  // ✅ ONLINE CLASS - Specific service question
  {
    keywords: [
      "online class",
      "online classes",
      "virtual class",
      "take class online",
    ],
    keywords_bn: [
      "অনলাইন ক্লাস",
      "অনলাইন কোর্স",
      "অনলাইনে ক্লাস",
      "অনলাইনে পড়ানো",
    ],
    answer_en:
      "🖥️ Yes! We provide live online classes with recordings, teacher support, and assignments.",
    answer_bn:
      "🖥️ হ্যাঁ! আমরা লাইভ অনলাইন ক্লাস, রেকর্ডিং, শিক্ষক সাপোর্ট এবং অ্যাসাইনমেন্টসহ ক্লাস প্রদান করি।",
  },

  // ✅ Course Fee
  {
    keywords: [
      "course fee",
      "how much",
      "cost",
      "price",
      "tuition fee",
      "payment",
    ],
    keywords_bn: ["কোর্স ফি", "কত টাকা", "দাম", "খরচ", "ফি কত"],
    answer_en:
      "💰 Course fees vary:\n• Web Development: BDT 10,000 \n• Digital Marketing: BDT 10,000\n• Data Science: BDT 10,000 \n• Spoken English: BDT 3000 \n• Computer Fundamental: BDT 3000 \n\nInstallments available!",
    answer_bn:
      "💰 কোর্স ফি ভিন্ন হতে পারে:\n• ওয়েব ডেভেলপমেন্ট: ৳ ১০,০০০\n• ডিজিটাল মার্কেটিং: ৳ ১০,০০০\n• ডাটা সায়েন্স: ৳ ১০,০০০\n• স্পোকেন ইংলিশ: ৳ ৩০০০ \n• কম্পিউটার ফান্ডামেন্টাল: ৳ ৩০০০\n\nকিস্তিতে পরিশোধের সুবিধা আছে।",
  },

  {
    keywords: ["duration", "how long", "course duration", "months"],
    keywords_bn: ["কতদিন", "সময়", "সময়কাল", "কত মাস"],
    answer_en:
      "⏰ Typical durations: \n• Web Dev - 6 months \n• Data Science - 6 months \n• Digital Marketing - 6 months \n• Computer Fundamental - 3 months \n• Spoken - 3 months",
    answer_bn:
      "⏰ সাধারণ সময়কাল: \n• Web Dev - ৬ মাস \n• Data Science - ৬ মাস \n• Digital Marketing - ৬ মাস \n• Computer Fundamental - ৩ মাস \n• Spoken - ৩ মাস",
  },

  // ✅ Courses List
  {
    keywords: [
      "what courses",
      "course list",
      "available courses",
      "which courses",
    ],
    keywords_bn: ["কি কি কোর্স", "কোর্স লিস্ট", "কোর্স আছে", "কোন কোন কোর্স"],
    answer_en:
      "📚 Our courses:\n• Web Development\n• Digital Marketing\n• Data Science \n• Spoken English\n• Programming Basics\n\nWhich course interests you?",
    answer_bn:
      "📚 আমাদের কোর্সসমূহ:\n• ওয়েব ডেভেলপমেন্ট\n• ডিজিটাল মার্কেটিং\n• ডাটা সায়েন্স \n• স্পোকেন ইংলিশ\n• প্রোগ্রামিং ব্যাসিক \n• কম্পিউটার ফান্ডামেন্টাল \n\nআপনি কোন কোর্সে আগ্রহী?",
  },

  {
    keywords: ["contact", "phone number", "email", "reach us"],
    keywords_bn: ["যোগাযোগ", "ফোন নম্বর", "ইমেইল", "কন্টাক্ট"],
    answer_en:
      "Contact: \n +880 1876675145 \n codesellacademy@gmail.com \n — We'll respond within 24 hours.",
    answer_bn:
      "যোগাযোগ: \n +৮৮০ ১৮৭৬৬৭৫১৪৫ \n codesellacademy@gmail.com \n — আমরা ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।",
  },

  // ✅ General words (should come LAST)
  {
    keywords: [
      "Hi",
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
    // Check for frontend secret (optional security)
    const frontendSecret = req.headers["x-frontend-secret"];
    const expectedSecret = process.env.FRONTEND_SECRET || "WE_ARE_10_262025";

    if (frontendSecret && frontendSecret !== expectedSecret) {
      return res.status(401).json({ error: "Invalid secret" });
    }

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
