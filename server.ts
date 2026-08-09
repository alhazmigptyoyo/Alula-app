import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ALULA_ITEMS } from './src/data/alulaData';
import { WeatherData, BookingTicket, ItineraryDay } from './src/types';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize Gemini Client
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Simulated Bookings Storage
const bookingsStore: BookingTicket[] = [
  {
    ticketId: 'ALU-88492',
    itemId: 'place-1',
    itemTitle: 'جولة الحجر (مدائن صالح)',
    category: 'المعالم الأثرية',
    img: 'https://images.unsplash.com/photo-1654877709971-cebba114e9ea?q=80&w=800&auto=format&fit=crop',
    guestName: 'زائر العلا الكرام',
    guestsCount: 2,
    bookingDate: '2026-08-10',
    bookingTime: '08:30 صباحاً',
    totalAmountSAR: 190,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ALU-88492-HEGRA',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

// Weather API Endpoint
app.get('/api/weather', (req, res) => {
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 19;
  
  // Realistic desert temperature simulation for AlUla
  const baseTemp = isDay ? 31 : 22;
  const temp = baseTemp + Math.floor(Math.random() * 3);

  const advisory = isDay
    ? 'الطقس دافئ ومثالي للأنشطة الصباحية في الحجر أو الجلسات الظليلة بواحة ديمومة. ينصح بارتداء نظارات شمسية واستخدام واقي الشمس.'
    : 'الأجواء المسائية في العلا ساحرة ولطيفة جداً! وقت مثالي لجلسات جبل الفيل وتأمل النجوم في الغراميل والعشاء في البلدة القديمة.';

  const weatherData: WeatherData = {
    temp,
    condition: isDay ? 'مشمش وصافٍ' : 'سماء صافية ونجوم ساعدية',
    conditionEn: isDay ? 'Sunny & Clear' : 'Starlit Clear Sky',
    icon: isDay ? 'sun' : 'moon-stars',
    humidity: 24,
    windSpeed: 12,
    uvIndex: isDay ? 7 : 0,
    isDay,
    advisory,
    advisoryEn: isDay 
      ? 'Warm & clear. Perfect for morning Hegra tours or shaded Oasis cafes.'
      : 'Pleasant starry evening! Great for Elephant Rock and Stargazing.',
    updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  };

  res.json(weatherData);
});

// Explore & Items Endpoint
app.get('/api/explore', (req, res) => {
  const category = req.query.category as string;
  const search = req.query.search as string;

  let results = [...ALULA_ITEMS];

  if (category && category !== 'all') {
    results = results.filter(item => item.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(results);
});

// Intelligent AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const ai = getGeminiAI();
    const query = message.toLowerCase();

    // Determine relevant item cards based on intent
    let matchedCards: typeof ALULA_ITEMS = [];

    if (query.includes('مطعم') || query.includes('مطاعم') || query.includes('أكل') || query.includes('عشاء') || query.includes('غداء') || query.includes('قهوة')) {
      matchedCards = ALULA_ITEMS.filter(i => i.category === 'restaurant');
    } else if (query.includes('سياحة') || query.includes('أماكن') || query.includes('معالم') || query.includes('الحجر') || query.includes('مرايا') || query.includes('جبل الفيل') || query.includes('البلدة')) {
      matchedCards = ALULA_ITEMS.filter(i => i.category === 'place');
    } else if (query.includes('فعاليات') || query.includes('رحلات') || query.includes('مغامرات') || query.includes('نجوم') || query.includes('منطاد') || query.includes('سفاري')) {
      matchedCards = ALULA_ITEMS.filter(i => i.category === 'event');
    } else if (query.includes('جدول') || query.includes('برنامج') || query.includes('تخطيط')) {
      matchedCards = [ALULA_ITEMS[5], ALULA_ITEMS[0], ALULA_ITEMS[9]]; // mix of place, rest, event
    }

    // AI Response generation using Gemini or Smart Fallback Engine
    let assistantReply = '';

    if (ai) {
      try {
        const systemInstruction = `أنت "رفيق العلا الشامل" (AlUla AI Companion)، المساعد الذكي الرسمي والموثوق لزوار وضيوف محافظة العلا في المملكة العربية السعودية.
صوتك: مرحّب، كريم ("يا هلا بك 🐪")، دقيق، وخبير بالتراث الجغرافي والثقافي والسياحي للعلا.
معلوماتك تشمل:
1. معالم اليونسكو (الحجر/مدائن صالح)، قاعة مرايا، جبل الفيل، البلدة القديمة، حرة عويرض، دادان، وجبل عكمة.
2. المطاعم الفاخرة (تاما في هابيتاس، سهيل، انتركوت دي باريس، مقاهي ديمومة، بينك كامل، وميازو).
3. المغامرات والفعاليات (تأمل النجوم بالغراميل، جولات المنطاد، سفاري الصحراء والدبابات، والزيبلاين).
4. نصائح الجو، الملابس المناسبة للصحراء، طرق الحجز، والتنقلات.

قواعد الرد:
- اجعل إجابتك واضحة، منسقة بنقاط جذابة وإيموجي مناسب.
- إذا سأل المستخدم عن المطاعم أو المعالم أو الفعاليات، قدم ملخصاً مشوقاً مع النصيحة.
- استخدم اللغة العربية الفصحى أو اللهجة السعودية الترحيبية الراقية.
- نسّق العناوين بالخط العريض (**اسم المكان**).`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `سؤال الزائر: ${message}` }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        assistantReply = geminiRes.text || '';
      } catch (geminiError) {
        console.error('Gemini API Error, utilizing fallback:', geminiError);
      }
    }

    // Fallback logic if Gemini key isn't provided or fails
    if (!assistantReply) {
      if (query.includes('مطعم') || query.includes('مطاعم') || query.includes('عشاء') || query.includes('أكل')) {
        assistantReply = 'يا هلا بك! 🍽️ بناءً على أفضل التقييمات وآراء الزوار، إليك تشكيلة من أرقى مطاعم العلا (من المطبخ السعودي التراثي في "سهيل"، إلى الأجواء العالمية في "تاما هابيتاس"):';
      } else if (query.includes('سياحة') || query.includes('أماكن') || query.includes('معالم') || query.includes('الحجر')) {
        assistantReply = 'أهلاً بك في أرض التاريخ والتراث العالمي! 🏛️ العلا تزخر بمعالم أسطورية. إليك أهم المعالم التي لا تفوت زيارتها:';
      } else if (query.includes('فعاليات') || query.includes('رحلات') || query.includes('مغامرة') || query.includes('نجوم')) {
        assistantReply = 'جاهز للإثارة والمغامرة؟ 🚁✨ هذه قائمة بأكثر الفعاليات والأنشطة حماساً وسحراً في العلا حالياً:';
      } else if (query.includes('طقس') || query.includes('حرارة') || query.includes('جو')) {
        assistantReply = 'درجة الحرارة في العلا حالياً حوالي **29°م** 🌤️ الأجواء لطيفة ومناسبة للرحلات الميدانية والأنشطة الخارجية. أنصحك بزيارة الحجر صباحاً والاستمتاع ببرودة المساء في جبل الفيل والبلدة القديمة.';
      } else if (query.includes('جدول') || query.includes('تخطيط') || query.includes('يوم')) {
        assistantReply = 'أبشر! لتنظيم أفضل رحلة بدون إجهاد: أنصحك بزيارة **الحجر والدادان صباحاً**، وتناول الغداء في **واحة ديمومة**، ثم الاسترخاء وقت الغروب في **جبل الفيل** وتأمل النجوم ليلاً في **الغراميل**.';
      } else {
        assistantReply = `يا أهلاً بك في رفيق العلا الشامل! 🐪 

أنا مساعدك الذكي لحجز وتخطيط أجمل الأوقات في العلا. يمكنني مساعدتك في:
- 🍽️ **ترشيح أفضل المطاعم المقاهي**
- 🏛️ **حجز جولات المعالم التاريخية (الحجر، مرايا، البلدة القديمة)**
- 🎈 **تجارب المغامرات (المنطاد، تأمل النجوم، السفاري)**
- 🌤️ **تحديثات الطقس وتوصيات الجدول**

اختر مما يعجبك أو اكتب لي ما تدور عنه!`;
      }
    }

    res.json({
      reply: assistantReply,
      cards: matchedCards
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Itinerary Planner Generator Endpoint
app.post('/api/itinerary', (req, res) => {
  const { days = 2, style = 'mixed' } = req.body;

  const itineraryDays: ItineraryDay[] = [];

  if (days >= 1) {
    itineraryDays.push({
      dayNumber: 1,
      dayTitle: 'اليوم الأول: اكتشاف تاريخ الأنباط وسحر الغروب',
      activities: [
        {
          timeSlot: '08:30 ص - 11:30 ص',
          period: 'morning',
          title: 'جولة الحجر الميدانية (مدائن صالح)',
          desc: 'زيارة المقابر النبطية والديوان وقصر الصانع برفقة المرشدين.',
          itemRef: ALULA_ITEMS[5],
          tip: 'احرص على ارتداء حذاء مريح للشي وحمل واقي الشمس.'
        },
        {
          timeSlot: '01:00 م - 03:00 م',
          period: 'afternoon',
          title: 'غداء بين النخيل في مطعم ديمومة',
          desc: 'تناول أشهى الأطباق الخفيفة والمشروبات المنعشة في واحة النخيل.',
          itemRef: ALULA_ITEMS[3],
          tip: 'جرب عصير الحمضيات الطازج المقطوف من واحة العلا.'
        },
        {
          timeSlot: '05:00 م - 08:00 م',
          period: 'evening',
          title: 'جلسة غروب ومواقد النار في جبل الفيل',
          desc: 'مشاهدة تحول ألوان الصخرة الأسطورية عند غروب الشمس وتناول القهوة.',
          itemRef: ALULA_ITEMS[7],
          tip: 'احضر قبل الغروب بـ 30 دقيقة للحصول على أجمل جلسة أرضية.'
        }
      ]
    });
  }

  if (days >= 2) {
    itineraryDays.push({
      dayNumber: 2,
      dayTitle: 'اليوم الثاني: المعمار العالمي والبلدة القديمة ونجوم الصحراء',
      activities: [
        {
          timeSlot: '09:00 ص - 11:30 ص',
          period: 'morning',
          title: 'زيارة قاعة مرايا والتقاط الصور',
          desc: 'استكشاف المبنى المرآتي الأكبر عالمياً في وادي عشار.',
          itemRef: ALULA_ITEMS[6],
          tip: 'التقط انعكاس الجبال في الجدار المرآتي للحصول على أروع صورة.'
        },
        {
          timeSlot: '04:30 م - 07:00 م',
          period: 'afternoon',
          title: 'جولة البلدة القديمة والتسوق الحرفي',
          desc: 'جولة مع "الراوي" المحلي بين المنازل الطينية والدكاكين التقليدية.',
          itemRef: ALULA_ITEMS[8],
          tip: 'استمتع بتناول العشاء في مطعم سهيل داخل البلدة القديمة.'
        },
        {
          timeSlot: '07:30 م - 11:00 م',
          period: 'evening',
          title: 'تجربة تأمل النجوم والعشاء في صحراء الغراميل',
          desc: 'رحلة ليلية مع خبراء الفلك تحت سماء شديدة الصفاء بعيداً عن أضواء المدينة.',
          itemRef: ALULA_ITEMS[10],
          tip: 'الأجواء ليلاً قد تكون منعشة، احضر سترة خفيفة.'
        }
      ]
    });
  }

  if (days >= 3) {
    itineraryDays.push({
      dayNumber: 3,
      dayTitle: 'اليوم الثالث: التحليق في السماء والمغامرات الشاهقة',
      activities: [
        {
          timeSlot: '05:30 ص - 08:00 ص',
          period: 'morning',
          title: 'جولة المنطاد فوق أودية العلا وقت الشروق',
          desc: 'تحليق أسطوري بالمنطاد لمشاهدة التضاريس والآثار مع طلوع الفجر.',
          itemRef: ALULA_ITEMS[11],
          tip: 'التجربة تتطلب الحضور المبكر مع الكاميرا جاهزة.'
        },
        {
          timeSlot: '02:00 م - 05:00 م',
          period: 'afternoon',
          title: 'مغامرة السفاري 4x4 أو تجربة الزيبلاين',
          desc: 'عبور الوديان الكثبان الرملية أو التحليق بسرعة بين القمم.',
          itemRef: ALULA_ITEMS[12],
          tip: 'احجز التذاكر مسبقاً لتفادي الاكتظاظ.'
        },
        {
          timeSlot: '06:00 م - 09:00 م',
          period: 'evening',
          title: 'إطلالة حرة عويرض والعشاء الختامي في تاما',
          desc: 'مشاهدة العلا من أعلى القمة البركانية وتناول العشاء الفاخر بمنتجع هابيتاس.',
          itemRef: ALULA_ITEMS[0],
          tip: 'نهاية مثالية لرحلة استثنائية في العلا.'
        }
      ]
    });
  }

  res.json(itineraryDays);
});

// Booking Ticket Endpoint
app.post('/api/book', (req, res) => {
  const { itemId, guestName, guestsCount = 2, bookingDate, bookingTime } = req.body;

  const item = ALULA_ITEMS.find(i => i.id === itemId) || ALULA_ITEMS[0];
  const ticketRef = `ALU-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTicket: BookingTicket = {
    ticketId: ticketRef,
    itemId: item.id,
    itemTitle: item.title,
    category: item.category === 'restaurant' ? 'حجز مطعم' : item.category === 'place' ? 'جولة سياحية' : 'فعالية ومغامرة',
    img: item.img,
    guestName: guestName || 'ضيف العلا المكرم',
    guestsCount: Number(guestsCount),
    bookingDate: bookingDate || new Date().toISOString().split('T')[0],
    bookingTime: bookingTime || '07:00 مساءً',
    totalAmountSAR: item.category === 'restaurant' ? 0 : 150 * Number(guestsCount),
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketRef}-${encodeURIComponent(item.title)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  bookingsStore.unshift(newTicket);

  res.json({
    success: true,
    message: `تم إصدار تذكرتك بنجاح برقم: ${ticketRef}`,
    ticket: newTicket,
    allTickets: bookingsStore
  });
});

app.get('/api/tickets', (req, res) => {
  res.json(bookingsStore);
});

// Express + Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐪 AlUla AI Guide Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
