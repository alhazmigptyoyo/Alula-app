import { WeatherData, AlUlaItem, BookingTicket, ItineraryDay } from '../types';
import { ALULA_ITEMS } from '../data/alulaData';

const INITIAL_BOOKINGS: BookingTicket[] = [
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

const getStoredTickets = (): BookingTicket[] => {
  try {
    const data = localStorage.getItem('alula_tickets');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
  return INITIAL_BOOKINGS;
};

const saveTicketsToStorage = (tickets: BookingTicket[]) => {
  try {
    localStorage.setItem('alula_tickets', JSON.stringify(tickets));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
};

// Weather API service with Fallback
export const fetchWeather = async (): Promise<WeatherData> => {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.log('Using client-side weather fallback');
  }

  // Fallback
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 19;
  const temp = isDay ? 31 : 22;

  return {
    temp,
    condition: isDay ? 'مشمش وصافٍ' : 'سماء صافية ونجوم ساعدية',
    conditionEn: isDay ? 'Sunny & Clear' : 'Starlit Clear Sky',
    icon: isDay ? 'sun' : 'moon-stars',
    humidity: 24,
    windSpeed: 12,
    uvIndex: isDay ? 7 : 0,
    isDay,
    advisory: isDay
      ? 'الطقس دافئ ومثالي للأنشطة الصباحية في الحجر أو الجلسات الظليلة بواحة ديمومة. ينصح بارتداء نظارات شمسية واستخدام واقي الشمس.'
      : 'الأجواء المسائية في العلا ساحرة ولطيفة جداً! وقت مثالي لجلسات جبل الفيل وتأمل النجوم في الغراميل والعشاء في البلدة القديمة.',
    advisoryEn: isDay
      ? 'Warm & clear. Perfect for morning Hegra tours or shaded Oasis cafes.'
      : 'Pleasant starry evening! Great for Elephant Rock and Stargazing.',
    updatedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  };
};

// Chat API service with Client-Side Intelligent Engine Fallback
export const sendChatMessage = async (
  message: string
): Promise<{ reply: string; cards?: AlUlaItem[] }> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.log('Using client-side chat response fallback');
  }

  // Fallback intelligent response logic
  const query = message.toLowerCase();
  let matchedCards: AlUlaItem[] = [];
  let assistantReply = '';

  if (
    query.includes('مطعم') ||
    query.includes('مطاعم') ||
    query.includes('أكل') ||
    query.includes('عشاء') ||
    query.includes('غداء') ||
    query.includes('قهوة')
  ) {
    matchedCards = ALULA_ITEMS.filter(i => i.category === 'restaurant');
    assistantReply =
      'يا هلا بك! 🍽️ بناءً على أفضل التقييمات وآراء الزوار، إليك تشكيلة من أرقى مطاعم العلا (من المطبخ السعودي التراثي في **سهيل**، إلى الأجواء العالمية في **تاما هابيتاس**):';
  } else if (
    query.includes('سياحة') ||
    query.includes('أماكن') ||
    query.includes('معالم') ||
    query.includes('الحجر') ||
    query.includes('مرايا') ||
    query.includes('جبل الفيل') ||
    query.includes('البلدة')
  ) {
    matchedCards = ALULA_ITEMS.filter(i => i.category === 'place');
    assistantReply =
      'أهلاً بك في أرض التاريخ والتراث العالمي! 🏛️ العلا تزخر بمعالم أسطورية. إليك أهم المعالم التي لا تفوت زيارتها:';
  } else if (
    query.includes('فعاليات') ||
    query.includes('رحلات') ||
    query.includes('مغامرات') ||
    query.includes('نجوم') ||
    query.includes('منطاد') ||
    query.includes('سفاري')
  ) {
    matchedCards = ALULA_ITEMS.filter(i => i.category === 'event');
    assistantReply =
      'جاهز للإثارة والمغامرة؟ 🚁✨ هذه قائمة بأكثر الفعاليات والأنشطة حماساً وسحراً في العلا حالياً:';
  } else if (query.includes('طقس') || query.includes('حرارة') || query.includes('جو')) {
    assistantReply =
      'درجة الحرارة في العلا حالياً حوالي **31°م** 🌤️ الأجواء لطيفة ومناسبة للرحلات الميدانية والأنشطة الخارجية. أنصحك بزيارة الحجر صباحاً والاستمتاع ببرودة المساء في جبل الفيل والبلدة القديمة.';
  } else if (query.includes('جدول') || query.includes('تخطيط') || query.includes('يوم')) {
    matchedCards = [ALULA_ITEMS[5], ALULA_ITEMS[0], ALULA_ITEMS[9]];
    assistantReply =
      'أبشر! لتنظيم أفضل رحلة بدون إجهاد: أنصحك بزيارة **الحجر والدادان صباحاً**، وتناول الغداء في **واحة ديمومة**، ثم الاسترخاء وقت الغروب في **جبل الفيل** وتأمل النجوم ليلاً في **الغراميل**.';
  } else {
    assistantReply = `يا أهلاً بك في رفيق العلا الشامل! 🐪 

أنا مساعدك الذكي لحجز وتخطيط أجمل الأوقات في العلا. يمكنني مساعدتك في:
- 🍽️ **ترشيح أفضل المطاعم والمقاهي**
- 🏛️ **حجز جولات المعالم التاريخية (الحجر، مرايا، البلدة القديمة)**
- 🎈 **تجارب المغامرات (المنطاد، تأمل النجوم، السفاري)**
- 🌤️ **تحديثات الطقس وتوصيات الجدول**

اختر مما يعجبك أو اكتب لي ما تدور عنه!`;
  }

  return { reply: assistantReply, cards: matchedCards };
};

