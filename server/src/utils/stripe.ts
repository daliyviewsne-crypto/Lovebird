import stripe from 'stripe';

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const createStripeCustomer = async (email: string, name: string) => {
  try {
    const customer = await stripeClient.customers.create({
      email,
      name
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

export const createSubscription = async (
  customerId: string,
  priceId: string,
  paymentMethodId: string
) => {
  try {
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId
    });
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripeClient.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export { stripeClient };
