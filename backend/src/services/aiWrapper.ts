import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Use a robust model as default, override via .env if needed
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

const FALLBACK_MODELS = [
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.1-8b-instruct:free',
];

/**
 * Shared utility to call OpenRouter API
 */
export async function callOpenRouter(messages: any[], model: string = DEFAULT_MODEL, options: any = {}) {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_KEY_HERE') {
        throw new Error('MISSING_API_KEY');
    }

    const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
        try {
            console.log(`[OpenRouter] Attempting request. Model: ${currentModel}, Messages: ${messages.length}`);
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                console.log(`[OpenRouter] Last message: "${String(lastMsg.content).substring(0, 50)}..."`);
            }

            const response = await axios.post(
                OPENROUTER_URL,
                {
                    model: currentModel,
                    messages: messages,
                    temperature: options.temperature ?? 0.7,
                    ...options
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'RecruitAI',
                        'Content-Type': 'application/json',
                    },
                    timeout: options.timeout || 30000,
                }
            );

            let content = response.data.choices[0].message.content;

            // Strip thinking tags if present
            if (typeof content === 'string') {
                content = content.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
                content = content.replace(/thought:[\s\S]*?\n\n/gi, '').trim();
            }

            console.log(`[OpenRouter] Received response from ${currentModel} (${typeof content === 'string' ? content.length : 'JSON'} chars)`);
            return content;

        } catch (error: any) {
            lastError = error;
            const statusCode = error.response?.status;

            // If it's a quota error, model not found, or invalid model, try the next one
            if (statusCode === 429 || statusCode === 404 || statusCode === 503 || statusCode === 400) {
                console.warn(`[OpenRouter] ${currentModel} failed with status ${statusCode}. Trying fallback in 1s...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // For other errors (like 401 Unauthorized), throw immediately
            console.error(`[OpenRouter] Request failed for ${currentModel}:`, error.response?.data || error.message);
            if (statusCode === 401) throw new Error('EXPIRED_API_KEY');
            throw error;
        }
    }

    // If we've exhausted all models
    if (lastError?.response?.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
    }
    throw lastError;
}

/**
 * Shared utility to call OpenRouter API for embeddings
 */
export async function getEmbeddings(text: string, model: string = 'openai/text-embedding-3-small') {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_KEY_HERE') {
        throw new Error('MISSING_API_KEY');
    }

    try {
        console.log(`[OpenRouter] Requesting embeddings. Model: ${model}`);
        const response = await axios.post(
            'https://openrouter.ai/api/v1/embeddings',
            {
                model: model,
                input: text,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'RecruitAI',
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        return response.data.data[0].embedding;
    } catch (error: any) {
        console.error('OpenRouter Embeddings Error:', error.response?.data || error.message);
        // Return a zeroed fallback instead of crashing if possible, or rethrow
        throw error;
    }
}
