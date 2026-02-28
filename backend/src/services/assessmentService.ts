import { callOpenRouter } from './aiWrapper';

export const assessmentService = {
    /**
     * Generate assessment questions using OpenRouter
     */
    async generateQuiz(role: string, skills: string[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<any> {
        const prompt = `Generate a skills assessment quiz for: ${role}.
        Skills: ${skills.join(', ')}
        Difficulty: ${difficulty}
        
        Create 10 questions in JSON: { "questions": [{ "id", "question", "type", "options", "correctAnswer", "difficulty", "skill" }] }
        Return JSON only.`;

        try {
            const responseText = await callOpenRouter([
                { role: 'system', content: 'You are an expert technical interviewer. Return JSON only.' },
                { role: 'user', content: prompt }
            ]);

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : '{"questions": []}');
        } catch (error) {
            console.error('Error generating quiz:', error);
            return { questions: [] };
        }
    },

    /**
     * Auto-grade candidate responses
     */
    gradeAssessment(questions: any[], candidateAnswers: any[]): any {
        let correct = 0;
        const results = questions.map((q, index) => {
            const candidateAnswer = candidateAnswers[index];
            const isCorrect = q.correctAnswer === candidateAnswer;
            if (isCorrect) correct++;

            return {
                questionId: q.id,
                question: q.question,
                candidateAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                skill: q.skill
            };
        });

        const score = Math.round((correct / (questions.length || 1)) * 100);

        return {
            score,
            totalQuestions: questions.length,
            correctAnswers: correct,
            results
        };
    }
};
