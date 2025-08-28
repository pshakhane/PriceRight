'use server';

/**
 * @fileOverview An AI agent that estimates the optimal profit margin for a product.
 *
 * - estimateProfitMargin - A function that estimates the profit margin.
 * - EstimateProfitMarginInput - The input type for the estimateProfitMargin function.
 * - EstimateProfitMarginOutput - The return type for the estimateProfitMargin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateProfitMarginInputSchema = z.object({
  productCategory: z
    .string()
    .describe('The category of the product (e.g., electronics, clothing, etc.).'),
});
export type EstimateProfitMarginInput = z.infer<typeof EstimateProfitMarginInputSchema>;

const EstimateProfitMarginOutputSchema = z.object({
  profitMargin: z
    .number()
    .describe(
      'The estimated optimal profit margin for the product, expressed as a percentage (e.g., 0.15 for 15%).'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the estimated profit margin, including market trends and competitive analysis.'
    ),
});
export type EstimateProfitMarginOutput = z.infer<typeof EstimateProfitMarginOutputSchema>;

export async function estimateProfitMargin(input: EstimateProfitMarginInput): Promise<EstimateProfitMarginOutput> {
  return estimateProfitMarginFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateProfitMarginPrompt',
  input: {schema: EstimateProfitMarginInputSchema},
  output: {schema: EstimateProfitMarginOutputSchema},
  prompt: `You are an expert in market analysis and pricing strategies. Based on the product category provided, you will estimate the optimal profit margin for the product, taking into account current market trends and competitive analysis. Return the profit margin as a decimal (e.g., 0.15 for 15%). Also, provide a brief reasoning for your estimation.

Product Category: {{{productCategory}}}`,
});

const estimateProfitMarginFlow = ai.defineFlow(
  {
    name: 'estimateProfitMarginFlow',
    inputSchema: EstimateProfitMarginInputSchema,
    outputSchema: EstimateProfitMarginOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
