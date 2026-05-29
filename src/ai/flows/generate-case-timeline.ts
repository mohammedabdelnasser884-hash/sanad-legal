'use server';
/**
 * @fileOverview A Genkit flow for generating a chronological timeline of events for a legal case.
 *
 * - generateCaseTimeline - A function that handles the generation of the case timeline.
 * - GenerateCaseTimelineInput - The input type for the generateCaseTimeline function.
 * - GenerateCaseTimelineOutput - The return type for the generateCaseTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentSchema = z.object({
  title: z.string().describe('The title of the document.'),
  content: z.string().describe('The full text content of the document.'),
});

const GenerateCaseTimelineInputSchema = z.object({
  caseDescription: z
    .string()
    .describe('A high-level description of the legal case.'),
  activityLogs: z
    .array(z.string())
    .describe('A list of chronological activity log entries for the case.'),
  documents: z
    .array(DocumentSchema)
    .describe('A list of relevant legal documents for the case, with title and content.'),
});
export type GenerateCaseTimelineInput = z.infer<
  typeof GenerateCaseTimelineInputSchema
>;

const TimelineEventSchema = z.object({
  date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
  title: z.string().describe('A brief, descriptive title for the event.'),
  description: z
    .string()
    .describe('A detailed description of the event, summarizing its significance.'),
});

const GenerateCaseTimelineOutputSchema = z.object({
  timelineEvents: z
    .array(TimelineEventSchema)
    .describe('A chronological list of key events in the case timeline.'),
});
export type GenerateCaseTimelineOutput = z.infer<
  typeof GenerateCaseTimelineOutputSchema
>;

export async function generateCaseTimeline(
  input: GenerateCaseTimelineInput
): Promise<GenerateCaseTimelineOutput> {
  return generateCaseTimelineFlow(input);
}

const generateCaseTimelinePrompt = ai.definePrompt({
  name: 'generateCaseTimelinePrompt',
  input: {schema: GenerateCaseTimelineInputSchema},
  output: {schema: GenerateCaseTimelineOutputSchema},
  prompt: `You are an expert legal assistant specialized in creating clear and concise case timelines.
Your task is to analyze the provided case description, activity logs, and documents to extract all key events and present them in a chronological timeline.

For each event, you must identify a specific date, a concise title, and a detailed description summarizing its importance and context within the case.
Ensure the timeline is strictly chronological and highlights significant milestones and activities.

--- Case Information ---
Case Description: {{{caseDescription}}}

--- Activity Logs ---
{{#each activityLogs}}
- {{{this}}}
{{/each}}

--- Documents ---
{{#each documents}}
Document Title: {{{title}}}
Document Content:
{{{content}}}

{{/each}}

--- Instructions ---
Extract all key events from the provided information. Combine and synthesize information from the description, logs, and documents to create comprehensive event descriptions.
Ensure the output is a JSON array of objects, with each object having 'date' (YYYY-MM-DD), 'title', and 'description' fields.
Output the events in strict chronological order, from earliest to latest.`,
});

const generateCaseTimelineFlow = ai.defineFlow(
  {
    name: 'generateCaseTimelineFlow',
    inputSchema: GenerateCaseTimelineInputSchema,
    outputSchema: GenerateCaseTimelineOutputSchema,
  },
  async input => {
    const {output} = await generateCaseTimelinePrompt(input);
    return output!;
  }
);
