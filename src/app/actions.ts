
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { estimateProfitMargin, EstimateProfitMarginOutput } from '@/ai/flows/estimate-profit-margin';
import { InventoryItem } from '@/components/inventory-summary';
import Stripe from 'stripe';

export interface ActionState {
  data: EstimateProfitMarginOutput | null;
  error: string | null;
  success: boolean;
}

const schema = z.object({
  productCategory: z.string().min(3, { message: 'Product category must be at least 3 characters long.' }),
});

export async function getProfitMarginSuggestion(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = schema.safeParse({
    productCategory: formData.get('productCategory'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.productCategory?.[0] || 'Invalid input.',
      success: false,
    };
  }

  try {
    const result = await estimateProfitMargin({ productCategory: validatedFields.data.productCategory });
    return { data: result, error: null, success: true };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'An unexpected error occurred. Please try again.', success: false };
  }
}

export async function createCheckoutSession(items: InventoryItem[]) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                description: `Total cost: $${item.totalCost.toFixed(2)}, Profit: $${item.profitAmount.toFixed(2)}`,
            },
            unit_amount: Math.round(item.finalPrice * 100), // amount in cents
        },
        quantity: 1,
    }));
    
    // Ensure there is a valid origin for success and cancel URLs
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${origin}/?payment_success=true`,
        cancel_url: `${origin}/?payment_cancelled=true`,
    });

    if (session.url) {
        redirect(session.url);
    } else {
        throw new Error('Failed to create Stripe checkout session.');
    }
}
