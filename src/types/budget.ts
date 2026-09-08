export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
  role?: string;
  color: string;
  avatar: string; // Emoji
}

export type CategoryType = 
  | 'market'
  | 'pazar'
  | 'fatura'
  | 'kira'
  | 'aidat'
  | 'kasap_manav'
  | 'saglik'
  | 'ulasim'
  | 'giyim'
  | 'yemek'
  | 'egitim'
  | 'ev_esya'
  | 'kisisel'
  | 'diger';

export interface Category {
  id: CategoryType | string;
  name: string;
  icon: string; // Emoji
  color: string;
}

export interface FixedExpenseItem {
  id: string;
  title: string;
  expectedAmount: number;
  actualAmount?: number;
  categoryId: string;
  personId: PersonId;
  isPaid: boolean;
  dueDate?: number; // Gün olarak (ör. ayın 15'i)
  paidAt?: string; // ISO date string
  note?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  personId: PersonId;
  date: string; // YYYY-MM-DD
  paymentMethod?: 'kredi_karti' | 'nakit' | 'havale';
  note?: string;
  createdAt: string;
}

export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  personId: PersonId;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface MonthlyBudget {
  monthKey: string; // YYYY-MM ör: '2026-03'
  incomes: IncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  expenses: ExpenseItem[];
  notes?: string;
}

export interface FixedExpenseTemplate {
  id?: string;
  title: string;
  expectedAmount: number;
  categoryId: string;
  personId: PersonId;
  dueDate?: number;
}

export interface AppSettings {
  persons: Person[];
  categories: Category[];
  defaultFixedExpenses: FixedExpenseTemplate[];
}
