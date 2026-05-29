'use server';
/**
 * @fileOverview A Genkit flow to analyze a contract document and extract key information focusing on Saudi Law.
 *
 * - extractContractData - A function that handles the contract data extraction process.
 * - ExtractContractDataInput - The input type for the contract data extraction.
 * - ExtractContractDataOutput - The return type for the contract data extraction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractContractDataInputSchema = z.object({
  contractDataUri: z
    .string()
    .describe(
      "A contract document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractContractDataInput = z.infer<typeof ExtractContractDataInputSchema>;

const ExtractContractDataOutputSchema = z.object({
  parties: z
    .array(z.string())
    .describe('A list of all parties involved in the contract (e.g., First Party, Second Party).'),
  effectiveDate: z
    .string()
    .describe('The effective date of the contract in YYYY-MM-DD format (Gregorian or Hijri).'),
  terminationDate: z
    .string()
    .optional()
    .describe('The termination date of the contract, if specified.'),
  obligations: z
    .array(z.string())
    .describe('A list of key obligations or responsibilities for each party.'),
  saudiLawCompliance: z
    .array(z.string())
    .describe('Observations regarding compliance with relevant Saudi Laws (e.g., Civil Transactions Law, Labor Law).'),
  criticalTerms: z
    .array(z.string())
    .describe('A list of critical terms or clauses from the contract.'),
  summary: z.string().describe('A concise summary of the entire contract in Arabic.'),
});
export type ExtractContractDataOutput = z.infer<typeof ExtractContractDataOutputSchema>;

export async function extractContractData(
  input: ExtractContractDataInput
): Promise<ExtractContractDataOutput> {
  return extractContractDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContractDataPrompt',
  input: {schema: ExtractContractDataInputSchema},
  output: {schema: ExtractContractDataOutputSchema},
  prompt: `أنت مساعد قانوني ذكي متخصص في الأنظمة السعودية.
مهمتك هي مراجعة عقد مقدم بعناية واستخراج المعلومات الرئيسية منه، مع التركيز على توافقه مع الأنظمة في المملكة العربية السعودية.

قم باستخراج التفاصيل التالية باللغة العربية:
- أسماء الأطراف المعنية (الطرف الأول، الطرف الثاني، إلخ).
- تاريخ السريان (ميلادي أو هجري).
- تاريخ الانتهاء، إذا تم ذكره.
- قائمة موجزة بالالتزامات والمسؤوليات الرئيسية لكل طرف.
- ملاحظات حول التوافق مع الأنظمة السعودية (مثل نظام المعاملات المدنية، نظام العمل، أو نظام الشركات).
- قائمة بأهم البنود الجوهرية أو الشروط الجزائية.
- ملخص عام وشامل للعقد.

إذا لم يتم ذكر تاريخ انتهاء صراحة، اتركه فارغاً.

مستند العقد: {{media url=contractDataUri}}`,
});

const extractContractDataFlow = ai.defineFlow(
  {
    name: 'extractContractDataFlow',
    inputSchema: ExtractContractDataInputSchema,
    outputSchema: ExtractContractDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('فشل استخراج بيانات العقد.');
    }
    return output;
  }
);
