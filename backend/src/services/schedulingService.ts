import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';

export const schedulingService = {
    /**
     * Create a scheduling link for an application
     */
    async createSchedulingLink(applicationId: string, organizationId: string): Promise<string> {
        const linkId = uuidv4();

        // In a real app, we'd store this in a 'SchedulingLink' table
        // For now, we'll simulate by returning a unique URL
        return `https://recruit-ai.com/schedule/${linkId}`;
    },

    /**
     * Get available slots based on interviewer calendar (Mock)
     */
    async getAvailableSlots(interviewerId: string): Promise<any> {
        // Mocking availability for the next 3 days
        const now = new Date();
        const slots = [];

        for (let i = 1; i <= 3; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            date.setHours(10, 0, 0, 0);
            slots.push(new Date(date));

            date.setHours(14, 0, 0, 0);
            slots.push(new Date(date));
        }

        return slots;
    },

    /**
     * Confirm a slot and create an Interview record
     */
    async confirmInterview(applicationId: string, interviewerId: string, slot: Date, organizationId: string): Promise<any> {
        const interview = await prisma.interview.create({
            data: {
                applicationId,
                interviewerId,
                organizationId,
                scheduledAt: slot,
                duration: 45, // Default 45 mins
                status: 'SCHEDULED',
                meetingLink: 'https://meet.google.com/mock-link',
            }
        });

        return interview;
    }
};
