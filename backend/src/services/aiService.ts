import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to get Gemini model
const getModel = (modelName: string = "gemini-flash-latest") => {
    return genAI.getGenerativeModel({ model: modelName });
};

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
     * Parse resume text into structured data using Gemini
     */
    async parseResume(text: string): Promise<any> {
        try {
            const model = getModel();
            const prompt = `You are an expert HR recruitment AI. Extract the following information from the provided resume text into a CLEAN JSON format:
            - firstName, lastName, email, phone, currentCompany, currentTitle, totalExperience (in months), skills (array), expectedSalary (null if not found), noticePeriod (null if not found), location (object with city, country).
            Only return the JSON object, no other text.
            
            Resume text:
            ${text}`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const responseText = response.text();

            // Extract JSON block if present
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
        } catch (error: any) {
            console.error('Error parsing resume:', error);
            return {};
        }
    },

    /**
     * Generate Job Description using AI
     */
    async generateJD(role: string, seniority: string, keySkills: string[], tone: string = 'formal'): Promise<string> {
        try {
            const model = getModel();
            const prompt = `You are an expert HR copywriter. Write a compelling, enterprise-grade Job Description for the following role:
            Role: ${role}
            Seniority: ${seniority}
            Key Skills: ${keySkills.join(', ')}
            Tone: ${tone}
            
            Include sections: About the Role, Responsibilities, Requirements, and Why Join Us.
            The JD should be professional and SEO-optimized.`;

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            console.error('Error generating JD:', error);
            throw new Error(`Failed to generate JD: ${error.message}`);
        }
    },

    /**
     * Detect potential bias in candidate profile or job description
     */
    async detectBias(text: string): Promise<any> {
        try {
            const model = getModel();
            const prompt = `You are an expert in DEI (Diversity, Equity, and Inclusion). Analyze the provided text for potential hiring bias (gender, age, ethnicity, etc.). 
            Return a JSON object with:
            - score (0-100, 100 being most biased)
            - findings (array of strings)
            - suggestions (array of strings to mitigate bias)
            
            Text to analyze:
            ${text}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
        } catch (error: any) {
            console.error('Error detecting bias:', error);
            return { score: 0, findings: [], suggestions: [] };
        }
    },

    /**
     * Generate Vector Embeddings for matching
     */
    async generateEmbeddings(text: string): Promise<number[]> {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }
};

// Export a mock openai object for backward compatibility where possible, 
// though direct conversion is better.
export const openai = {
    chat: {
        completions: {
            create: async (params: any) => {
                const model = getModel();
                const systemMessage = params.messages.find((m: any) => m.role === 'system')?.content || '';
                const userMessage = params.messages.find((m: any) => m.role === 'user')?.content || '';

                const prompt = systemMessage ? `${systemMessage}\n\nUser: ${userMessage}` : userMessage;
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                return {
                    choices: [
                        {
                            message: {
                                content: responseText
                            }
                        }
                    ]
                };
            }
        }
    }
};
