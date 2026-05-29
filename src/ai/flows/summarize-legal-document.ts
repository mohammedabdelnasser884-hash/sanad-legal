'use server';
/**
 * @fileOverview A Genkit flow for summarizing lengthy legal documents.
 *
 * - summarizeLegalDocument - A function that handles the legal document summarization process.
 * - SummarizeLegalDocumentInput - The input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocumentOutput - The return type for the summarizeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The full text of the legal document to be summarized.'),
});
export type SummarizeLegalDocumentInput = z.infer<
  typeof SummarizeLegalDocumentInputSchema
>;

const SummarizeLegalDocumentOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the legal document, highlighting core arguments and key points.'
    ),
});
export type SummarizeLegalDocumentOutput = z.infer<
  typeof SummarizeLegalDocumentOutputSchema
>;

const summarizeLegalDocumentPrompt = ai.definePrompt({
  name: 'summarizeLegalDocumentPrompt',
  input: {schema: SummarizeLegalDocumentInputSchema},
  output: {schema: SummarizeLegalDocumentOutputSchema},
  prompt: `You are an AI legal assistant specialized in summarizing complex legal documents. Your task is to provide a concise and clear summary of the provided legal document, focusing on core arguments, key facts, and important conclusions. The summary should be easy for a legal professional to quickly grasp the essence of the document.

Legal Document: {{{documentText}}}`,
});

const summarizeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocumentFlow',
    inputSchema: SummarizeLegalDocumentInputSchema,
    outputSchema: SummarizeLegalDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeLegalDocumentPrompt(input);
    return output!;
  }
);

export async function summarizeLegalDocument(
  input: SummarizeLegalDocumentInput
): Promise<SummarizeLegalDocumentOutput> {
  return summarizeLegalDocumentFlow(input);
}
