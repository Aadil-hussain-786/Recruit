import OpenAI from 'openai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const aiService = {
    /**
     * Extract text from PDF or DOCX buffer
     */
    async extractText(buffer: Buffer, mimetype: string): Promise<string> {
        if (mimetype === 'application/pdf') {
            const data = await (pdf as any)(buffer);
            return data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }
        throw new Error('Unsupported file format');
    },

    /**
     * Parse resume text into structured data using GPT-4
     */
    async parseResume(text: string): Promise<any> {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert HR recruitment AI. Extract the following information from the provided resume text into a CLEAN JSON format:
                    - firstName, lastName, email, phone, currentCompany, currentTitle, totalExperience (in months), skills (array), expectedSalary (null if not found), noticePeriod (null if not found), location (object with city, country).
                    Only return the JSON object, no other text.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    },

    /**
     * Generate Job Description using AI
     */
    async generateJD(role: string, seniority: string, keySkills: string[], tone: string = 'formal'): Promise<string> {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert HR copywriter. Write a compelling, enterprise-grade Job Description for the following role:
                    Role: ${role}
                    Seniority: ${seniority}
                    Key Skills: ${keySkills.join(', ')}
                    Tone: ${tone}
                    
                    Include sections: About the Role, Responsibilities, Requirements, and Why Join Us.
                    The JD should be professional and SEO-optimized.`
                }
            ]
        });

        return response.choices[0].message.content || '';
    },

    /**
     * Detect potential bias in candidate profile or job description
     */
    async detectBias(text: string): Promise<any> {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert in DEI (Diversity, Equity, and Inclusion). Analyze the provided text for potential hiring bias (gender, age, ethnicity, etc.). 
                    Return a JSON object with:
                    - score (0-100, 100 being most biased)
                    - findings (array of strings)
                    - suggestions (array of strings to mitigate bias)`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    },

    /**
     * Generate Vector Embeddings for matching
     */
    async generateEmbeddings(text: string): Promise<number[]> {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        return response.data[0].embedding;
    }
};
