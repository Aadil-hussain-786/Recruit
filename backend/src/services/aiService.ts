import { callOpenRouter, getEmbeddings } from './aiWrapper';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

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
     * Parse resume text into structured data using OpenRouter
     */
    async parseResume(text: string): Promise<any> {
        try {
            const prompt = `You are a professional HR data parser. Convert the resume text into a CLEAN JSON object.
            Fields: firstName, lastName, email, phone, currentCompany, currentTitle, totalExperience (months), skills (array), expectedSalary, noticePeriod, location {city, country}.
            Also evaluate: technicalAptitude, leadershipPotential, culturalAlignment, creativity, confidence (all 0-100).
            Include 3 behavioral notes in 'patternNotes' array.

            RETURN ONLY JSON. DO NOT EXPLAIN.
            
            Text:
            ${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a JSON extractor.' },
                { role: 'user', content: prompt }
            ], 'meta-llama/llama-3.3-70b-instruct:free', { temperature: 0.1, seed: 42 });

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

            return {
                ...parsed,
                patterns: parsed.patterns || {
                    technicalAptitude: parsed.technicalAptitude || 0,
                    leadershipPotential: parsed.leadershipPotential || 0,
                    culturalAlignment: parsed.culturalAlignment || 0,
                    creativity: parsed.creativity || 0,
                    confidence: parsed.confidence || 0,
                    notes: parsed.patternNotes || []
                }
            };
        } catch (error: any) {
            console.error('Error parsing resume:', error);
            return {};
        }
    },

    /**
     * Specially analyze student resumes for excellence patterns
     */
    async fetchStudentPatterns(text: string): Promise<any> {
        try {
            const prompt = `Perform a high-precision excellence audit on this candidate. 
            Assign scores (0-100) based on specific evidence in the text.
            
            REQUIRED FIELDS:
            - technicalAptitude
            - leadershipPotential
            - culturalAlignment
            - creativity
            - confidence
            - notes (array of 3 specific evidentiary notes)
            - interviewQuestions (array of 3 objects with 'question' and 'idealAnswer')
            
            The 'idealAnswer' must provide a rubric for the interviewer.
            
            RETURN ONLY JSON. BE RIGID AND CONSISTENT.
            
            Candidate Text:
            ${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a rigorous auditing AI. Output ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ], 'meta-llama/llama-3.3-70b-instruct:free', { temperature: 0.1, seed: 12345 });

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in response");

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error('Error fetching student patterns:', error);
            // Fallback object to prevent crashes
            return {
                technicalAptitude: 50,
                leadershipPotential: 50,
                culturalAlignment: 50,
                creativity: 50,
                confidence: 50,
                notes: ["Automated scan yielded generic results."],
                interviewQuestions: [
                    { question: "Could you walk me through your most complex project?", idealAnswer: "The candidate should describe a technical challenge they solved end-to-end." }
                ]
            };
        }
    },

    /**
     * Generate Job Description using AI
     */
    async generateJD(role: string, seniority: string, keySkills: string[], tone: string = 'formal'): Promise<string> {
        try {
            const prompt = `You are an expert HR copywriter. Write a compelling, enterprise-grade Job Description for the following role:
            Role: ${role}
            Seniority: ${seniority}
            Key Skills: ${keySkills.join(', ')}
            Tone: ${tone}
            
            Include sections: About the Role, Responsibilities, Requirements, and Why Join Us.
            The JD should be professional and SEO-optimized.`;

            return await callOpenRouter([
                { role: 'system', content: 'You are an expert HR copywriter.' },
                { role: 'user', content: prompt }
            ]);
        } catch (error: any) {
            console.error('Detailed Error generating JD:', error);
            return `Fallback JD for ${role}...`;
        }
    },

    /**
     * Detect potential bias in candidate profile or job description
     */
    async detectBias(text: string): Promise<any> {
        try {
            const prompt = `You are an expert in DEI (Diversity, Equity, and Inclusion). Analyze the provided text for potential hiring bias. 
            Return ONLY a JSON object with strictly:
            - score (number 0-100)
            - findings (array of strings)
            - suggestions (array of strings)
            Text: ${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a DEI expert. Return only JSON.' },
                { role: 'user', content: prompt }
            ]);

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

            return {
                score: typeof parsed.score === 'number' ? parsed.score : 0,
                findings: Array.isArray(parsed.findings) ? parsed.findings : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
            };
        } catch (error: any) {
            console.error('Error detecting bias:', error);
            return { score: 0, findings: [], suggestions: [] };
        }
    },

    /**
     * Generate Vector Embeddings.
     * Returns an EMPTY ARRAY on failure — never a random vector.
     * The matchingService detects empty/zero embeddings and uses keyword scoring instead,
     * which is always more accurate than comparing two random number arrays.
     */
    async generateEmbeddings(text: string): Promise<number[]> {
        try {
            return await getEmbeddings(text);
        } catch (error) {
            console.warn('[aiService] Embeddings failed — keyword scoring will be used instead:', error);
            return []; // Empty = invalid, matchingService will use keyword fallback
        }
    }
};

/**
 * Backward compatible openai object
 */
export const openai = {
    chat: {
        completions: {
            create: async (params: any) => {
                const responseText = await callOpenRouter(params.messages, params.model);
                return {
                    choices: [{ message: { content: responseText } }]
                };
            }
        }
    }
};
