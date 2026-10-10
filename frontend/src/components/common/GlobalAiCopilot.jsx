import React, { useState, useRef, useEffect } from 'react'
import {
  Box, Fab, Paper, Typography, IconButton, TextField, Avatar, Chip,
  CircularProgress, Tooltip, Badge, Grid,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
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
  { icon: <TrendingUpIcon sx={{ color: '#239B62', fontSize: 16 }} />, title: 'Crime Trends' },
  { icon: <LocationIcon sx={{ color: '#D99118', fontSize: 16 }} />, title: 'Hotspots' },
  { icon: <PeopleIcon sx={{ color: '#356AE6', fontSize: 16 }} />, title: 'Repeat Suspects' },
  { icon: <DescriptionIcon sx={{ color: '#8E44AD', fontSize: 16 }} />, title: 'Briefing' },
]

const GlobalAiCopilot = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const bgSurface = isDark ? '#1A1E29' : '#E8ECF3'
  const textPrimary = isDark ? '#F0F4FC' : '#202A3A'
  const textSecondary = isDark ? '#9DA8BA' : '#5C6779'
  const dividerColor = isDark ? '#262B3A' : '#D7DDE7'
  const raisedShadow = isDark
    ? '6px 6px 14px #12151D, -6px -6px 14px #222735'
    : '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF'
  const raisedSubtle = isDark
    ? '4px 4px 10px #12151D, -4px -4px 10px #222735'
    : '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF'
  const insetShadow = isDark
    ? 'inset 3px 3px 7px #12151D, inset -3px -3px 7px #232837'
    : 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF'

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
              elevation={0}
              sx={{
                width: { xs: 320, sm: 380 },
                height: 480,
                borderRadius: 4.5,
                bgcolor: bgSurface,
                color: textPrimary,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                mb: 2,
                boxShadow: raisedShadow,
                border: `1px solid ${dividerColor}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {/* Compact Header */}
              <Box
                sx={{
                  p: 1.5,
                  px: 2,
                  bgcolor: bgSurface,
                  borderBottom: `1px solid ${dividerColor}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar sx={{ bgcolor: '#356AE6', width: 32, height: 32, boxShadow: '2px 2px 8px rgba(53, 106, 230, 0.4)' }}>
                    <RobotIcon fontSize="small" sx={{ color: '#fff' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, fontSize: '0.85rem', lineHeight: 1.1 }}>
                      CrimeLens Copilot
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#239B62', fontWeight: 700, fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#239B62', display: 'inline-block' }} />
                      Active • KSP AI
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Tooltip title="Reset Chat">
                    <IconButton
                      onClick={handleClearChat}
                      size="small"
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: bgSurface,
                        boxShadow: raisedSubtle,
                        color: textSecondary,
                        '&:hover': { color: '#356AE6' },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    onClick={() => setOpen(false)}
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: bgSurface,
                      boxShadow: raisedSubtle,
                      color: textSecondary,
                      '&:hover': { color: '#D94F55' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Chat Canvas / Welcome Hero */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', bgcolor: bgSurface }}>
                {messages.length === 0 && !loading ? (
                  /* Compact Welcome Screen */
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', my: 'auto' }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: bgSurface,
                        boxShadow: raisedSubtle,
                        mb: 1.5,
                        color: '#356AE6',
                      }}
                    >
                      <SparklesIcon sx={{ fontSize: 24, color: '#356AE6' }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: textPrimary, mb: 0.5 }}>
                      How can I help you today?
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, mb: 2, px: 2, fontSize: '0.75rem' }}>
                      Ask CrimeLens AI about FIRs, repeat suspects, or risk forecasts.
                    </Typography>

                    {/* Compact 2x2 Chips */}
                    <Grid container spacing={1.2} sx={{ width: '100%', px: 0.5 }}>
                      {PROMPT_CARDS.map((card, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Paper
                            onClick={() => handleSendMessage(card.title)}
                            elevation={0}
                            sx={{
                              p: 1.2,
                              bgcolor: bgSurface,
                              boxShadow: raisedSubtle,
                              borderRadius: 3,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              transition: 'all 0.2s ease',
                              border: 'none',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: insetShadow,
                              },
                            }}
                          >
                            {card.icon}
                            <Typography variant="caption" fontWeight={700} sx={{ color: textPrimary, fontSize: '0.72rem' }}>{card.title}</Typography>
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
                            width: 26,
                            height: 26,
                            bgcolor: msg.sender === 'user' ? '#356AE6' : bgSurface,
                            color: msg.sender === 'user' ? '#fff' : '#356AE6',
                            boxShadow: msg.sender === 'user' ? '2px 2px 6px rgba(53, 106, 230, 0.4)' : raisedSubtle,
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
                            px: 1.6,
                            borderRadius: 3,
                            maxWidth: '85%',
                            bgcolor: msg.sender === 'user' ? '#356AE6' : bgSurface,
                            color: msg.sender === 'user' ? '#fff' : textPrimary,
                            boxShadow: msg.sender === 'user' ? '3px 3px 10px rgba(53, 106, 230, 0.35)' : raisedSubtle,
                            border: 'none',
                          }}
                        >
                          {msg.sender === 'ai' ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <Typography variant="caption" sx={{ lineHeight: 1.5, mb: 0.5, display: 'block', fontSize: '0.8rem', color: textPrimary }}>
                                    {children}
                                  </Typography>
                                ),
                                strong: ({ children }) => <strong style={{ color: '#356AE6', fontWeight: 700 }}>{children}</strong>,
                                ul: ({ children }) => <Box component="ul" sx={{ pl: 1.5, mb: 0.5 }}>{children}</Box>,
                                li: ({ children }) => <Typography component="li" variant="caption" sx={{ lineHeight: 1.5, fontSize: '0.8rem', color: textPrimary }}>{children}</Typography>,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            <Typography variant="caption" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5, fontSize: '0.8rem', display: 'block', color: '#fff' }}>
                              {msg.text}
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.3,
                              opacity: 0.6,
                              fontSize: '0.58rem',
                              textAlign: msg.sender === 'user' ? 'right' : 'left',
                              color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : textSecondary,
                            }}
                          >
                            {msg.time}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}

                    {loading && (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: '#356AE6', pl: 1 }}>
                        <CircularProgress size={14} color="inherit" />
                        <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem', fontWeight: 600 }}>Analyzing records...</Typography>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Box>
                )}
              </Box>

              {/* Compact Input Capsule */}
              <Box sx={{ p: 1.5, bgcolor: bgSurface, borderTop: `1px solid ${dividerColor}` }}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: bgSurface,
                    boxShadow: insetShadow,
                    borderRadius: 3.5,
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
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: textPrimary,
                        fontSize: '0.825rem',
                        py: 0.5,
                        '&::placeholder': { color: textSecondary, opacity: 0.7 },
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    size="small"
                    sx={{
                      bgcolor: inputMessage.trim() ? '#356AE6' : bgSurface,
                      boxShadow: inputMessage.trim() ? '2px 2px 6px rgba(53, 106, 230, 0.4)' : raisedSubtle,
                      color: inputMessage.trim() ? '#fff' : textSecondary,
                      p: 0.6,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: inputMessage.trim() ? '#254EBF' : bgSurface },
                      '&.Mui-disabled': { bgcolor: bgSurface, color: textSecondary, opacity: 0.4, boxShadow: 'none' },
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
      <Tooltip title={open ? "Close Copilot" : "CrimeLens AI Copilot"} placement="left">
        <Fab
          onClick={() => setOpen(!open)}
          sx={{
            bgcolor: bgSurface,
            color: '#356AE6',
            width: 52,
            height: 52,
            boxShadow: open ? insetShadow : raisedShadow,
            border: `1px solid ${dividerColor}`,
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: bgSurface,
              transform: 'scale(1.05)',
            },
          }}
        >
          {open ? <CloseIcon /> : <RobotIcon fontSize="medium" />}
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default GlobalAiCopilot
