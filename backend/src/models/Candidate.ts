import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentCompany?: string;
    currentTitle?: string;
    totalExperience?: number; // months
    skills: string[];
    resumeUrl?: string;
    linkedInUrl?: string;
    source: string;
    status: 'new' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected';
    location?: {
        city: string;
        country: string;
    };
    expectedSalary?: number;
    noticePeriod?: string;
    parsedData?: any;
    embedding?: number[];
    patterns?: {
        technicalAptitude: number;
        leadershipPotential: number;
        culturalAlignment: number;
        creativity: number;
        confidence: number;
        notes: string[];
        biasAnalysis?: {
            score: number;
            findings: string[];
            suggestions: string[];
        };
        interviewScript?: {
            question: string;
            answer: string;
        }[];
    };
    createdBy: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, index: true },
        phone: String,
        currentCompany: String,
        currentTitle: String,
        totalExperience: Number,
        skills: [String],
        resumeUrl: String,
        linkedInUrl: String,
        source: String,
        status: {
            type: String,
            enum: ['new', 'screening', 'interviewing', 'offered', 'hired', 'rejected'],
            default: 'new',
        },
        location: {
            city: String,
            country: String,
        },
        expectedSalary: Number,
        noticePeriod: String,
        parsedData: Object,
        embedding: { type: [Number], default: [] },
        patterns: {
            technicalAptitude: { type: Number, default: 0 },
            leadershipPotential: { type: Number, default: 0 },
            culturalAlignment: { type: Number, default: 0 },
            creativity: { type: Number, default: 0 },
            confidence: { type: Number, default: 0 },
            notes: [String],
            biasAnalysis: {
                score: { type: Number, default: 100 },
                findings: [String],
                suggestions: [String]
            },
            interviewScript: [
                {
                    question: String,
                    answer: String
                }
            ]
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
