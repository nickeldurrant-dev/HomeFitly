export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Rom3qRw9B1y4TywYbqNxKqntml8tS5qYRmYDYxy9qJYvbZNFwSkHUuIJwqOrgcnOBeFUhxUJaCe9WycZJMjePqg008AhAmlEj';

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_Sla5WYR7N4vuMQ',
    priceId: 'price_1Rq2uzRw9B1y4Tywd1R8EhUQ',
    name: 'Premium Service',
    description: 'Unlock all premium features including unlimited tasks, smart reminders, advanced checklists, warranty tracking, document storage, and priority support.',
    mode: 'subscription',
    price: 4.99,
    currency: 'usd',
    interval: 'month'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getPremiumProduct = (): StripeProduct => {
  return stripeProducts[0]; // Premium Service is the only product
};