// Itinerary API service with Fallback
export const fetchItineraryData = async (days: number): Promise<ItineraryDay[]> => {
  try {
    const res = await fetch('/api/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.log('Using client-side itinerary fallback');
  }

  // Fallback itinerary generation
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
          tip: 'احرص على ارتداء حذاء مريح للمشي وحمل واقي الشمس.'
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
          desc: 'عبور الوديان والكثبان الرملية أو التحليق بسرعة بين القمم.',
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

  return itineraryDays;
};

// Tickets & Booking Service with LocalStorage Fallback
export const createBooking = async (
  itemId: string,
  guestName: string,
  guestsCount: number,
  bookingDate: string,
  bookingTime: string
): Promise<BookingTicket> => {
  try {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, guestName, guestsCount, bookingDate, bookingTime })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ticket) return data.ticket;
    }
  } catch (e) {
    console.log('Using client-side booking fallback');
  }

  // Fallback local booking creation
  const item = ALULA_ITEMS.find(i => i.id === itemId) || ALULA_ITEMS[0];
  const ticketRef = `ALU-${Math.floor(10000 + Math.random() * 90000)}`;

  const newTicket: BookingTicket = {
    ticketId: ticketRef,
    itemId: item.id,
    itemTitle: item.title,
    category:
      item.category === 'restaurant'
        ? 'حجز مطعم'
        : item.category === 'place'
        ? 'جولة سياحية'
        : 'فعالية ومغامرة',
    img: item.img,
    guestName: guestName || 'ضيف العلا المكرم',
    guestsCount: Number(guestsCount),
    bookingDate: bookingDate || new Date().toISOString().split('T')[0],
    bookingTime: bookingTime || '07:00 مساءً',
    totalAmountSAR: item.category === 'restaurant' ? 0 : 150 * Number(guestsCount),
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketRef}-${encodeURIComponent(
      item.title
    )}`,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const currentTickets = getStoredTickets();
  const updatedTickets = [newTicket, ...currentTickets];
  saveTicketsToStorage(updatedTickets);

  return newTicket;
};

export const fetchAllTickets = async (): Promise<BookingTicket[]> => {
  try {
    const res = await fetch('/api/tickets');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.log('Using client-side tickets fallback');
  }

  return getStoredTickets();
};
