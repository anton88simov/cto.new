import axios, { AxiosInstance } from 'axios';

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  tokens?: number;
  model: string;
}

export class AIService {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.apiUrl = process.env.AI_API_URL || 'http://localhost:8000';
    this.apiKey = process.env.AI_API_KEY || '';
    this.defaultModel = process.env.AI_DEFAULT_MODEL || 'gpt-3.5-turbo';

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 60000,
    });
  }

  updateConfig(config: { apiUrl?: string; apiKey?: string; defaultModel?: string }) {
    if (config.apiUrl) this.apiUrl = config.apiUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.defaultModel) this.defaultModel = config.defaultModel;

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 60000,
    });
  }

  async getCompletion(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await this.client.post('/v1/ai/completions', {
        model: request.model || this.defaultModel,
        prompt: request.prompt,
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.2,
        stream: false,
      });

      return {
        text: response.data.text || response.data.choices?.[0]?.text || '',
        tokens: response.data.tokens || response.data.usage?.total_tokens,
        model: response.data.model || request.model || this.defaultModel,
      };
    } catch (error) {
      console.error('AI API error:', error);
      throw new Error(`AI API error: ${error}`);
    }
  }

  async streamCompletion(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await this.client.post(
        '/v1/ai/completions',
        {
          model: request.model || this.defaultModel,
          prompt: request.prompt,
          max_tokens: request.maxTokens || 1024,
          temperature: request.temperature ?? 0.2,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        const lines = text.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.text || parsed.text || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      });

      response.data.on('end', () => {
        console.log('Stream completed');
      });

      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        throw error;
      });
    } catch (error) {
      console.error('AI streaming error:', error);
      throw new Error(`AI streaming error: ${error}`);
    }
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const prompt = `Analyze the following ${language} code and provide insights:\n\n${code}`;
    const response = await this.getCompletion({ prompt });
    return response.text;
  }

  async generateCode(description: string, language: string): Promise<string> {
    const prompt = `Generate ${language} code for the following requirement:\n\n${description}`;
    const response = await this.getCompletion({ prompt });
    return response.text;
  }

  async refactorCode(code: string, instruction: string, language: string): Promise<string> {
    const prompt = `Refactor the following ${language} code according to this instruction: ${instruction}\n\nCode:\n${code}`;
    const response = await this.getCompletion({ prompt });
    return response.text;
  }

  async fixBug(code: string, error: string, language: string): Promise<string> {
    const prompt = `Fix the bug in the following ${language} code. Error: ${error}\n\nCode:\n${code}`;
    const response = await this.getCompletion({ prompt });
    return response.text;
  }
}
