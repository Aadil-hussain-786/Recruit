import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import { aiService } from '../services/aiService';

// @desc    Upload and parse resume
// @route   POST /api/candidates/parse-resume
// @access  Private
export const parseResume = async (req: Request, res: Response) => {
    try {
        if (!(req as any).file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const text = await aiService.extractText((req as any).file.buffer, (req as any).file.mimetype);
        const parsedData = await aiService.parseResume(text);

        res.status(200).json({
            success: true,
            data: parsedData
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error parsing resume', error: error.message });
    }
};

// @desc    Get all candidates for the organization
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const candidates = await Candidate.find({ organization: organizationId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: candidates.length,
            data: candidates
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new candidate
export const createCandidate = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const userId = (req as any).user.id as string;

        // Generate embedding for candidate profile
        const profileText = `${req.body.firstName} ${req.body.lastName} ${req.body.skills?.join(' ')} ${req.body.currentTitle}`;
        const embedding = await aiService.generateEmbeddings(profileText);

        const candidateData = {
            ...req.body,
            organization: organizationId,
            createdBy: userId,
            embedding,
        };

        const candidate = await Candidate.create(candidateData);

        res.status(201).json({
            success: true,
            data: candidate
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single candidate
export const getCandidate = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const candidate = await Candidate.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        res.status(200).json({
            success: true,
            data: candidate
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update candidate
export const updateCandidate = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        let candidate = await Candidate.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found or unauthorized' });
        }

        // Regenerate embedding if key fields changed
        if (req.body.skills || req.body.currentTitle || req.body.firstName || req.body.lastName) {
            const profileText = `${req.body.firstName || candidate.firstName} ${req.body.lastName || candidate.lastName} ${(req.body.skills || candidate.skills)?.join(' ')} ${req.body.currentTitle || candidate.currentTitle}`;
            req.body.embedding = await aiService.generateEmbeddings(profileText);
        }

        candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: candidate
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
export const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const candidate = await Candidate.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found or unauthorized' });
        }

        await Candidate.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
