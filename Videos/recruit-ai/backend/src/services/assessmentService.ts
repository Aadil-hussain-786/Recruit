import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const assessmentService = {
    /**
     * Generate assessment questions based on job requirements
     */
    async generateQuiz(role: string, skills: string[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<any> {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert technical interviewer. Generate a skills assessment quiz for the role: ${role}.
        Skills to assess: ${skills.join(', ')}
        Difficulty: ${difficulty}
        
        Create 10 questions in JSON format with the following structure:
        {
            "questions": [
                {
                    "id": 1,
                    "question": "Question text",
                    "type": "mcq",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": "A",
                    "difficulty": "medium",
                    "skill": "JavaScript"
                }
            ]
        }
        
        Mix question types: 70% MCQ, 20% True/False, 10% Short Answer.
        Only return valid JSON, no other text.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : '{"questions": []}');
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

        const score = Math.round((correct / questions.length) * 100);
        const skillBreakdown = this.calculateSkillBreakdown(results);

        return {
            score,
            totalQuestions: questions.length,
            correctAnswers: correct,
            skillBreakdown,
            results
        };
    },

    /**
     * Calculate skill-wise performance
     */
    calculateSkillBreakdown(results: any[]): any {
        const skillMap: any = {};

        results.forEach(r => {
            if (!skillMap[r.skill]) {
                skillMap[r.skill] = { total: 0, correct: 0 };
            }
            skillMap[r.skill].total++;
            if (r.isCorrect) skillMap[r.skill].correct++;
        });

        return Object.keys(skillMap).map(skill => ({
            skill,
            score: Math.round((skillMap[skill].correct / skillMap[skill].total) * 100),
            questionsAttempted: skillMap[skill].total
        }));
    }
};
