import { callOpenRouter, getEmbeddings } from './aiWrapper';
import mammoth from 'mammoth';

// Try to load pdf-parse with different approaches
let pdfParse: any;
try {
  const mod = require('pdf-parse');
  pdfParse = mod.default || mod;
} catch {
  try {
    const mod = require('pdf-parse/lib/pdf-parse.js');
    pdfParse = mod.default || mod;
  } catch {
    pdfParse = async (buffer: Buffer) => {
      throw new Error('pdf-parse module not available');
    };
  }
}

export const aiService = {
    /**
     * Extract text from PDF or DOCX buffer
     */
    async extractText(buffer: Buffer, mimetype: string): Promise<string> {
        if (mimetype === 'application/pdf') {
            const startTime = Date.now();
            console.log(`[aiService] PDF extraction started. Buffer size: ${buffer.length} bytes`);
            
            let data;
            try {
                data = await pdfParse(buffer);
            } catch (error: any) {
                const extractionTime = Date.now() - startTime;
                console.error(`[aiService] PDF extraction failed after ${extractionTime}ms. Error: ${error.message}`, {
                    bufferLength: buffer.length,
                    errorStack: error.stack,
                    errorType: error.constructor.name
                });
                throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
            }
            
            const extractionTime = Date.now() - startTime;
            const textLength = data.text.length;
            
            console.log(`[aiService] PDF extraction completed. Time: ${extractionTime}ms, Text length: ${textLength} characters`);
            
            if (!data.text || data.text.trim().length === 0) {
                console.warn('[aiService] PDF extraction produced empty text');
                return '';
            }
            
            return data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            const startTime = Date.now();
            console.log(`[aiService] DOCX extraction started. Buffer size: ${buffer.length} bytes`);
            
            let result;
            try {
                result = await mammoth.extractRawText({ buffer });
            } catch (error: any) {
                const extractionTime = Date.now() - startTime;
                console.error(`[aiService] DOCX extraction failed after ${extractionTime}ms. Error: ${error.message}`, {
                    bufferLength: buffer.length,
                    errorStack: error.stack,
                    errorType: error.constructor.name
                });
                throw new Error('Failed to extract text from DOCX. The file may be corrupted.');
            }
            
            const extractionTime = Date.now() - startTime;
            console.log(`[aiService] DOCX extraction completed. Time: ${extractionTime}ms, Text length: ${result.value.length} characters`);
            
            return typeof result.value === 'string' ? result.value : '';
        }
        console.warn('[aiService] Unsupported file format attempted for extraction', { mimetype });
        throw new Error('Unsupported file format');
    },

    /**
     * Parse resume text into structured data with extended fields
     */
    async parseResume(text: string, language: string = 'en-US'): Promise<any> {
        try {
            const prompt = `You are a professional HR data parser. Convert the resume text into a CLEAN JSON object.

REQUIRED FIELDS:
- firstName (string)
- lastName (string)
- email (string)
- phone (string)
- currentCompany (string)
- currentTitle (string)
- totalExperience (number — in months)
- skills (array of strings — extract ALL technical and soft skills)
- expectedSalary (number or null)
- noticePeriod (string or null)
- location: { city, country }
- linkedInUrl (string or null — extract if present)
- education: array of { degree, institution, year, field }
- certifications: array of strings
- languages: array of strings (spoken/written languages)
- workPreference: "remote" | "hybrid" | "onsite" | "flexible" (infer from context)

AI EVALUATION SCORES (0-100, based on evidence in resume):
- technicalAptitude: depth and breadth of technical skills
- leadershipPotential: management experience, team lead roles, mentoring
- culturalAlignment: teamwork signals, open-source contributions, community involvement
- creativity: side projects, hackathons, patents, novel approaches mentioned
- confidence: strength of self-description, quantified achievements
- communicationSkill: writing quality, presentation experience, publications
- problemSolvingAbility: complex projects handled, debugging stories, system design
- adaptability: role changes, technology migrations, cross-functional work
- domainExpertise: years in specific domain, depth of specialization
- teamworkOrientation: collaborative projects, "we" language, cross-team work
- growthMindset: learning mentions, new tech adoption, career progression

Include 3 behavioral observations in 'patternNotes' array.

RETURN ONLY JSON. No explanation. No markdown fences.

Resume Text:
${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a JSON extractor. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ], 'meta-llama/llama-3.3-70b-instruct:free', { temperature: 0.1, seed: 42 });

            const cleaned = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

            return {
                ...parsed,
                patterns: parsed.patterns || {
                    technicalAptitude: parsed.technicalAptitude || 0,
                    leadershipPotential: parsed.leadershipPotential || 0,
                    culturalAlignment: parsed.culturalAlignment || 0,
                    creativity: parsed.creativity || 0,
                    confidence: parsed.confidence || 0,
                    communicationSkill: parsed.communicationSkill || 0,
                    problemSolvingAbility: parsed.problemSolvingAbility || 0,
                    adaptability: parsed.adaptability || 0,
                    domainExpertise: parsed.domainExpertise || 0,
                    teamworkOrientation: parsed.teamworkOrientation || 0,
                    growthMindset: parsed.growthMindset || 0,
                    notes: parsed.patternNotes || []
                }
            };
        } catch (error: any) {
            console.error('Error parsing resume:', error);
            return {};
        }
    },

    /**
     * Deep analysis patterns for candidates
     */
    async fetchStudentPatterns(text: string): Promise<any> {
        try {
            const prompt = `Perform a comprehensive excellence audit on this candidate.
            Assign scores (0-100) based on specific evidence in the text.
            
            REQUIRED FIELDS IN JSON:
            PRIMARY METRICS:
            - technicalAptitude (0-100)
            - leadershipPotential (0-100)
            - culturalAlignment (0-100)
            - creativity (0-100)
            - confidence (0-100)
            
            EXTENDED METRICS:
            - communicationSkill (0-100)
            - problemSolvingAbility (0-100)
            - adaptability (0-100)
            - domainExpertise (0-100)
            - teamworkOrientation (0-100)
            - selfAwareness (0-100)
            - growthMindset (0-100)
            
            QUALITATIVE:
            - notes (array of 3 specific observations with evidence)
            - interviewQuestions (array of 3 objects with 'question' and 'idealAnswer')
            - hiddenBriefing (OBJECT with: 'vibe', 'theOneThing', 'probe', 'redFlags' array)
            - strengthsAndWeaknesses: { strengths: [...], weaknesses: [...], blindSpots: [...] }
            
            VIBE: Summarize their professional energy (e.g. 'Founding Engineer Energy', 'Steady Corporate Stabilizer').
            THE ONE THING: Most critical insight about this candidate.
            PROBE: A specific question to test their biggest weakness.
            RED FLAGS: Subtle inconsistencies or gaps.
            
            SCORING RULES:
            - DO NOT default everything to 50. Use the full 0-100 range.
            - Score below 30 if there's no evidence.
            - Score above 80 only with strong evidence.
            
            RETURN ONLY JSON. BE RIGID AND CONSISTENT.
            
            Candidate Text:
            ${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a rigorous auditing AI. Output ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ], 'meta-llama/llama-3.3-70b-instruct:free', { temperature: 0.1, seed: 12345 });

            const cleaned = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in response");

            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            console.error('Error fetching student patterns:', error);
            return {
                technicalAptitude: 0,
                leadershipPotential: 0,
                culturalAlignment: 0,
                creativity: 0,
                confidence: 0,
                communicationSkill: 0,
                problemSolvingAbility: 0,
                adaptability: 0,
                domainExpertise: 0,
                teamworkOrientation: 0,
                selfAwareness: 0,
                growthMindset: 0,
                notes: ["Analysis could not be completed. Manual review required."],
                interviewQuestions: [
                    { question: "Walk me through your most complex project.", idealAnswer: "Should describe a technical challenge solved end-to-end." }
                ],
                hiddenBriefing: {
                    vibe: "Pending analysis...",
                    theOneThing: "Verify project claims.",
                    probe: "How do you handle ambiguous requirements?",
                    redFlags: []
                }
            };
        }
    },

    /**
     * Generate Job Description using AI
     */
    async generateJD(role: string, seniority: string, keySkills: string[], tone: string = 'formal'): Promise<string> {
        try {
            const prompt = `You are an expert HR copywriter. Write a compelling, enterprise-grade Job Description for:
            Role: ${role}
            Seniority: ${seniority}
            Key Skills: ${keySkills.join(', ')}
            Tone: ${tone}
            
            Include: About the Role, Responsibilities, Requirements, and Why Join Us.
            Make it professional and SEO-optimized.`;

            return await callOpenRouter([
                { role: 'system', content: 'You are an expert HR copywriter.' },
                { role: 'user', content: prompt }
            ]);
        } catch (error: any) {
            console.error('Error generating JD:', error);
            return `Fallback JD for ${role}...`;
        }
    },

    /**
     * Detect potential bias in text
     */
    async detectBias(text: string): Promise<any> {
        console.log('[aiService] detectBias called. Text length:', text?.length);
        try {
            const prompt = `Analyze the provided text for potential hiring bias.
            Return ONLY a JSON object with:
            - score (number 0-100)
            - findings (array of strings)
            - suggestions (array of strings)
            Text: ${text}`;

            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are a DEI expert. Return only JSON.' },
                { role: 'user', content: prompt }
            ]);

            const cleaned = responseText.replace(/```json\n?|\n?```/gi, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
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
     * Returns EMPTY ARRAY on failure; matchingService uses keyword scoring instead.
     */
    async generateEmbeddings(text: string): Promise<number[]> {
        try {
            return await getEmbeddings(text);
        } catch (error) {
            console.warn('[aiService] Embeddings failed — keyword scoring will be used:', error);
            return [];
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