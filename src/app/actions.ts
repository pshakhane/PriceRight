
'use server';

import { z } from 'zod';
import { estimateProfitMargin, EstimateProfitMarginOutput } from '@/ai/flows/estimate-profit-margin';

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
