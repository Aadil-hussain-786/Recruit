import { callOpenRouter } from './aiWrapper';

export const chatbotService = {
    /**
     * Generate AI interview response using OpenRouter
     */
    async generateResponse(userMessage: string, context: any = {}, history: any[] = []): Promise<string> {
        const isInterview = context?.type === 'interview';
        const language = process.env.INTERVIEW_LANGUAGE || 'English';

        const systemPrompt = isInterview
            ? `You are the NEURAL RECRUITER V3, an elite AI specialized in identifying the top 1% of technical talent. 
        
        Your persona: Sharp, observant, slightly demanding, but professionally encouraging.
        
        CRITICAL OPERATING CORE:
        1. CHALLENGE CONTRADICTIONS: If a candidate says they know "expert-level React" but fails to explain Reconciliation, pivot immediately to challenge that claim.
        2. NO BUFFERING: Do not say "That's interesting" or "I see". Dive straight into the next technical layer.
        3. DYNAMIC DIFFICULTY: If the candidate answers easily, increase the abstraction level. Ask 'Why' instead of 'How'.
        4. BUZZWORD DETECTION: If the candidate uses fancy terms without substance, ask them to explain the underlying mechanism.
        5. CONTEXTUAL MEMORY: Reference their previous answers (e.g., "Earlier you mentioned X, how does that relate to Y?").
        
        Language: ${language}
        Response Style: Under 3 sentences. No fluff. High technical density.`
            : `You are RecruitAI Intelligence. Provide high-density, accurate assistance regarding recruitment workflows in ${language}.`;

        try {
            // Build the message payload with history
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            return await callOpenRouter(messages);
        } catch (error: any) {
            console.error('Chatbot service error:', error.message);
            throw error;
        }
    },

    /**
     * Determine if query should be escalated to human recruiter
     */
    shouldEscalate(userMessage: string): boolean {
        const escalationKeywords = ['speak to recruiter', 'talk to human', 'urgent', 'legal'];
        return escalationKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    },

    /**
     * FAQ automation
     */
    getFAQ(question: string, context?: any): string | null {
        if (context?.type === 'interview') return null;
        const faqs: any = {
            'application status': 'Check your dashboard for real-time updates.',
            'interview process': 'Typical flow: Screening -> Technical -> Team -> Final.',
        };
        for (const [key, value] of Object.entries(faqs)) {
            if (question.toLowerCase().includes(key)) return value as string;
        }
        return null;
    },

    /**
     * Analyze interview transcript
     */
    async analyzeInterview(transcript: string): Promise<any> {
        // Validate transcript length to prevent "fake" scoring on empty sessions
        const cleanTranscript = transcript.replace(/ASSISTANT:.*?\n/g, '').trim(); // Remove AI questions for length check
        const wordCount = cleanTranscript.split(/\s+/).length;

        if (wordCount < 10 || transcript.length < 150) {
            return {
                status: 'insufficient_data',
                technicalAptitude: 0,
                leadershipPotential: 0,
                culturalAlignment: 0,
                creativity: 0,
                confidence: 0,
                summary: "Interview session too short for meaningful neural pattern extraction. The candidate provided limited responses.",
                biasAnalysis: { score: 100, findings: ["N/A - Insufficient data"], suggestions: [] },
                interviewScript: []
            };
        }

        const prompt = `Conduct a Psychometric and Technical Pattern Analysis on the following transcript.
        
        Your goal is to reconstruct the "Candidate Archetype" and identify "Hidden Risks".
        
        SCORING DIRECTIVES (0-100):
        1. technicalAptitude: Score 90+ only if they explained architectural trade-offs, not just syntax.
        2. leadershipPotential: Look for "we" vs "I", mentorship stories, and conflict resolution logic.
        3. culturalAlignment: Do they value speed, quality, or ego?
        4. creativity: Scale of 0-100 on how they handle "what if" scenarios.
        5. confidence: Differentiate between "vague arrogance" and "humble expertise".
        
        EXTRACT:
        6. summary: A high-level executive briefing. Start with "Candidate exhibits [Archetype]...". Focus on the DELTA between what they claimed and what they proved.
        7. biasAnalysis: Analyze the AI's own questions for leading prompts or gender/cultural assumptions.
        8. interviewScript: Clean pairs of Question/Answer.
        
        Transcript:
        ${transcript}
        
        RETURN ONLY VALID JSON.`;

        try {
            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are an expert HR Psychometric Analyst. Return JSON only.' },
                { role: 'user', content: prompt }
            ], undefined, { timeout: 60000 }); // Increased timeout for deep analysis

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('[Analysis Engine] Regex failed to find JSON in:', responseText.substring(0, 500));
                throw new Error('NO_JSON_FOUND');
            }

            let analysis;
            try {
                analysis = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('[Analysis Engine] JSON.parse failed on:', jsonMatch[0]);
                throw e;
            }

            return {
                technicalAptitude: analysis.technicalAptitude ?? 50,
                leadershipPotential: analysis.leadershipPotential ?? 50,
                culturalAlignment: analysis.culturalAlignment ?? 50,
                creativity: analysis.creativity ?? 50,
                confidence: analysis.confidence ?? 50,
                summary: analysis.summary || "Interview completed. Archetype analysis pending.",
                biasAnalysis: analysis.biasAnalysis || { score: 100, findings: [], suggestions: [] },
                interviewScript: analysis.interviewScript || [],
                status: 'success'
            };
        } catch (error: any) {
            console.error('[Analysis Engine] Failed:', error.message);
            return {
                status: 'error',
                technicalAptitude: 0,
                leadershipPotential: 0,
                culturalAlignment: 0,
                creativity: 0,
                confidence: 0,
                summary: `Analysis engine offline (${error.message || 'Network Sync Error'}). Manual review required.`,
                biasAnalysis: { score: 100, findings: ["Analysis failed during pattern extraction"], suggestions: [] },
                interviewScript: []
            };
        }
    }
};
