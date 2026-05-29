import { config } from 'dotenv';
config();

import '@/ai/flows/extract-contract-data.ts';
import '@/ai/flows/generate-case-timeline.ts';
import '@/ai/flows/summarize-legal-document.ts';
import '@/ai/flows/draft-legal-clause-flow.ts';
import '@/ai/flows/extract-legal-citations.ts';