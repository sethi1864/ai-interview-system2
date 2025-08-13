const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.gemini = null;
    this.openai = null;
    this.conversationMemory = new Map();
    
    // Initialize Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        logger.ai('Gemini API initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Gemini API:', error);
      }
    }
    
    // Initialize OpenAI API (if available)
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const OpenAI = require('openai');
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        logger.ai('OpenAI API initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize OpenAI API:', error);
      }
    }
  }

  // AI Configuration
  aiConfig = {
    model: 'gemini-1.5-flash', // Use Gemini as primary
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: `You are Sarah, an experienced HR interviewer with 8 years of experience in technical recruitment. 
                   Conduct natural, professional interviews with intelligent follow-up questions.
                   Be friendly but maintain professional boundaries.
                   NEVER reveal you're an AI - always act as a real human interviewer.
                   Ask specific, relevant questions based on candidate responses.
                   Show genuine interest and engagement.
                   Use natural speech patterns with occasional "um", "well", "you know".
                   Keep responses conversational and human-like.`
  };

  // Question Bank
  questionBank = {
    introduction: [
      "Tell me a bit about yourself and your background.",
      "What interests you about this position?",
      "What are your career goals for the next few years?"
    ],
    technical: [
      "Can you walk me through a challenging technical problem you solved?",
      "What technologies are you most comfortable with?",
      "How do you stay updated with the latest industry trends?",
      "Describe a project where you had to learn a new technology quickly."
    ],
    behavioral: [
      "Tell me about a time you had to work with a difficult team member.",
      "How do you handle tight deadlines and pressure?",
      "Describe a situation where you had to make a difficult decision.",
      "What's your approach to mentoring junior developers?"
    ],
    situational: [
      "If you discovered a critical bug in production, what would you do?",
      "How would you handle a disagreement with your manager about a technical decision?",
      "What would you do if a project was falling behind schedule?"
    ],
    closing: [
      "Do you have any questions for me about the role or company?",
      "What would be your ideal work environment?",
      "Is there anything else you'd like me to know about you?"
    ]
  };

  async generateWelcomeMessage(candidateInfo) {
    try {
      const prompt = `Generate a warm, professional welcome message for an interview with ${candidateInfo.name} who is applying for the position of ${candidateInfo.position}. 
                     Keep it natural and conversational, as if you're a real HR professional named Sarah. 
                     Mention their name and the position they're applying for. 
                     Keep it under 100 words.`;

      if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: this.aiConfig.model });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7
        });
        return completion.choices[0].message.content;
      } else {
        // Fallback welcome message
        return `Hello ${candidateInfo.name}! I'm Sarah, and I'll be conducting your interview today for the ${candidateInfo.position} position. Thank you for joining us. I'm really looking forward to learning more about your background and experience. How are you doing today?`;
      }
    } catch (error) {
      logger.error('Error generating welcome message:', error);
      return `Hello ${candidateInfo.name}! I'm Sarah, and I'll be conducting your interview today for the ${candidateInfo.position} position. Thank you for joining us.`;
    }
  }

  async generateResponse(interviewId, candidateMessage, conversationHistory = []) {
    try {
      const prompt = this.buildResponsePrompt(candidateMessage, conversationHistory);
      
      if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: this.aiConfig.model });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        // Update conversation memory
        this.updateConversationMemory(interviewId, candidateMessage, aiResponse);
        
        return aiResponse;
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        });
        
        const aiResponse = completion.choices[0].message.content;
        this.updateConversationMemory(interviewId, candidateMessage, aiResponse);
        
        return aiResponse;
      } else {
        // Fallback response
        return this.generateFallbackResponse(candidateMessage);
      }
    } catch (error) {
      logger.error('Error generating AI response:', error);
      return "That's very interesting! Could you tell me more about that?";
    }
  }

  buildResponsePrompt(candidateMessage, conversationHistory) {
    const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context
    const context = recentMessages.map(msg => 
      `${msg.sender === 'candidate' ? 'Candidate' : 'Sarah'}: ${msg.message}`
    ).join('\n');

    return `${this.aiConfig.systemPrompt}

Recent conversation context:
${context}

Candidate's latest message: "${candidateMessage}"

As Sarah, provide a natural, engaging response that:
1. Shows you're listening and interested
2. Asks a relevant follow-up question
3. Maintains the professional but friendly tone
4. Keeps the conversation flowing naturally
5. Is under 100 words

Response:`;
  }

  async analyzeResponse(candidateMessage) {
    try {
      const analysisPrompt = `Analyze this candidate response for an interview: "${candidateMessage}"

Provide a JSON response with:
{
  "keywords": ["array", "of", "key", "terms"],
  "sentiment": "positive/neutral/negative",
  "specificity": 1-10,
  "technicalTerms": ["array", "of", "technical", "terms"],
  "examples": ["array", "of", "examples", "mentioned"],
  "confidence": 1-10,
  "communication": 1-10
}`;

      if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: this.aiConfig.model });
        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        return JSON.parse(response.text());
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 200,
          temperature: 0.3
        });
        return JSON.parse(completion.choices[0].message.content);
      } else {
        // Fallback analysis
        return {
          keywords: candidateMessage.toLowerCase().split(' ').slice(0, 5),
          sentiment: 'neutral',
          specificity: 5,
          technicalTerms: [],
          examples: [],
          confidence: 5,
          communication: 5
        };
      }
    } catch (error) {
      logger.error('Error analyzing response:', error);
      return {
        keywords: [],
        sentiment: 'neutral',
        specificity: 5,
        technicalTerms: [],
        examples: [],
        confidence: 5,
        communication: 5
      };
    }
  }

  calculateResponseScore(analysis) {
    const weights = {
      specificity: 0.2,
      confidence: 0.2,
      communication: 0.3,
      sentiment: 0.15,
      technicalTerms: 0.15
    };

    let score = 0;
    
    // Specificity score (0-10)
    score += (analysis.specificity / 10) * weights.specificity;
    
    // Confidence score (0-10)
    score += (analysis.confidence / 10) * weights.confidence;
    
    // Communication score (0-10)
    score += (analysis.communication / 10) * weights.communication;
    
    // Sentiment score
    const sentimentScore = analysis.sentiment === 'positive' ? 0.8 : 
                          analysis.sentiment === 'neutral' ? 0.5 : 0.2;
    score += sentimentScore * weights.sentiment;
    
    // Technical terms bonus
    const technicalBonus = Math.min(analysis.technicalTerms.length * 0.1, 0.3);
    score += technicalBonus * weights.technicalTerms;
    
    // Convert to 1-10 scale
    return Math.round(score * 10 * 10) / 10;
  }

  updateConversationMemory(interviewId, candidateMessage, aiResponse) {
    if (!this.conversationMemory.has(interviewId)) {
      this.conversationMemory.set(interviewId, []);
    }
    
    const memory = this.conversationMemory.get(interviewId);
    memory.push({
      candidate: candidateMessage,
      ai: aiResponse,
      timestamp: new Date()
    });
    
    // Keep only last 20 exchanges
    if (memory.length > 20) {
      memory.splice(0, memory.length - 20);
    }
  }

  generateFallbackResponse(candidateMessage) {
    const fallbackResponses = [
      "That's very interesting! Can you tell me more about that?",
      "I see. How did that experience shape your approach to similar situations?",
      "That's a great point. What would you say was the most challenging part of that?",
      "Interesting perspective. How do you think that applies to this role?",
      "That sounds like valuable experience. What did you learn from that situation?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  async generateClosingMessage(interviewId, finalScore) {
    try {
      const prompt = `Generate a professional closing message for an interview. 
                     The candidate received a score of ${finalScore}/10. 
                     Keep it encouraging and professional, regardless of the score. 
                     Thank them for their time and mention next steps. 
                     Keep it under 80 words.`;

      if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: this.aiConfig.model });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.7
        });
        return completion.choices[0].message.content;
      } else {
        return "Thank you so much for your time today! It was great getting to know you. We'll be in touch with next steps soon. Have a wonderful day!";
      }
    } catch (error) {
      logger.error('Error generating closing message:', error);
      return "Thank you for your time today! We'll be in touch soon.";
    }
  }

  getQuestionBank() {
    return this.questionBank;
  }

  healthCheck() {
    return {
      gemini: !!this.gemini,
      openai: !!this.openai,
      status: this.gemini || this.openai ? 'healthy' : 'degraded'
    };
  }
}

module.exports = new AIService();