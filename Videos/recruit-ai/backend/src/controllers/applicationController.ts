import { Request, Response } from 'express';
import prisma from '../config/prisma';

// @desc    Get all applications for the organization
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;

        const applications = await prisma.application.findMany({
            where: { organizationId },
            include: {
                job: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (usually Public, but for internal tracking we use Private for now)
export const createApplication = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;
        const { jobId, candidateId, stage } = req.body;

        // Ensure job exists and belongs to org
        const job = await prisma.job.findFirst({
            where: { id: jobId, organizationId },
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId,
                stage: stage || 'APPLIED',
                organizationId,
            },
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application stage (Kanban Drag & Drop)
// @route   PUT /api/applications/:id/stage
// @access  Private
export const updateApplicationStage = async (req: Request, res: Response) => {
    try {
        const organizationId = (req as any).user.organizationId;
        const { stage } = req.body;

        const application = await prisma.application.findFirst({
            where: { id: req.params.id as string, organizationId },
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
        }

        const updatedApplication = await prisma.application.update({
            where: { id: req.params.id as string },
            data: { stage: stage as any },
        });

        res.status(200).json({
            success: true,
            data: updatedApplication
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
