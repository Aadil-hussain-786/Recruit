import { aiService } from './aiService';

export const communicationService = {
    /**
     * Send email to candidate (Placeholder)
     */
    async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
        console.log(`Sending email to ${to}: ${subject}`);
        // Integration with SendGrid/Nodemailer would go here
        return true;
    },

    /**
     * Send WhatsApp/SMS via Twilio (Placeholder)
     */
    async sendSMS(to: string, message: string): Promise<boolean> {
        console.log(`Sending SMS to ${to}: ${message}`);
        // Integration with Twilio would go here
        return true;
    },

    /**
     * Generate AI response suggestion for a candidate message
     */
    async suggestResponse(candidateProfile: any, jobRequirements: string, context: string): Promise<string> {
        const prompt = `
            Candidate: ${candidateProfile.firstName} ${candidateProfile.lastName}
            Current Role: ${candidateProfile.currentTitle}
            Skills: ${candidateProfile.skills.join(', ')}
            
            Job Requirements: ${jobRequirements}
            
            Recruiter Context: ${context}
            
            Suggest a professional, warm, and engaging response to the candidate.
        `;

        // We use aiService to call GPT
        const response = await (aiService as any).openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert recruitment coordinator. Write helpful, concise, and professional responses." },
                { role: "user", content: prompt }
            ]
        });

        return response.choices[0].message.content || '';
    }
};
