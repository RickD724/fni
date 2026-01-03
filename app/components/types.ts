export type Product = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  link?: string; // optional "Learn more" link
};

export type Package = {
  id: string;
  name: string;
  description: string;
  icon: string;
  productIds: string[];
  discount?: number; // Optional percentage discount
  color?: string; // Badge color
};
