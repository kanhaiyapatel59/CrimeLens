/**
 * AI Service - Groq API Integration
 * Enterprise-grade AI service for crime intelligence
 */

const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    
    if (!this.apiKey) {
      logger.warn('⚠️ GROQ_API_KEY not found, using fallback responses');
    } else {
      logger.info('✅ Groq API initialized with model:', this.model);
    }
  }

  /**
   * Get AI Personality Prompt - Makes AI conversational like ChatGPT
   */
  getPersonalityPrompt() {
    return `You are CrimeLens AI, a friendly, professional, and conversational AI assistant for the Karnataka State Police.

🎯 YOUR PERSONALITY:
- Friendly and approachable (like a helpful colleague)
- Professional and knowledgeable
- Conversational and engaging (like ChatGPT)
- Use emojis naturally 😊
- Ask follow-up questions
- Show empathy and understanding
- Be warm but maintain professionalism

📋 HOW TO RESPOND:
1. Start with a warm greeting or acknowledgment
2. Provide clear, structured information
3. Use bullet points for lists
4. Ask clarifying questions when needed
5. End with a helpful suggestion or question
6. Keep responses natural and conversational

🎨 RESPONSE STYLE:
- Use natural language, not robotic text
- Include emojis where appropriate (but not excessive)
- Break down complex information
- Be encouraging and supportive
- Show genuine interest in helping

💡 EXAMPLES:
❌ Bad: "Crime analysis requires data."
✅ Good: "Great question! Let me analyze the crime data for you. 🔍 What specific time period are you interested in?"

❌ Bad: "Predictions show high crime."
✅ Good: "Based on our analysis, I'm seeing some interesting patterns. 📊 Would you like me to break down the predictions by area?"

Remember: You're a helpful, professional, and friendly AI assistant. Make every interaction feel like a conversation with a knowledgeable colleague!`;
  }

  /**
   * Send chat message to Groq API with conversational personality
   */
  async chat(message, context = '', history = [], personality = null) {
    try {
      // ✅ If Groq API key exists, use it
      if (this.apiKey) {
        logger.info('🤖 Sending request to Groq API...');
        logger.info('📝 Model:', this.model);

        const personalityPrompt = personality || this.getPersonalityPrompt();

        const systemPrompt = `You are CrimeLens AI, an expert crime intelligence analyst for the Karnataka State Police.

${personalityPrompt}

RECENT CONTEXT:
${context || 'General crime intelligence conversation'}

IMPORTANT GUIDELINES:
1. Be conversational and warm (like ChatGPT)
2. Use natural language with emojis
3. Ask follow-up questions
4. Provide detailed, helpful responses
5. Show empathy and understanding
6. Be professional but approachable
7. Never share sensitive information
8. If unsure, ask for clarification`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10),
          { role: 'user', content: message }
        ];

        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.model,
            messages: messages,
            temperature: 0.8,
            max_tokens: 1000,
            top_p: 0.9,
            frequency_penalty: 0.3,
            presence_penalty: 0.6,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        const result = response.data.choices[0].message.content;
        logger.info(`✅ AI response generated (${result.length} chars)`);
        
        return {
          success: true,
          response: result,
          usage: response.data.usage
        };
      }

      // ✅ Fallback responses if no API key
      logger.info('🤖 Using fallback responses (no Groq API key)');
      
      const fallbackResponses = [
        "Hi there! 👋 I'm CrimeLens AI. How can I help you with crime analysis today?",
        "Great question! Let me analyze that for you. 📊 What specific aspect are you interested in?",
        "I'd be happy to help with that! 😊 Could you provide more context?",
        "Interesting question! 🤔 Let me think about that. Can you tell me more?",
        "I'm here to assist with crime intelligence! 🔍 What would you like to know?",
        "That's a great question about crime patterns! 📈 Let me break that down for you.",
        "I appreciate you asking about that! 💭 What specific area of crime analysis are you interested in?",
        "Let me help you with that! 🎯 Could you share more details about what you're looking for?"
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        success: true,
        response: randomFallback,
        fallback: true
      };

    } catch (error) {
      logger.error('❌ AI Service error:', error.message);
      
      if (error.response) {
        logger.error('📝 Response status:', error.response.status);
        
        if (error.response.status === 401) {
          return {
            success: false,
            error: 'Invalid API key. Please check your Groq API key.'
          };
        }
        
        if (error.response.status === 429) {
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again in a moment.'
          };
        }
      }
      
      // ✅ Always return a fallback response on error
      return {
        success: true,
        response: "I'm having a slight technical issue. Could you try again in a moment? 😊",
        fallback: true
      };
    }
  }

  /**
   * Analyze crime patterns with conversational response
   */
  async analyzeCrimePatterns(crimeData) {
    const context = `You are analyzing crime data: ${JSON.stringify(crimeData)}`;
    const message = `Can you help me understand the crime patterns in this data? 
      I'd like to know about:
      1. What trends do you see?
      2. Which areas need attention?
      3. Any predictions you can make?
      4. What would you recommend?`;
    
    return this.chat(message, context);
  }

  /**
   * Predict crime hotspots with conversational response
   */
  async predictHotspots(locations, timeframe = 'next 7 days') {
    const context = `Crime locations to analyze: ${JSON.stringify(locations)}`;
    const message = `Based on this data, can you help me predict where crime might happen in the ${timeframe}?
      I'm particularly interested in:
      1. High-risk areas
      2. Likely crime types
      3. Prevention suggestions`;
    
    return this.chat(message, context);
  }

  /**
   * Analyze suspect network with conversational response
   */
  async analyzeSuspectNetwork(suspectData) {
    const context = `Suspect information: ${JSON.stringify(suspectData)}`;
    const message = `I need help understanding this suspect network. Can you identify:
      1. Who are the key people?
      2. How are they connected?
      3. Any patterns in how they operate?
      4. Who might be the leader?`;
    
    return this.chat(message, context);
  }

  /**
   * Generate crime report summary with conversational response
   */
  async generateReportSummary(reportData) {
    const context = `Report data: ${JSON.stringify(reportData)}`;
    const message = `Could you give me a clear summary of this crime report?
      I'd like to know:
      1. The key statistics
      2. What's most important
      3. Any concerning patterns
      4. What actions should be taken?`;
    
    return this.chat(message, context);
  }

  /**
   * Quick query with conversational response
   */
  async quickQuery(question, context = '') {
    return this.chat(question, context);
  }
}

module.exports = new AIService();