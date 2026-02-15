import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import { aiService } from '../services/aiService';
import { matchingService } from '../services/matchingService';
import { jobBoardService } from '../services/jobBoardService';

// @desc    Publish job to external boards
// @route   POST /api/jobs/:id/publish
// @access  Private
export const publishJobToExternal = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const jobId = req.params.id as string;

        // Verify job exists and belongs to organization
        const job = await Job.findOne({ _id: jobId, organization: organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const results = await jobBoardService.publishToExternalBoards(jobId, organizationId);

        // Update status to 'published' if successful
        const anySuccess = results && Array.isArray(results) && results.some((r: any) => r.success);
        if (anySuccess) {
            job.status = 'published';
            await job.save();
        }

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

        if (!role || !seniority || !keySkills || !Array.isArray(keySkills)) {
            return res.status(400).json({ success: false, message: 'Please provide role, seniority, and key skills (as an array)' });
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
        const job = await Job.findOne({ _id: jobId, organization: organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (!job.embedding || job.embedding.length === 0) {
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

        const jobs = await Job.find({ organization: organizationId }).sort({ createdAt: -1 });

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
        const userId = (req as any).user._id as string;
        const { title, description, status, department, location } = req.body;

        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        // Generate embedding for the job description
        let embedding: number[] = [];
        try {
            embedding = await aiService.generateEmbeddings(`${title}\n${description}`);
        } catch (embeddingError: any) {
            console.error('Embedding generation error:', embeddingError);
            // Non-fatal error for job creation, but log it
        }

        const job = await Job.create({
            title,
            description,
            department: department || 'Not Specified',
            location: location || 'Remote',
            status: status || 'draft',
            organization: organizationId,
            postedBy: userId,
            embedding,
        });

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error: any) {
        console.error('Job creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create job',
            error: error.message
        });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;
        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
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
        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        // Regenerate embedding if title or description changed
        const titleChanged = title && title !== job.title;
        const descriptionChanged = description && description !== job.description;

        if (titleChanged || descriptionChanged) {
            try {
                const combinedText = `${title || job.title}\n${description || job.description}`;
                req.body.embedding = await aiService.generateEmbeddings(combinedText);
            } catch (embeddingError: any) {
                console.error('Embedding generation error during update:', embeddingError);
            }
        }

        // Prevent illegal field updates
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.organization;
        delete updateData.postedBy;

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedJob
        });
    } catch (error: any) {
        console.error('Job update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update job',
            error: error.message
        });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId as string;

        const job = await Job.findOne({
            _id: req.params.id,
            organization: organizationId,
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        await Job.findByIdAndDelete(req.params.id);

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

        const totalJobs = await Job.countDocuments({ organization: organizationId });
        const publishedJobs = await Job.countDocuments({ organization: organizationId, status: { $in: ['active', 'published'] } });
        const draftJobs = await Job.countDocuments({ organization: organizationId, status: 'draft' });

        // Get candidates count
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
