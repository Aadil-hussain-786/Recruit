import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = "You are an expert recruitment coordinator. Write helpful, concise, and professional responses.";

        const userPrompt = `
            Candidate: ${candidateProfile.firstName} ${candidateProfile.lastName}
            Current Role: ${candidateProfile.currentTitle}
            Skills: ${candidateProfile.skills.join(', ')}
            
            Job Requirements: ${jobRequirements}
            
            Recruiter Context: ${context}
            
            Suggest a professional, warm, and engaging response to the candidate.
        `;

        const prompt = `${systemPrompt}\n\n${userPrompt}`;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text() || '';
        } catch (error) {
            console.error('Error generating response suggestion:', error);
            return '';
        }
    }
};
