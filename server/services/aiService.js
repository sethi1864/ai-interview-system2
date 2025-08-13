const OpenAI = require('openai');
const Interview = require('../models/Interview');
const logger = require('../utils/logger');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Configuration
const aiConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `You are Sarah, an experienced HR interviewer with 8 years of experience in technical recruitment. 
                 Conduct natural, professional interviews with intelligent follow-up questions.
                 Be friendly but maintain professional boundaries.
                 NEVER reveal you're an AI - always act as a real human interviewer.
                 Ask specific, relevant questions based on candidate responses.
                 Show genuine interest and engagement.
                 Use natural speech patterns with occasional "um", "well", "you know".
                 Keep responses conversational and human-like.
                 
                 Interview Guidelines:
                 - Ask open-ended questions that encourage detailed responses
                 - Follow up on interesting points mentioned by candidates
                 - Probe for specific examples and experiences
                 - Assess both technical skills and soft skills
                 - Maintain a professional yet warm tone
                 - Adapt your questioning based on the candidate's experience level
                 - Keep the conversation flowing naturally
                 
                 NEVER mention that you are an AI or automated system.`
};

// Question bank for different categories
const questionBank = {
  introduction: [
    "Tell me about yourself and your background.",
    "What interested you about this position?",
    "What are your career goals for the next few years?",
    "Why are you looking for a new opportunity?",
    "What do you know about our company?"
  ],
  technical: [
    "Can you walk me through a challenging technical problem you solved?",
    "What's your experience with [specific technology]?",
    "How do you stay updated with the latest technologies?",
    "Describe a project where you had to learn a new technology quickly.",
    "What's your approach to debugging complex issues?"
  ],
  behavioral: [
    "Tell me about a time you had to work with a difficult team member.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle constructive criticism?",
    "Give me an example of when you went above and beyond in your role.",
    "Tell me about a time you failed and what you learned from it."
  ],
  situational: [
    "How would you handle a situation where your manager disagrees with your approach?",
    "What would you do if you discovered a critical bug in production?",
    "How do you prioritize multiple competing deadlines?",
    "Describe how you would mentor a junior team member.",
    "What's your approach to handling scope creep in a project?"
  ]
};

// Conversation memory for each interview
const conversationMemory = new Map();

class AIService {
  constructor() {
    this.openai = openai;
    this.config = aiConfig;
  }

  // Generate welcome message
  async generateWelcomeMessage(candidateInfo) {
    try {
      const prompt = `Generate a warm, professional welcome message for a candidate named ${candidateInfo.name} 
                     applying for the ${candidateInfo.position} position. 
                     
                     The message should:
                     - Be welcoming and put the candidate at ease
                     - Mention their name and the position they're applying for
                     - Explain that this is a video interview
                     - Ask them to introduce themselves and tell you what interested them about the position
                     - Be conversational and human-like
                     - Be around 2-3 sentences long
                     
                     Format as a natural conversation starter.`;

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const message = response.choices[0].message.content;
      logger.ai(`Generated welcome message for ${candidateInfo.name}`);
      
      return message;
    } catch (error) {
      logger.errorWithContext(error, { method: 'generateWelcomeMessage', candidateInfo });
      return `Hello ${candidateInfo.name}! Thank you for joining us today for the ${candidateInfo.position} position. I'm Sarah from the HR team, and I'm excited to learn more about your background and experience. Could you please introduce yourself and tell me what interested you about this opportunity?`;
    }
  }

  // Generate intelligent response based on candidate's answer
  async generateResponse(candidateMessage, interviewId) {
    try {
      // Get conversation history
      const interview = await Interview.findOne({ interviewId });
      if (!interview) {
        throw new Error('Interview not found');
      }

      // Analyze the candidate's response
      const analysis = this.analyzeResponse(candidateMessage);
      
      // Get conversation context
      const conversationContext = this.getConversationContext(interview.conversationHistory);
      
      // Generate appropriate response
      const prompt = this.buildResponsePrompt(candidateMessage, analysis, conversationContext, interview);
      
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const aiResponse = response.choices[0].message.content;
      
      // Update conversation memory
      this.updateConversationMemory(interviewId, candidateMessage, aiResponse, analysis);
      
      logger.ai(`Generated response for interview ${interviewId}`);
      
      return aiResponse;
    } catch (error) {
      logger.errorWithContext(error, { method: 'generateResponse', interviewId });
      return "That's very interesting! Could you tell me more about that?";
    }
  }

  // Analyze candidate response for keywords, sentiment, etc.
  analyzeResponse(response) {
    const analysis = {
      length: response.length,
      wordCount: response.split(' ').length,
      keywords: this.extractKeywords(response),
      sentiment: this.analyzeSentiment(response),
      specificity: this.calculateSpecificity(response),
      technicalTerms: this.extractTechnicalTerms(response),
      examples: this.extractExamples(response)
    };

    return analysis;
  }

