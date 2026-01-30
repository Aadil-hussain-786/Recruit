import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { JobStatus } from '@prisma/client';
import { aiService } from '../services/aiService';
import { matchingService } from '../services/matchingService';
import { jobBoardService } from '../services/jobBoardService';
import Candidate from '../models/Candidate';

// @desc    Publish job to external boards
// @route   POST /api/jobs/:id/publish
// @access  Private
export const publishJobToExternal = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const jobId = req.params.id as string;

        const results = await jobBoardService.publishToExternalBoards(jobId, organizationId);

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Publishing error', error: error.message });
    }
};

// @desc    Generate JD using AI
// @route   POST /api/jobs/generate-jd
// @access  Private
export const generateAIJD = async (req: Request, res: Response) => {
    try {
        const { role, seniority, keySkills, tone } = req.body;

        if (!role || !seniority || !keySkills) {
            return res.status(400).json({ success: false, message: 'Please provide role, seniority, and key skills' });
        }

        const jd = await aiService.generateJD(role, seniority, keySkills, tone);

        res.status(200).json({
            success: true,
            data: jd
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error generating JD', error: error.message });
    }
};

// @desc    Match candidates for a job
// @route   GET /api/jobs/:id/match
// @access  Private
export const matchCandidates = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const jobId = req.params.id as string;

        // Get the job and its embedding
        const job = await prisma.job.findFirst({
            where: { id: jobId, organizationId },
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (!job.embedding) {
            return res.status(400).json({ success: false, message: 'Job requirements have not been indexed for matching' });
        }

        // Get all candidates for the organization
        const candidates = await Candidate.find({ organization: organizationId });

        // Rank candidates
        const rankedCandidates = matchingService.rankCandidates(
            job.embedding as number[],
            candidates.map(c => c.toObject())
        );

        // Apply diversity-aware ranking
        const diversifiedCandidates = matchingService.diversifyRecommendations(rankedCandidates);

        // Optional: Perform bias analysis on the top match for extra insight
        let biasAnalysis = null;
        if (diversifiedCandidates.length > 0) {
            const topMatch = diversifiedCandidates[0];
            const profileSummary = `${topMatch.firstName} ${topMatch.lastName}\n${topMatch.currentTitle}\n${topMatch.skills?.join(', ')}`;
            biasAnalysis = await aiService.detectBias(profileSummary);
        }

        res.status(200).json({
            success: true,
            data: diversifiedCandidates,
            biasAnalysis
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Matching error', error: error.message });
    }
};

// @desc    Get all jobs for the organization
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const jobs = await prisma.job.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const { title, description, status } = req.body;

        // Generate embedding for the job description
        const embedding = await aiService.generateEmbeddings(`${title}\n${description}`);

        const job = await prisma.job.create({
            data: {
                title,
                description,
                status: (status as JobStatus) || 'DRAFT',
                organizationId,
                embedding: embedding as any,
            },
        });

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const job = await prisma.job.findFirst({
            where: {
                id: req.params.id as string,
                organizationId,
            },
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const { title, description, status } = req.body;

        // Ensure job belongs to org
        const job = await prisma.job.findFirst({
            where: {
                id: req.params.id as string,
                organizationId,
            },
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        // Regenerate embedding if title or description changed
        let embedding = job.embedding;
        if (title !== job.title || description !== job.description) {
            embedding = await aiService.generateEmbeddings(`${title}\n${description}`) as any;
        }

        const updatedJob = await prisma.job.update({
            where: { id: req.params.id as string },
            data: {
                title,
                description,
                status: status as JobStatus,
                embedding: embedding as any,
            },
        });

        res.status(200).json({
            success: true,
            data: updatedJob
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        // Ensure job belongs to org
        const job = await prisma.job.findFirst({
            where: {
                id: req.params.id as string,
                organizationId,
            },
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        await prisma.job.delete({
            where: { id: req.params.id as string },
        });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/jobs/stats
// @access  Private
export const getStats = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const totalJobs = await prisma.job.count({ where: { organizationId } });
        const publishedJobs = await prisma.job.count({ where: { organizationId, status: 'PUBLISHED' } });
        const draftJobs = await prisma.job.count({ where: { organizationId, status: 'DRAFT' } });

        // Get candidates count from MongoDB
        const totalCandidates = await Candidate.countDocuments({ organization: organizationId });

        res.status(200).json({
            success: true,
            data: {
                totalJobs,
                publishedJobs,
                draftJobs,
                totalCandidates,
                interviewPassRate: "0%",
                timeToHire: "N/A"
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
