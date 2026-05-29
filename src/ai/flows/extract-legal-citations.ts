'use server';
/**
 * @fileOverview A Genkit flow for extracting legal citations from text.
 *
 * - extractLegalCitations - A function that extracts legal citations from a given text.
 * - ExtractLegalCitationsInput - The input type for the extractLegalCitations function.
 * - ExtractLegalCitationsOutput - The return type for the extractLegalCitations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractLegalCitationsInputSchema = z.string().describe('The legal text or document from which to extract citations.');
export type ExtractLegalCitationsInput = z.infer<typeof ExtractLegalCitationsInputSchema>;

const ExtractLegalCitationsOutputSchema = z.array(z.string()).describe('An array of extracted legal citations.');
export type ExtractLegalCitationsOutput = z.infer<typeof ExtractLegalCitationsOutputSchema>;

export async function extractLegalCitations(input: ExtractLegalCitationsInput): Promise<ExtractLegalCitationsOutput> {
  return extractLegalCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLegalCitationsPrompt',
  input: { schema: ExtractLegalCitationsInputSchema },
  output: { schema: ExtractLegalCitationsOutputSchema },
  prompt: `You are an expert legal assistant. Your task is to identify and extract all distinct legal citations from the provided text or document. A legal citation can include references to cases, statutes, regulations, articles, or any official legal documents.

  Please return the extracted citations as a JSON array of strings. Each string in the array should be a complete and accurate legal citation found in the text, without any additional formatting or surrounding text. Ensure you capture citations in both English and Arabic.

  Example of expected output format:
  ["Smith v. Jones, 123 U.S. 456 (2023)", "القانون رقم 12 لسنة 2024", "Doe, J. (2022). Legal Principles, 15(2), 100-110"]

  Text to analyze:
  {{{input}}}`,
});

const extractLegalCitationsFlow = ai.defineFlow(
  {
    name: 'extractLegalCitationsFlow',
    inputSchema: ExtractLegalCitationsInputSchema,
    outputSchema: ExtractLegalCitationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
