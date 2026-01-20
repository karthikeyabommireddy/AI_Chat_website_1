/**
 * AI Provider Service
 * Provider-agnostic AI integration layer
 * Supports: OpenAI, Anthropic (Claude), Google (Gemini), DeepSeek
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AI_PROVIDERS } = require('../config/constants');
const logger = require('../config/logger');

/**
 * Base AI Provider Interface
 */
class AIProvider {
  constructor(config) {
    this.config = config;
  }

  async generateResponse(messages, systemPrompt) {
    throw new Error('Method not implemented');
  }
}

/**
 * OpenAI Provider
 */
class OpenAIProvider extends AIProvider {
  constructor() {
    super({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
    });
    this.client = new OpenAI({ apiKey: this.config.apiKey });
  }

  async generateResponse(messages, systemPrompt) {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ],
      max_tokens: 2048,
      temperature: 0.7
    });

    const responseTime = Date.now() - startTime;

    return {
      content: response.choices[0].message.content,
      metadata: {
        model: this.config.model,
        provider: AI_PROVIDERS.OPENAI,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        responseTime
      }
    };
  }
}

/**
 * Anthropic (Claude) Provider
 */
class AnthropicProvider extends AIProvider {
  constructor() {
    super({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229'
    });
    this.client = new Anthropic({ apiKey: this.config.apiKey });
  }

  async generateResponse(messages, systemPrompt) {
    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    });

    const responseTime = Date.now() - startTime;

    return {
      content: response.content[0].text,
      metadata: {
        model: this.config.model,
        provider: AI_PROVIDERS.ANTHROPIC,
        tokensUsed: {
          prompt: response.usage?.input_tokens || 0,
          completion: response.usage?.output_tokens || 0,
          total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        responseTime
      }
    };
  }
}

/**
 * Google (Gemini) Provider
 */
class GoogleProvider extends AIProvider {
  constructor() {
    super({
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL || 'gemini-pro'
    });
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
  }

  async generateResponse(messages, systemPrompt) {
    const startTime = Date.now();

    const model = this.genAI.getGenerativeModel({ model: this.config.model });

    // Build chat history
    const history = messages.slice(0, -1).map(m => ({
      role: m.type === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    });

    // Send the latest message with system context
    const lastMessage = messages[messages.length - 1];
    const prompt = systemPrompt 
      ? `${systemPrompt}\n\nUser: ${lastMessage.content}`
      : lastMessage.content;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    const responseTime = Date.now() - startTime;

    return {
      content: response.text(),
      metadata: {
        model: this.config.model,
        provider: AI_PROVIDERS.GOOGLE,
        tokensUsed: {
          prompt: 0,
          completion: 0,
          total: 0
        },
        responseTime
      }
    };
  }
}

/**
 * DeepSeek Provider (OpenAI-compatible API)
 */
class DeepSeekProvider extends AIProvider {
  constructor() {
    super({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    });
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL
    });
  }

  async generateResponse(messages, systemPrompt) {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ],
      max_tokens: 2048,
      temperature: 0.7
    });

    const responseTime = Date.now() - startTime;

    return {
      content: response.choices[0].message.content,
      metadata: {
        model: this.config.model,
        provider: AI_PROVIDERS.DEEPSEEK,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        responseTime
      }
    };
  }
}

/**
 * AI Service Factory
 * Creates and manages AI provider instances
 */
class AIService {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    const provider = process.env.AI_PROVIDER || AI_PROVIDERS.OPENAI;

    try {
      switch (provider) {
        case AI_PROVIDERS.OPENAI:
          if (process.env.OPENAI_API_KEY) {
            this.providers.set(AI_PROVIDERS.OPENAI, new OpenAIProvider());
            this.defaultProvider = AI_PROVIDERS.OPENAI;
          }
          break;
        case AI_PROVIDERS.ANTHROPIC:
          if (process.env.ANTHROPIC_API_KEY) {
            this.providers.set(AI_PROVIDERS.ANTHROPIC, new AnthropicProvider());
            this.defaultProvider = AI_PROVIDERS.ANTHROPIC;
          }
          break;
        case AI_PROVIDERS.GOOGLE:
          if (process.env.GOOGLE_API_KEY) {
            this.providers.set(AI_PROVIDERS.GOOGLE, new GoogleProvider());
            this.defaultProvider = AI_PROVIDERS.GOOGLE;
          }
          break;
        case AI_PROVIDERS.DEEPSEEK:
          if (process.env.DEEPSEEK_API_KEY) {
            this.providers.set(AI_PROVIDERS.DEEPSEEK, new DeepSeekProvider());
            this.defaultProvider = AI_PROVIDERS.DEEPSEEK;
          }
          break;
      }

      logger.info(`AI Service initialized with provider: ${this.defaultProvider}`);
    } catch (error) {
      logger.error('Failed to initialize AI provider:', error);
    }
  }

  getProvider(providerName) {
    return this.providers.get(providerName) || this.providers.get(this.defaultProvider);
  }

  async generateResponse(messages, systemPrompt, providerName = null) {
    const provider = this.getProvider(providerName);

    if (!provider) {
      throw new Error('No AI provider available. Please configure API keys.');
    }

    try {
      return await provider.generateResponse(messages, systemPrompt);
    } catch (error) {
      logger.error(`AI generation error (${provider.constructor.name}):`, error);
      throw error;
    }
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context) {
    const { documents, faqs, companyName = 'AI Support' } = context;

    let prompt = `You are a helpful customer support AI assistant for ${companyName}. Your role is to assist customers with their questions and concerns in a friendly, professional manner.

IMPORTANT GUIDELINES:
1. ONLY answer questions based on the provided context below
2. If the answer is not in the context, politely say you don't have that information and suggest contacting human support
3. Be concise but thorough in your responses
4. Use a friendly, professional tone
5. If asked about topics outside customer support, politely redirect to relevant topics
6. Never make up information that's not in the provided context
7. Format responses clearly with bullet points or numbered lists when appropriate

CONTACT INFORMATION FOR HUMAN SUPPORT:
* Email at karthikeya.reddy.2201@gmail.com or karthikeya1111reddy@gmail.com
* Phone at +91 7095226951

`;

    // Add document context
    if (documents && documents.length > 0) {
      prompt += `\n--- COMPANY DOCUMENTATION ---\n`;
      documents.forEach((doc, index) => {
        prompt += `\n[Document ${index + 1}: ${doc.title}]\n${doc.content.raw?.substring(0, 3000) || ''}\n`;
      });
    }

    // Add FAQ context
    if (faqs && faqs.length > 0) {
      prompt += `\n--- FREQUENTLY ASKED QUESTIONS ---\n`;
      faqs.forEach((faq, index) => {
        prompt += `\nQ${index + 1}: ${faq.question}\nA: ${faq.answer}\n`;
      });
    }

    prompt += `\n--- END OF CONTEXT ---\n\nNow, please help the customer with their question based ONLY on the information provided above.`;

    return prompt;
  }
}

module.exports = new AIService();
