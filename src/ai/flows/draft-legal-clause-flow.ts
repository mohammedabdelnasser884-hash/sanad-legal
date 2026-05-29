'use server';
/**
 * @fileOverview This file implements a Genkit flow for drafting Saudi legal clauses.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftLegalClauseInputSchema = z.object({
  clausePrompt: z
    .string()
    .describe('The prompt from the lawyer to generate the legal clause.'),
  additionalContext: z
    .string()
    .optional()
    .describe(
      'Any additional context or background information relevant to drafting the clause.'
    ),
  language: z
    .enum(['Arabic', 'English'])
    .default('Arabic')
    .describe('The desired language for the drafted clause.'),
});
export type DraftLegalClauseInput = z.infer<typeof DraftLegalClauseInputSchema>;

const DraftLegalClauseOutputSchema = z.object({
  draftedClause: z
    .string()
    .describe('The AI-generated legal clause or document section.'),
});
export type DraftLegalClauseOutput = z.infer<typeof DraftLegalClauseOutputSchema>;

export async function draftLegalClause(
  input: DraftLegalClauseInput
): Promise<DraftLegalClauseOutput> {
  return draftLegalClauseFlow(input);
}

const draftLegalClausePrompt = ai.definePrompt({
  name: 'draftLegalClausePrompt',
  input: {schema: DraftLegalClauseInputSchema},
  output: {schema: DraftLegalClauseOutputSchema},
  prompt: `أنت مستشار قانوني خبير متخصص في صياغة العقود واللوائح في المملكة العربية السعودية. هدفك هو صياغة بند قانوني دقيق ومتوافق مع الأنظمة السعودية السارية.

قم بصياغة بند قانوني بناءً على الطلب التالي:
{{{clausePrompt}}}

{{#if additionalContext}}
ضع في الاعتبار السياق الإضافي التالي:
{{{additionalContext}}}
{{/if}}

يجب أن تكون الصياغة باللغة {{{language}}}. تأكد من استخدام المصطلحات القانونية السعودية الصحيحة (مثل استخدام "النظام" بدلاً من "القانون" عند الإشارة للأنظمة السعودية).`,
});

const draftLegalClauseFlow = ai.defineFlow(
  {
    name: 'draftLegalClauseFlow',
    inputSchema: DraftLegalClauseInputSchema,
    outputSchema: DraftLegalClauseOutputSchema,
  },
  async input => {
    const {output} = await draftLegalClausePrompt(input);
    return output!;
  }
);
