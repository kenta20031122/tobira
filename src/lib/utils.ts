import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<string, string> = {
  nature: 'Nature',
  history: 'History',
  onsen: 'Onsen',
  food: 'Food',
  activity: 'Activity',
  spiritual: 'Spiritual',
};

export const PREFECTURE_LABELS: Record<string, string> = {
  Kumamoto: 'Kumamoto',
  Oita: 'Oita',
  Miyazaki: 'Miyazaki',
};
