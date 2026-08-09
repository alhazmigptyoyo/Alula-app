export interface AlUlaItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'restaurant' | 'place' | 'event';
  desc: string;
  descEn: string;
  longDesc?: string;
  location: string;
  rating: number;
  price: string;
  img: string;
  btnText: string;
  btnTextEn: string;
  tags: string[];
  recommendedTime?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  cards?: AlUlaItem[];
  itinerary?: ItineraryDay[];
  ticket?: BookingTicket;
}

export interface WeatherData {
  temp: number;
  condition: string;
  conditionEn: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
  advisory: string;
  advisoryEn: string;
  updatedAt: string;
}

export interface ItineraryActivity {
  timeSlot: string; // e.g. "08:00 AM - 11:00 AM"
  period: 'morning' | 'afternoon' | 'evening';
  title: string;
  desc: string;
  itemRef?: AlUlaItem;
  tip: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dayTitle: string;
  activities: ItineraryActivity[];
}

export interface BookingTicket {
  ticketId: string; // e.g. ALU-88492
  itemId: string;
  itemTitle: string;
  category: string;
  img: string;
  guestName: string;
  guestsCount: number;
  bookingDate: string;
  bookingTime: string;
  totalAmountSAR: number;
  qrCodeUrl: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}
