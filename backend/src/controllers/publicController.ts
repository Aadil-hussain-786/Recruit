import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import { aiService } from '../services/aiService';
import mongoose from 'mongoose';

export const getPublicJob = async (req: Request, res: Response) => {
    try {
        const job = await Job.findById(req.params.id)
            .select('title description department location status organization');

        if (!job || job.status === 'draft') {
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

export const applyToJob = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const { firstName, lastName, email, phone, currentCompany, currentTitle, skills, expectedSalary, noticePeriod, location } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check if candidate already exists
        let candidate = await Candidate.findOne({ email, organization: job.organization });

        let resumeData: any = {};
        if ((req as any).file) {
            try {
                const text = await aiService.extractText((req as any).file.buffer, (req as any).file.mimetype);
                resumeData = await aiService.parseResume(text);
                console.log('Resume parsed successfully');
            } catch (resumeError) {
                console.error('Resume parsing failed:', resumeError);
            }
        }

        const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []);
        const profileText = `${firstName} ${lastName} ${skillsArray.join(' ')} ${currentTitle}`;

        let embedding: number[] = [];
        try {
            embedding = await aiService.generateEmbeddings(profileText);
        } catch (embeddingError) {
            console.error('Embedding generation failed:', embeddingError);
        }

        if (candidate) {
            // Update existing candidate
            candidate.firstName = firstName;
            candidate.lastName = lastName;
            candidate.phone = phone || candidate.phone;
            candidate.skills = skillsArray.length > 0 ? skillsArray : candidate.skills;
            candidate.embedding = embedding;
            // Merge resume analysis patterns if available
            if ((resumeData as any).patterns) {
                candidate.patterns = (resumeData as any).patterns;
            }
            await candidate.save();
        } else {
            // Create new candidate
            candidate = await Candidate.create({
                firstName,
                lastName,
                email,
                phone,
                currentCompany,
                currentTitle,
                skills: skillsArray,
                location,
                expectedSalary,
                noticePeriod,
                organization: job.organization,
                embedding,
                patterns: (resumeData as any).patterns,
                source: 'Public Job Board',
                createdBy: job.postedBy, // Assign to the person who posted the job
            });
        }

        // Create application
        const application = await Application.create({
            job: jobId,
            candidate: candidate._id,
            organization: job.organization,
            source: 'Public Job Board',
            stage: 'applied',
            status: 'active',
        });

        res.status(201).json({
            success: true,
            data: {
                applicationId: application._id,
                candidateId: candidate._id
            },
            message: 'Application submitted successfully'
        });
    } catch (error: any) {
        console.error('Application Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }
        res.status(500).json({ success: false, message: 'Error submitting application', error: error.message });
    }
};
