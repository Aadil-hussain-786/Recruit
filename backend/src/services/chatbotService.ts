import { openai } from './aiService';

export const chatbotService = {
    /**
     * Generate chatbot response based on candidate query
     */
    async generateResponse(userMessage: string, context: any = {}): Promise<string> {
        const systemPrompt = `You are RecruitAI's helpful assistant. You help candidates with their application queries.
        
        Common topics:
        - Application status updates
        - Interview scheduling
        - Company information
        - Next steps in the hiring process
        - General recruitment questions
        
        Context: ${JSON.stringify(context)}
        
        Be professional, friendly, and concise. If you don't have specific information, acknowledge this and suggest contacting the recruiter directly.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 300
        });

        return response.choices[0].message.content || "I'm sorry, I couldn't process that. Please contact our support team.";
    },

    /**
     * Determine if query should be escalated to human recruiter
     */
    shouldEscalate(userMessage: string): boolean {
        const escalationKeywords = [
            'speak to recruiter',
            'talk to human',
            'complaint',
            'urgent',
            'discrimination',
            'legal',
            'salary negotiation'
        ];

        return escalationKeywords.some(keyword =>
            userMessage.toLowerCase().includes(keyword)
        );
    },

    /**
     * FAQ automation - get predefined answers
     */
    getFAQ(question: string): string | null {
        const faqs: any = {
            'application status': 'You can check your application status in your candidate dashboard. If your application is being reviewed, you\'ll receive an update within 5-7 business days.',
            'interview process': 'Our typical interview process includes: 1) Initial screening, 2) Technical assessment, 3) Team interview, 4) Final round with leadership.',
            'timeline': 'The average hiring timeline is 2-4 weeks from application to offer. This may vary based on the role and team availability.',
            'benefits': 'We offer competitive benefits including health insurance, PTO, remote work options, and professional development allowances. Specific details will be shared during the offer stage.'
        };

        for (const [key, value] of Object.entries(faqs)) {
            if (question.toLowerCase().includes(key)) {
                return value as string;
            }
        }

        return null;
    }
};
