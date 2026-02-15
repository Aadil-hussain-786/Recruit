export const matchingService = {
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (normA * normB);
    },

    /**
     * Rank candidates based on semantic similarity to job requirements
     */
    rankCandidates(jobEmbedding: number[], candidatesWithEmbeddings: any[]): any[] {
        return candidatesWithEmbeddings
            .map(candidate => {
                if (!candidate.embedding) return { ...candidate, matchScore: 0 };
                const score = this.cosineSimilarity(jobEmbedding, candidate.embedding);
                return {
                    ...candidate,
                    matchScore: Math.round(score * 100)
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    },

    /**
     * Re-rank candidates to ensure diversity (Diversity-Aware Recommendations)
     * This is a simplified version that promotes high-potential candidates from varied backgrounds
     */
    diversifyRecommendations(rankedCandidates: any[]): any[] {
        // Logically, we would group by different factors and ensure top N contains variety.
        // For this demo, we'll ensure that the top 5 are not all from the same company or location if possible.
        const diversified: any[] = [];
        const seenCompanies = new Set();

        for (const candidate of rankedCandidates) {
            if (!seenCompanies.has(candidate.currentCompany) || diversified.length >= 5) {
                diversified.push(candidate);
                seenCompanies.add(candidate.currentCompany);
            } else {
                // Penalize slightly to move down but keep in list
                diversified.push({ ...candidate, matchScore: Math.max(0, candidate.matchScore - 5), biasedFlag: true });
            }
        }

        return diversified.sort((a, b) => b.matchScore - a.matchScore);
    }
};
