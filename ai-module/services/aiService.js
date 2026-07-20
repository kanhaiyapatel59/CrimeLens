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
    this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
    
    if (!this.apiKey) {
      logger.warn('⚠️ GROQ_API_KEY not found in environment variables');
    } else {
      logger.info('✅ Groq API initialized');
    }
  }

  /**
   * Send chat message to Groq API
   */
  async chat(message, context = '', history = []) {
    try {
      const systemPrompt = `You are CrimeLens AI, an expert crime intelligence analyst for the Karnataka State Police. 
        Your role is to provide professional, data-driven insights about crime patterns, predictions, and analysis.
        
        RULES:
        1. Always be professional and concise
        2. Use bullet points for clarity when appropriate
        3. Provide actionable recommendations
        4. If you don't have enough data, ask for more context
        5. Never share sensitive or confidential information
        
        Context: ${context || 'General crime intelligence'}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.choices[0].message.content;
      logger.info(`🤖 AI response generated (${result.length} chars)`);
      
      return {
        success: true,
        response: result,
        usage: response.data.usage
      };
    } catch (error) {
      logger.error('❌ Groq API error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get AI response'
      };
    }
  }

  /**
   * Analyze crime patterns
   */
  async analyzeCrimePatterns(crimeData) {
    const context = `You have the following crime data: ${JSON.stringify(crimeData)}`;
    const message = `Analyze this crime data and provide insights on:
      1. Crime patterns and trends
      2. High-risk areas
      3. Potential predictions
      4. Recommended actions for police`;
    
    return this.chat(message, context);
  }

  /**
   * Predict crime hotspots
   */
  async predictHotspots(locations, timeframe = 'next 7 days') {
    const context = `Crime locations: ${JSON.stringify(locations)}`;
    const message = `Based on historical crime data, predict potential crime hotspots for ${timeframe}. 
      Provide:
      1. High-risk areas
      2. Expected crime types
      3. Prevention recommendations`;
    
    return this.chat(message, context);
  }

  /**
   * Analyze suspect connections
   */
  async analyzeSuspectNetwork(suspectData) {
    const context = `Suspect information: ${JSON.stringify(suspectData)}`;
    const message = `Analyze this suspect network and identify:
      1. Key individuals
      2. Connections between suspects
      3. Potential leaders or organizers
      4. Modus operandi patterns`;
    
    return this.chat(message, context);
  }

  /**
   * Generate crime report summary
   */
  async generateReportSummary(reportData) {
    const context = `Report data: ${JSON.stringify(reportData)}`;
    const message = `Generate a concise executive summary of this crime report including:
      1. Key statistics
      2. Major findings
      3. Trends and patterns
      4. Recommendations`;
    
    return this.chat(message, context);
  }

  /**
   * Quick query for specific questions
   */
  async quickQuery(question, context = '') {
    return this.chat(question, context);
  }
}

module.exports = new AIService();