import { Request, Response } from 'express';
import { chatbotService } from '../services/chatbotService';
import Candidate from '../models/Candidate';

// @desc    Get chatbot response
// @route   POST /api/chatbot/message
// @access  Public (Candidate access)
export const getChatbotResponse = async (req: Request, res: Response) => {
    try {
        const { message, history, candidateId, applicationId, context: reqContext } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Build context object - pass through context from frontend (e.g. interview type)
        const context = {
            candidateId,
            applicationId,
            timestamp: new Date().toISOString(),
            ...(reqContext || {})
        };

        // Check FAQ first for faster response (skipped during interviews)
        const faqAnswer = chatbotService.getFAQ(message, context);
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
        const aiResponse = await chatbotService.generateResponse(message, context, history);

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse,
                source: 'ai',
                shouldEscalate: false
            }
        });
    } catch (error: any) {
        console.error('Chatbot controller error:', error?.message || error);

        // Handle expired or missing API key
        if (error?.message === 'EXPIRED_API_KEY' || error?.message === 'MISSING_API_KEY') {
            return res.status(200).json({
                success: true,
                data: {
                    response: "I'm having trouble connecting to my neural network. Please update your OPENROUTER_API_KEY in the backend/.env file to continue.",
                    source: 'fallback',
                    shouldEscalate: false
                }
            });
        }

        // Handle quota exceeded error gracefully
        if (error?.message === 'QUOTA_EXCEEDED') {
            return res.status(200).json({
                success: true,
                data: {
                    response: "Neural bandwidth exceeded. I'm currently processing a high volume of assessments. Please wait a moment before your next entry, or continue typing and I'll catch up.",
                    source: 'fallback',
                    shouldEscalate: false
                }
            });
        }

        // Handle model not found
        if (error?.message === 'MODEL_NOT_FOUND') {
            return res.status(200).json({
                success: true,
                data: {
                    response: "There was a temporary AI configuration issue. Please continue — I'll note your response and we'll review it.",
                    source: 'fallback',
                    shouldEscalate: false
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Sorry, I encountered an error. Please try again.',
            error: error.message
        });
    }
};

// @desc    Complete interview and analyze patterns
// @route   POST /api/chatbot/complete-interview
// @access  Public
export const completeInterview = async (req: Request, res: Response) => {
    try {
        const { candidateId, transcript, rawQA } = req.body;

        if (!candidateId || !transcript) {
            return res.status(400).json({ success: false, message: 'Candidate ID and transcript are required' });
        }

        const analysis = await chatbotService.analyzeInterview(transcript);

        // If the frontend sent real-time captured Q&A pairs, use those directly
        // (100% accurate — no AI re-extraction). Fall back to AI-extracted pairs.
        const interviewScript = (Array.isArray(rawQA) && rawQA.length > 0)
            ? rawQA
            : (analysis.interviewScript || []);

        if (analysis) {
            // Validate candidateId format before query to prevent CastError 500
            const isValidId = /^[0-9a-fA-F]{24}$/.test(candidateId);

            if (isValidId) {
                try {
                    const candidate = await Candidate.findById(candidateId);
                    if (candidate) {
                        // Ensure patterns object exists
                        if (!candidate.patterns) {
                            candidate.patterns = {
                                technicalAptitude: 0,
                                leadershipPotential: 0,
                                culturalAlignment: 0,
                                creativity: 0,
                                confidence: 0,
                                notes: [],
                                biasAnalysis: { score: 100, findings: [], suggestions: [] },
                                interviewScript: []
                            };
                        }

                        // Merge with existing patterns - using safe defaults
                        candidate.patterns = {
                            technicalAptitude: Math.round(((candidate.patterns.technicalAptitude || 0) + (analysis.technicalAptitude || 0)) / 2),
                            leadershipPotential: Math.round(((candidate.patterns.leadershipPotential || 0) + (analysis.leadershipPotential || 0)) / 2),
                            culturalAlignment: Math.round(((candidate.patterns.culturalAlignment || 0) + (analysis.culturalAlignment || 0)) / 2),
                            creativity: Math.round(((candidate.patterns.creativity || 0) + (analysis.creativity || 0)) / 2),
                            confidence: analysis.confidence || candidate.patterns.confidence || 0,
                            notes: [...(Array.isArray(candidate.patterns.notes) ? candidate.patterns.notes : []), analysis.summary].filter(Boolean),
                            biasAnalysis: analysis.biasAnalysis || candidate.patterns.biasAnalysis,
                            interviewScript: interviewScript // exact Q&A pairs
                        };
                        await candidate.save();
                    }
                } catch (dbError: any) {
                    console.error('[DB Update] Pattern merge failed:', dbError.message);
                    // Don't throw - still return analysis to user even if DB save fails
                }
            } else {
                console.warn('[DB Update] Invalid candidateId format skipped:', candidateId);
            }
        }

        // Attach the final interviewScript to the response so frontend can display it
        analysis.interviewScript = interviewScript;

        res.status(200).json({
            success: true,
            data: analysis,
            message: 'Interview analysis completed'
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error analyzing interview', error: error.message });
    }
};

