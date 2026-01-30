import { Request, Response } from 'express';
import { chatbotService } from '../services/chatbotService';

// @desc    Get chatbot response
// @route   POST /api/chatbot/message
// @access  Public (Candidate access)
export const getChatbotResponse = async (req: Request, res: Response) => {
    try {
        const { message, candidateId, applicationId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Check FAQ first for faster response
        const faqAnswer = chatbotService.getFAQ(message);
        if (faqAnswer) {
            return res.status(200).json({
                success: true,
                data: {
                    response: faqAnswer,
                    source: 'faq',
                    shouldEscalate: false
                }
            });
        }

        // Check if should escalate
        const shouldEscalate = chatbotService.shouldEscalate(message);

        if (shouldEscalate) {
            return res.status(200).json({
                success: true,
                data: {
                    response: "I understand this is important. I've notified our recruitment team and someone will reach out to you within 24 hours. Is there anything else I can help with in the meantime?",
                    source: 'escalation',
                    shouldEscalate: true
                }
            });
        }

        // Generate AI response
        const context = {
            candidateId,
            applicationId,
            timestamp: new Date().toISOString()
        };

        const aiResponse = await chatbotService.generateResponse(message, context);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse,
                source: 'ai',
                shouldEscalate: false
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Sorry, I encountered an error. Please try again or contact support.',
            error: error.message
        });
    }
};
