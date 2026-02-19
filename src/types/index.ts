export type Prefecture = 'Kumamoto' | 'Oita' | 'Miyazaki';

export type Category =
  | 'nature'
  | 'history'
  | 'onsen'
  | 'food'
  | 'activity'
  | 'spiritual';

export type Spot = {
  id: string;
  name: string;
  prefecture: Prefecture;
  region: 'kyushu';
  categories: Category[];
  description: string;
  address: string;
  lat: number;
  lng: number;
  image_url: string;
  tags: string[];
  is_premium: boolean;
  highlights: string[];
  best_season: string;
  access: string;
  admission?: string;
  duration?: string;
  website_url?: string;
};

export type TripDay = {
  date?: string;
  spots: Spot[];
  notes?: string;
};

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  days: TripDay[];
  prefecture: Prefecture;
  created_at: string;
};
