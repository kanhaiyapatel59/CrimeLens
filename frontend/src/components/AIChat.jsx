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
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const AIChat = ({ height = 400, onSend, suggestions = [] }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI Crime Intelligence Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

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

    if (onSend) {
      const response = await onSend(input)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          content: response || "I'm processing your request...",
          timestamp: new Date(),
        },
      ])
    }

    setLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#f8f9fa',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
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
                marginBottom: 12,
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.type === 'user' ? '#1a237e' : '#4fc3f7',
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.type === 'user' ? <PersonIcon sx={{ fontSize: 16 }} /> : <AIIcon sx={{ fontSize: 16 }} />}
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.type === 'user' ? '#1a237e' : '#fff',
                    color: message.type === 'user' ? '#fff' : 'inherit',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color={message.type === 'user' ? 'rgba(255,255,255,0.7)' : 'textSecondary'}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#4fc3f7', width: 32, height: 32 }}>
                <AIIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {suggestions.length > 0 && (
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, bgcolor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion}
              size="small"
              onClick={() => {
                setInput(suggestion)
                setTimeout(handleSend, 100)
              }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ p: 1.5, bgcolor: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask about crime patterns, predictions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={2}
            disabled={loading}
            size="small"
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
              width: 40,
              height: 40,
              '&:hover': { bgcolor: '#283593' },
              '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default AIChat