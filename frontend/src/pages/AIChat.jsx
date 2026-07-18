import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api/ai'
import { crimeAPI } from '../api/crimes'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI Crime Intelligence Assistant. I can help you with:\n\n• Crime pattern analysis\n• Risk assessment\n• Anomaly detection\n• Modus Operandi identification\n• Crime predictions\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    'Analyze recent crime patterns',
    'Predict crime hotspots',
    'Detect anomalies in crimes',
    'Identify Modus Operandi',
    'Risk assessment for suspects',
  ])
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Process the user's query
      const response = await processQuery(input)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        suggestions: generateSuggestions(input),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      toast.error('Failed to process your request')
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          content: "I'm sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const processQuery = async (query) => {
    const lowerQuery = query.toLowerCase()

    // Analyze recent crime patterns
    if (lowerQuery.includes('pattern') || lowerQuery.includes('trend')) {
      try {
        const response = await aiAPI.getTrends({ days: 30 })
        const data = response.data
        if (data.success) {
          return `📊 **Crime Pattern Analysis**\n\n`
            + `Total crimes in last 30 days: ${data.trends.total}\n`
            + `Trend direction: ${data.trends.direction}\n`
            + `Rate of change: ${data.trends.rate}%\n\n`
            + `*This analysis is based on ${data.trends.periods.length} data points.*`
        }
      } catch (error) {
        return "I couldn't fetch the latest crime patterns. Please try again."
      }
    }

    // Predict crime hotspots
    if (lowerQuery.includes('predict') || lowerQuery.includes('hotspot')) {
      try {
        const response = await aiAPI.predictCrime({
          locations: [{ latitude: 12.9716, longitude: 77.5946, severity: 'medium' }],
          days: 7,
        })
        const data = response.data
        if (data.success) {
          return `🔮 **Crime Prediction**\n\n`
            + `Predicted crimes in the area: ${data.predictions.length}\n`
            + `*This prediction is based on current patterns and historical data.*\n\n`
            + `⚠️ These are AI-generated predictions and should be used as reference only.`
        }
      } catch (error) {
        return "I couldn't generate predictions at this moment. Please try again."
      }
    }

    // Detect anomalies
    if (lowerQuery.includes('anomaly') || lowerQuery.includes('unusual')) {
      try {
        const response = await aiAPI.detectAnomalies()
        const data = response.data
        if (data.success) {
          return `🚨 **Anomaly Detection Results**\n\n`
            + `Found ${data.anomalyCount} anomalies out of ${data.anomalyCount + data.normalCount} cases\n`
            + `Detection rate: ${(data.anomalyCount / (data.anomalyCount + data.normalCount) * 100).toFixed(1)}%\n\n`
            + `*${data.anomalyCount} cases require immediate attention.*`
        }
      } catch (error) {
        return "I couldn't detect anomalies at this moment. Please try again."
      }
    }

    // MO detection
    if (lowerQuery.includes('modus operandi') || lowerQuery.includes('pattern') || lowerQuery.includes('method')) {
      try {
        const response = await aiAPI.detectMO()
        const data = response.data
        if (data.success) {
          return `🔍 **Modus Operandi Analysis**\n\n`
            + `Identified ${data.clusterCount} distinct crime patterns\n`
            + `*Analysis based on recent crime data*\n\n`
            + `📌 Similar crimes have been grouped together for better investigation.`
        }
      } catch (error) {
        return "I couldn't analyze Modus Operandi patterns. Please try again."
      }
    }

    // Risk assessment
    if (lowerQuery.includes('risk') || lowerQuery.includes('assessment')) {
      return `⚠️ **Risk Assessment**\n\n`
        + `To perform a risk assessment, I need specific information about:\n\n`
        + `• Crime type\n• Location\n• Time period\n• Suspect information\n\n`
        + `Please provide more details for accurate risk scoring.`
    }

    // Default response
    return `🤖 **AI Assistant**\n\n`
      + `I understand you're asking about "${query}".\n\n`
      + `I can help you with:\n\n`
      + `• 📊 Analyzing crime patterns\n`
      + `• 🔮 Predicting crime hotspots\n`
      + `• 🚨 Detecting anomalies\n`
      + `• 🔍 Identifying Modus Operandi\n`
      + `• ⚠️ Risk assessment\n\n`
      + `Please ask a specific question about any of these topics.`
  }

  const generateSuggestions = (query) => {
    const suggestions = []
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('pattern')) {
      suggestions.push('Show more detailed pattern analysis')
      suggestions.push('Compare patterns across districts')
    }
    if (lowerQuery.includes('predict')) {
      suggestions.push('Predict for next week')
      suggestions.push('Show confidence levels')
    }
    if (lowerQuery.includes('anomaly')) {
      suggestions.push('List specific anomalies')
      suggestions.push('Show anomaly timeline')
    }

    return suggestions.length > 0 ? suggestions : [
      'Analyze recent crime patterns',
      'Predict crime hotspots',
      'Detect anomalies in crimes',
      'Identify Modus Operandi',
    ]
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Chat cleared. How can I assist you with crime analysis today?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            AI Assistant
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Ask me anything about crime patterns, predictions, and analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            icon={<AutoAwesomeIcon />}
            label="AI Powered"
            color="primary"
          />
          <IconButton onClick={clearChat} title="Clear Chat">
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Chat Container */}
      <Paper
        ref={chatContainerRef}
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#f8f9fa',
        }}
      >
        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 16,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    gap: 2,
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.type === 'user' ? '#1a237e' : '#4fc3f7',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {message.type === 'user' ? <PersonIcon /> : <AIIcon />}
                  </Avatar>
                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: message.type === 'user' ? '#1a237e' : '#fff',
                        color: message.type === 'user' ? '#fff' : 'inherit',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          '& strong': {
                            color: message.type === 'user' ? '#fff' : '#1a237e',
                          },
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Paper>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                    
                    {/* Suggestions for bot messages */}
                    {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: '#e8eaf6',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4fc3f7', width: 40, height: 40 }}>
                  <AIIcon />
                </Avatar>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <CircularProgress size={24} />
                </Paper>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Ask about crime patterns, predictions, analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: '#1a237e',
                color: '#fff',
                borderRadius: 2,
                width: 56,
                height: 56,
                '&:hover': {
                  bgcolor: '#283593',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default AIChat