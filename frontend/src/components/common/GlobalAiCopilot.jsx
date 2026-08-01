import React, { useState, useRef, useEffect } from 'react'
import {
  Box, Fab, Paper, Typography, IconButton, TextField, Avatar, Chip,
  CircularProgress, Tooltip, Badge, Grid,
} from '@mui/material'
import {
  SmartToy as RobotIcon, Close as CloseIcon, Send as SendIcon,
  AutoAwesome as SparklesIcon, Refresh as RefreshIcon, Person as PersonIcon,
  TrendingUp as TrendingUpIcon, LocationOn as LocationIcon, People as PeopleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import axiosInstance from '../../api/axios'

const PROMPT_CARDS = [
  { icon: <TrendingUpIcon sx={{ color: '#10a37f', fontSize: 16 }} />, title: 'Crime Trends' },
  { icon: <LocationIcon sx={{ color: '#ff9800', fontSize: 16 }} />, title: 'Hotspots' },
  { icon: <PeopleIcon sx={{ color: '#e91e63', fontSize: 16 }} />, title: 'Repeat Suspects' },
  { icon: <DescriptionIcon sx={{ color: '#9c27b0', fontSize: 16 }} />, title: 'Briefing' },
]

const GlobalAiCopilot = () => {
  const [open, setOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, open])

  const handleSendMessage = async (customText = null) => {
    const messageToSend = customText || inputMessage
    if (!messageToSend || messageToSend.trim().length === 0 || loading) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!customText) setInputMessage('')
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

      const res = await axiosInstance.post('/api/ai/chat', {
        message: messageToSend,
        history: history.slice(-6),
      })

      const aiResponse = res.data?.data?.response || res.data?.response || 
        "Hi! 👋 How can I assist you with your crime investigation or case analytics today?"

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error('AI Copilot error:', error)
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having a temporary connection issue. Please check your backend connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1400 }}>
      {/* Compact Floating Popup Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={16}
              sx={{
                width: { xs: 320, sm: 380 },
                height: 480,
                borderRadius: 4,
                bgcolor: '#212121',
                color: '#ececec',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                mb: 2,
                border: '1px solid #3e3e3e',
                boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {/* Compact Header */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  bgcolor: '#171717',
                  borderBottom: '1px solid #2f2f2f',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar sx={{ bgcolor: '#10a37f', width: 30, height: 30 }}>
                    <RobotIcon fontSize="small" sx={{ color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.1 }}>
                      CrimeLens AI
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#10a37f', fontWeight: 600, fontSize: '0.6rem' }}>
                      Online • Copilot
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Reset Chat">
                    <IconButton onClick={handleClearChat} size="small" sx={{ color: '#8e8e8e' }}>
                      <RefreshIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: '#8e8e8e' }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Chat Canvas / Welcome Hero */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#212121' }}>
                {messages.length === 0 && !loading ? (
                  /* Compact ChatGPT Welcome Screen */
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', my: 'auto' }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: '#10a37f', mb: 1.5, boxShadow: '0 4px 16px rgba(16,163,127,0.3)' }}>
                      <SparklesIcon sx={{ fontSize: 24, color: '#fff' }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', mb: 0.5 }}>
                      How can I help you today?
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8e8e8e', mb: 2, px: 2, fontSize: '0.75rem' }}>
                      Ask CrimeLens AI about FIRs, repeat suspects, or risk forecasts.
                    </Typography>

                    {/* Compact 2x2 Chips */}
                    <Grid container spacing={1} sx={{ width: '100%', px: 1 }}>
                      {PROMPT_CARDS.map((card, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Paper
                            onClick={() => handleSendMessage(card.title)}
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: '#2f2f2f',
                              border: '1px solid #3e3e3e',
                              borderRadius: 2.5,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': { bgcolor: '#383838', borderColor: '#10a37f' },
                            }}
                          >
                            {card.icon}
                            <Typography variant="caption" fontWeight={600} sx={{ color: '#fff', fontSize: '0.7rem' }}>{card.title}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  /* Active Message Feed */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {messages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: msg.sender === 'user' ? '#383838' : '#10a37f',
                            fontSize: '0.65rem',
                            flexShrink: 0,
                            mt: 0.5,
                          }}
                        >
                          {msg.sender === 'user' ? <PersonIcon sx={{ fontSize: 14 }} /> : <RobotIcon sx={{ fontSize: 14 }} />}
                        </Avatar>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.2,
                            px: 1.5,
                            borderRadius: 2.5,
                            maxWidth: '85%',
                            bgcolor: msg.sender === 'user' ? '#2f2f2f' : '#282828',
                            color: '#ececec',
                            border: '1px solid #3e3e3e',
                          }}
                        >
                          {msg.sender === 'ai' ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <Typography variant="caption" sx={{ lineHeight: 1.5, mb: 0.5, display: 'block', fontSize: '0.8rem' }}>{children}</Typography>,
                                strong: ({ children }) => <strong style={{ color: '#10a37f' }}>{children}</strong>,
                                ul: ({ children }) => <Box component="ul" sx={{ pl: 1.5, mb: 0.5 }}>{children}</Box>,
                                li: ({ children }) => <Typography component="li" variant="caption" sx={{ lineHeight: 1.5, fontSize: '0.8rem' }}>{children}</Typography>,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            <Typography variant="caption" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5, fontSize: '0.8rem', display: 'block' }}>
                              {msg.text}
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.3, opacity: 0.4, fontSize: '0.55rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                            {msg.time}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}

                    {loading && (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: '#10a37f', pl: 1 }}>
                        <CircularProgress size={14} color="inherit" />
                        <Typography variant="caption" sx={{ color: '#8e8e8e', fontSize: '0.7rem' }}>Thinking...</Typography>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Box>
                )}
              </Box>

              {/* Compact Input Capsule */}
              <Box sx={{ p: 1.2, bgcolor: '#171717', borderTop: '1px solid #2f2f2f' }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: '#2f2f2f',
                    border: '1px solid #3e3e3e',
                    borderRadius: 3,
                    p: 0.5,
                    px: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask CrimeLens AI..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{
                      '& .MuiInputBase-input': { color: '#fff', fontSize: '0.825rem', py: 0.5 },
                      '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                    }}
                  />
                  <IconButton
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    size="small"
                    sx={{
                      bgcolor: inputMessage.trim() ? '#10a37f' : '#3e3e3e',
                      color: '#fff',
                      p: 0.6,
                      '&:hover': { bgcolor: '#0d8c6e' },
                      '&.Mui-disabled': { bgcolor: '#3e3e3e', color: '#666' },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Paper>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) at Bottom Right */}
      <Tooltip title={open ? "Close AI" : "CrimeLens AI Copilot"} placement="left">
        <Fab
          onClick={() => setOpen(!open)}
          sx={{
            bgcolor: '#10a37f',
            color: '#fff',
            width: 52,
            height: 52,
            boxShadow: '0 6px 20px rgba(16,163,127,0.4)',
            '&:hover': { bgcolor: '#0d8c6e', transform: 'scale(1.06)' },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {open ? <CloseIcon /> : <RobotIcon fontSize="medium" />}
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default GlobalAiCopilot
