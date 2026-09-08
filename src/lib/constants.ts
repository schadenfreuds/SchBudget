import { Person, Category, AppSettings } from '@/types/budget';

export const DEFAULT_PERSONS: Person[] = [
  { id: 'anne', name: 'Anne', role: 'Anne', color: 'bg-rose-100 text-rose-700 border-rose-200', avatar: '👩' },
  { id: 'baba', name: 'Baba', role: 'Baba', color: 'bg-blue-100 text-blue-700 border-blue-200', avatar: '👨' },
  { id: 'cocuk', name: 'Çocuk', role: 'Çocuk', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', avatar: '🧒' },
  { id: 'ortak', name: 'Ev / Ortak', role: 'Genel Ev', color: 'bg-amber-100 text-amber-700 border-amber-200', avatar: '🏠' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'market', name: 'Süpermarket', icon: '🛒', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'pazar_manav', name: 'Pazar & Manav', icon: '🍎', color: 'bg-lime-50 text-lime-700' },
  { id: 'kasap', name: 'Kasap', icon: '🥩', color: 'bg-red-50 text-red-700' },
  { id: 'fatura', name: 'Faturalar', icon: '⚡', color: 'bg-amber-50 text-amber-700' },
  { id: 'kira_aidat', name: 'Kira & Aidat', icon: '🏢', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'saglik', name: 'Eczane & Sağlık', icon: '💊', color: 'bg-teal-50 text-teal-700' },
  { id: 'ulasim', name: 'Ulaşım & Akaryakıt', icon: '🚗', color: 'bg-blue-50 text-blue-700' },
  { id: 'yemek', name: 'Dışarıda Yemek', icon: '☕', color: 'bg-orange-50 text-orange-700' },
  { id: 'giyim', name: 'Giyim & Ayakkabı', icon: '👗', color: 'bg-purple-50 text-purple-700' },
  { id: 'ev_esya', name: 'Ev & Yaşam', icon: '🛋️', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'egitim', name: 'Eğitim & Kitap', icon: '📚', color: 'bg-sky-50 text-sky-700' },
  { id: 'diger', name: 'Diğer Harcama', icon: '📦', color: 'bg-zinc-100 text-zinc-700' },
];

export const DEFAULT_FIXED_TEMPLATES = [
  { title: 'Ev Kirası', expectedAmount: 0, categoryId: 'kira_aidat', personId: 'ortak', dueDate: 1 },
  { title: 'Bina / Site Aidatı', expectedAmount: 0, categoryId: 'kira_aidat', personId: 'ortak', dueDate: 10 },
  { title: 'Elektrik Faturası', expectedAmount: 0, categoryId: 'fatura', personId: 'ortak', dueDate: 15 },
  { title: 'Doğalgaz Faturası', expectedAmount: 0, categoryId: 'fatura', personId: 'ortak', dueDate: 18 },
  { title: 'Su Faturası', expectedAmount: 0, categoryId: 'fatura', personId: 'ortak', dueDate: 20 },
  { title: 'Ev İnterneti', expectedAmount: 0, categoryId: 'fatura', personId: 'ortak', dueDate: 12 },
  { title: 'Cep Telefonu (Anne)', expectedAmount: 0, categoryId: 'fatura', personId: 'anne', dueDate: 22 },
  { title: 'Cep Telefonu (Baba)', expectedAmount: 0, categoryId: 'fatura', personId: 'baba', dueDate: 22 },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  persons: DEFAULT_PERSONS,
  categories: DEFAULT_CATEGORIES,
  defaultFixedExpenses: DEFAULT_FIXED_TEMPLATES,
};
