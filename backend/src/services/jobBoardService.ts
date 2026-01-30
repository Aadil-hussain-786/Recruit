import axios from 'axios';
import prisma from '../config/prisma';

export const jobBoardService = {
    /**
     * Distribute a job to external boards via webhooks
     */
    async publishToExternalBoards(jobId: string, organizationId: string): Promise<any> {
        const job = await prisma.job.findFirst({
            where: { id: jobId, organizationId },
        });

        if (!job) throw new Error('Job not found');

        // Fetch organization settings to get webhook URLs
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        const settings = org?.settings as any;
        const webhooks = settings?.jobWebhooks || [];

        const results = await Promise.all(webhooks.map(async (url: string) => {
            try {
                const response = await axios.post(url, {
                    event: 'job.published',
                    data: {
                        id: job.id,
                        title: job.title,
                        description: job.description,
                        organization: org?.name,
                    }
                });
                return { url, success: true, status: response.status };
            } catch (error: any) {
                console.error(`Failed to post to webhook ${url}:`, error.message);
                return { url, success: false, error: error.message };
            }
        }));

        return results;
    },

    /**
     * Track application source ROI (Placeholder)
     */
    async getChannelROI(organizationId: string): Promise<any> {
        // In a real app, we'd query applications and group by 'source'
        return [
            { source: 'LinkedIn', applicants: 45, hires: 2, cost: 500 },
            { source: 'Indeed', applicants: 30, hires: 1, cost: 300 },
            { source: 'Career Site', applicants: 120, hires: 5, cost: 0 },
        ];
    }
};