  // Extract keywords from response
  extractKeywords(text) {
    const commonKeywords = [
      'experience', 'project', 'team', 'leadership', 'problem', 'solution',
      'technology', 'skill', 'challenge', 'success', 'failure', 'learn',
      'improve', 'develop', 'manage', 'collaborate', 'communicate'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return commonKeywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    );
  }

  // Analyze sentiment
  analyzeSentiment(text) {
    const positiveWords = ['excited', 'passionate', 'love', 'enjoy', 'successful', 'achieved', 'improved'];
    const negativeWords = ['difficult', 'challenging', 'failed', 'struggled', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Calculate response specificity
  calculateSpecificity(text) {
    const specificIndicators = ['specifically', 'for example', 'in detail', 'concrete', 'particular'];
    const vagueIndicators = ['maybe', 'perhaps', 'kind of', 'sort of', 'generally'];
    
    const words = text.toLowerCase().split(/\s+/);
    const specificCount = words.filter(word => specificIndicators.includes(word)).length;
    const vagueCount = words.filter(word => vagueIndicators.includes(word)).length;
    
    return Math.max(0, Math.min(1, (specificCount - vagueCount + 1) / 2));
  }

  // Extract technical terms
  extractTechnicalTerms(text) {
    const technicalTerms = [
      'javascript', 'python', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
      'agile', 'scrum', 'git', 'api', 'database', 'frontend', 'backend',
      'machine learning', 'ai', 'cloud', 'devops', 'ci/cd'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return technicalTerms.filter(term => 
      words.some(word => word.includes(term) || term.includes(word))
    );
  }

  // Extract examples from response
  extractExamples(text) {
    const examplePatterns = [
      /for example/i,
      /such as/i,
      /like when/i,
      /specifically/i,
      /in one case/i
    ];
    
    return examplePatterns.some(pattern => pattern.test(text));
  }

  // Get conversation context
  getConversationContext(conversationHistory) {
    const recentMessages = conversationHistory.slice(-6); // Last 6 messages
    const context = {
      topicsCovered: [],
      candidateStrengths: [],
      areasOfConcern: [],
      questionTypes: []
    };

    recentMessages.forEach(msg => {
      if (msg.speaker === 'candidate') {
        context.topicsCovered.push(...this.extractKeywords(msg.message));
        if (this.analyzeSentiment(msg.message) === 'positive') {
          context.candidateStrengths.push(...this.extractKeywords(msg.message));
        }
      }
    });

    return context;
  }

  // Build response prompt
  buildResponsePrompt(candidateMessage, analysis, context, interview) {
    const candidateInfo = interview.candidateInfo;
    const position = candidateInfo.position;
    const experience = candidateInfo.experience;

    let prompt = `The candidate (${candidateInfo.name}) just said: "${candidateMessage}"
                 
                 Position: ${position}
                 Experience Level: ${experience}
                 
                 Response Analysis:
                 - Length: ${analysis.length} characters, ${analysis.wordCount} words
                 - Keywords: ${analysis.keywords.join(', ')}
                 - Sentiment: ${analysis.sentiment}
                 - Specificity: ${analysis.specificity}
                 - Technical terms: ${analysis.technicalTerms.join(', ')}
                 - Contains examples: ${analysis.examples}
                 
                 Recent topics covered: ${context.topicsCovered.join(', ')}
                 
                 Generate a natural, conversational response that:
                 1. Acknowledges their response appropriately
                 2. Asks a relevant follow-up question
                 3. Probes for more specific details if needed
                 4. Maintains professional but friendly tone
                 5. Moves the conversation forward naturally
                 
                 Keep your response under 100 words and make it sound completely human.`;

    // Add specific guidance based on analysis
    if (analysis.length < 50) {
      prompt += "\n\nTheir response was quite brief. Ask them to elaborate more.";
    }
    
    if (analysis.specificity < 0.5) {
      prompt += "\n\nTheir response was vague. Ask for specific examples.";
    }
    
    if (analysis.technicalTerms.length > 0) {
      prompt += "\n\nThey mentioned technical terms. Ask for more details about their technical experience.";
    }

    return prompt;
  }

  // Update conversation memory
  updateConversationMemory(interviewId, candidateMessage, aiResponse, analysis) {
    if (!conversationMemory.has(interviewId)) {
      conversationMemory.set(interviewId, {
        topicsCovered: [],
        candidateStrengths: [],
        areasOfConcern: [],
        responsePatterns: []
      });
    }

    const memory = conversationMemory.get(interviewId);
    memory.topicsCovered.push(...analysis.keywords);
    memory.responsePatterns.push({
      length: analysis.length,
      sentiment: analysis.sentiment,
      specificity: analysis.specificity
    });

    // Keep only recent patterns
    if (memory.responsePatterns.length > 10) {
      memory.responsePatterns = memory.responsePatterns.slice(-10);
    }
  }

  // Calculate response score
  async calculateResponseScore(response, interviewId) {
    try {
      const analysis = this.analyzeResponse(response);
      
      // Scoring factors
      const factors = {
        responseLength: this.scoreLength(analysis.length),
        keywordRelevance: this.scoreKeywords(analysis.keywords),
        specificExamples: analysis.examples ? 8 : 4,
        communicationClarity: this.scoreClarity(response),
        technicalAccuracy: this.scoreTechnicalTerms(analysis.technicalTerms),
        enthusiasmIndicators: this.scoreEnthusiasm(response)
      };

      // Weighted scoring
      const weights = {
        responseLength: 0.20,
        keywordRelevance: 0.25,
        specificExamples: 0.20,
        communicationClarity: 0.15,
        technicalAccuracy: 0.10,
        enthusiasmIndicators: 0.10
      };

      let totalScore = 0;
      for (const [factor, score] of Object.entries(factors)) {
        totalScore += score * weights[factor];
      }

      const finalScore = Math.min(10, Math.max(1, Math.round(totalScore * 10) / 10));

      // Save score to database
      await Interview.findOneAndUpdate(
        { interviewId },
        {
          $push: {
            scores: {
              category: 'overall',
              score: finalScore,
              feedback: this.generateScoreFeedback(analysis),
              factors
            }
          }
        }
      );

      logger.ai(`Calculated score ${finalScore} for interview ${interviewId}`);
      return finalScore;
    } catch (error) {
      logger.errorWithContext(error, { method: 'calculateResponseScore', interviewId });
      return 5; // Default score
    }
  }

  // Score individual factors
  scoreLength(length) {
    if (length < 30) return 3;
    if (length < 100) return 6;
    if (length < 300) return 9;
    return 7; // Too long
  }

  scoreKeywords(keywords) {
    return Math.min(10, keywords.length * 2);
  }

  scoreClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    if (avgSentenceLength < 10) return 8;
    if (avgSentenceLength < 20) return 9;
    return 6;
  }

  scoreTechnicalTerms(terms) {
    return Math.min(10, terms.length * 3);
  }

  scoreEnthusiasm(text) {
    const enthusiasmWords = ['excited', 'passionate', 'love', 'enjoy', 'thrilled', 'amazing'];
    const words = text.toLowerCase().split(/\s+/);
    const count = words.filter(word => enthusiasmWords.includes(word)).length;
    return Math.min(10, count * 3 + 5);
  }

  // Generate score feedback
  generateScoreFeedback(analysis) {
    const feedback = [];
    
    if (analysis.length < 50) {
      feedback.push("Consider providing more detailed responses");
    }
    
    if (analysis.specificity < 0.5) {
      feedback.push("Include specific examples to strengthen your answers");
    }
    
    if (analysis.sentiment === 'positive') {
      feedback.push("Good enthusiasm and positive attitude");
    }
    
    if (analysis.technicalTerms.length > 0) {
      feedback.push("Strong technical knowledge demonstrated");
    }

    return feedback.join('. ');
  }

  // Generate closing message
  async generateClosingMessage(interviewId) {
    try {
      const interview = await Interview.findOne({ interviewId });
      const finalScore = interview.finalScore || 5;
      
      const prompt = `Generate a professional closing message for an interview with ${interview.candidateInfo.name}.
                     
                     Final Score: ${finalScore}/10
                     Position: ${interview.candidateInfo.position}
                     
                     The message should:
                     - Thank them for their time
                     - Be professional and courteous
                     - Mention next steps (review process, timeline)
                     - Ask if they have any questions
                     - Be warm but professional
                     
                     Keep it under 100 words and make it sound completely human.`;

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const message = response.choices[0].message.content;
      logger.ai(`Generated closing message for interview ${interviewId}`);
      
      return message;
    } catch (error) {
      logger.errorWithContext(error, { method: 'generateClosingMessage', interviewId });
      return "Thank you for your time today. We'll review your interview and get back to you within 2-3 business days. Do you have any questions for me?";
    }
  }

  // Get final score for interview
  async getFinalScore(interviewId) {
    try {
      const interview = await Interview.findOne({ interviewId });
      return interview.finalScore || 0;
    } catch (error) {
      logger.errorWithContext(error, { method: 'getFinalScore', interviewId });
      return 0;
    }
  }

  // Clear conversation memory
  clearMemory(interviewId) {
    conversationMemory.delete(interviewId);
  }
}

module.exports = new AIService();