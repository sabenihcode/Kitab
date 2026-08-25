/**
 * Greeting dinamis berdasarkan jam
 * 05:00 - 10:59 → Pagi
 * 11:00 - 14:59 → Siang
 * 15:00 - 17:59 → Sore
 * 18:00 - 04:59 → Malam
 */

export interface Greeting {
  text: string;
}

export const getGreetingByTime = (date: Date = new Date()): Greeting => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return { text: 'Selamat pagi' };
  if (hour >= 11 && hour < 15) return { text: 'Selamat siang' };
  if (hour >= 15 && hour < 18) return { text: 'Selamat sore' };
  return { text: 'Selamat malam' };
};