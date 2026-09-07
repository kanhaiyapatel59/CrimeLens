import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress, Grid,
  Chip, Divider, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Menu, MenuItem, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Badge,
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  AutoAwesome as SparklesIcon,
  Search as SearchIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as SpeakerIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Download as DownloadIcon,
  Tune as TuneIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api/ai'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDropzone } from 'react-dropzone'

const SUGGESTED_PROMPTS = [
  { icon: <TrendingUpIcon sx={{ color: '#10a37f' }} />, title: 'Analyze Crime Trends', subtitle: 'State-wide district forecasts & risk scores' },
  { icon: <LocationIcon sx={{ color: '#ff9800' }} />, title: 'Predict Hotspots', subtitle: '7-day diurnal high-risk areas' },
  { icon: <PeopleIcon sx={{ color: '#e91e63' }} />, title: 'Repeat Suspects', subtitle: 'Cross-jurisdiction offender profiling' },
  { icon: <DescriptionIcon sx={{ color: '#9c27b0' }} />, title: 'Executive Report', subtitle: 'SCRB briefing & dispatch directives' },
]

const INTELLIGENCE_MODES = [
  { id: 'all', label: 'All Intelligence', icon: SparklesIcon },
  { id: 'trends', label: 'Crime Trends', icon: TrendingUpIcon },
  { id: 'hotspots', label: 'Hotspot Matrix', icon: LocationIcon },
  { id: 'suspects', label: 'Offender Profiles', icon: PeopleIcon },
  { id: 'executive', label: 'Executive Briefing', icon: DescriptionIcon },
]

// ✅ Smart Chat Title Generator
const generateSmartTitle = (chatMessages) => {
  const userMessages = chatMessages.filter(m => m.type === 'user')
  if (userMessages.length === 0) return 'New Chat'

  const GREETINGS = ['hi', 'hii', 'hiii', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon']

  const meaningfulMsg = userMessages.find(m => {
    const text = (m.content || '').trim().toLowerCase()
    return !GREETINGS.includes(text)
  })

  if (meaningfulMsg) {
    const text = meaningfulMsg.content.trim()
    return text.length > 28 ? text.substring(0, 28) + '...' : text
  }

  const firstText = userMessages[0].content.trim()
  return firstText.length > 28 ? firstText.substring(0, 28) + '...' : firstText
}

const AIChat = () => {
  const loadChatsFromStorage = () => {
    try {
      const saved = localStorage.getItem('aiChatHistory')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const loadCurrentChatFromStorage = () => {
    try {
      const saved = localStorage.getItem('aiCurrentChat')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  const [chatHistory, setChatHistory] = useState(loadChatsFromStorage)
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState(() => {
    const saved = loadCurrentChatFromStorage()
    if (saved?.messages?.length > 0) return saved.messages
    return []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMode, setSelectedMode] = useState('all')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(null)
  const [ratings, setRatings] = useState({})

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }))
    setAttachedFiles(prev => [...prev, ...newFiles])
    setFileDialogOpen(false)
    toast.success(`${acceptedFiles.length} file(s) attached`)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: 10485760,
  })

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  // Dynamically update Chat Title based on meaningful user question
  useEffect(() => {
    const hasUserMessages = messages.some(m => m.type === 'user')
    if (messages.length > 0 && hasUserMessages) {
      const chatId = currentChatId || Date.now()
      const title = generateSmartTitle(messages)

      const chatData = {
        id: chatId,
        messages: messages,
        title: title,
        date: new Date().toISOString(),
        preview: messages[messages.length - 1]?.content?.substring(0, 50) || '',
      }
      localStorage.setItem('aiCurrentChat', JSON.stringify(chatData))

      setChatHistory(prev => {
        const existingIndex = prev.findIndex(c => c.id === chatId)
        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = chatData
          return updated
        }
        return [chatData, ...prev]
      })
    }
  }, [messages, currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Voice Dictation Toggle
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
      setIsListening(false)
      toast.success('Voice captured!')
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Voice recognition error')
    }
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  // Text-to-Speech Read Aloud
  const handleSpeak = (text, id) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[#*`>|-]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  // Copy Response to Clipboard
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Response copied to clipboard!')
  }

  // Rate AI Response
  const handleRateResponse = (msgId, type) => {
    setRatings(prev => ({ ...prev, [msgId]: type }))
    toast.success(type === 'up' ? 'Feedback recorded! 👍' : 'Feedback recorded! 👎')
  }

  // Export Entire Chat Transcript
  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error('No chat messages to export')
      return
    }
    const textContent = messages.map(m => `[${m.type.toUpperCase()}] (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n`).join('\n---\n\n')
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `CrimeLens_AIChat_${Date.now()}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Chat transcript exported!')
  }

  const chatMutation = useMutation({
    mutationFn: (data) => aiAPI.chat(data),
    onSuccess: (response) => {
      const aiResponse = response.data?.data?.response || response.data?.response || 
        "Hi! 👋 How can I assist you with your crime investigation or case analytics today?"

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        },
      ])
      setLoading(false)
    },
    onError: () => {
      toast.error('Failed to get AI response. Please try again.')
      setLoading(false)
    },
  })

  const handleSend = async (customPrompt = null) => {
    const messageToSend = customPrompt || input.trim()
    if ((!messageToSend && attachedFiles.length === 0) || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend || '📎 Please analyze attached files.',
      timestamp: new Date().toISOString(),
      attachments: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
    }

    setMessages(prev => [...prev, userMessage])
    if (!customPrompt) setInput('')
    setAttachedFiles([])
    setLoading(true)

    if (!currentChatId) {
      setCurrentChatId(Date.now())
    }

    try {
      await chatMutation.mutateAsync({
        message: messageToSend || 'Please analyze attached files.',
        history: messages.slice(-6).map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      })
    } catch (error) {
      console.error('Chat error:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setAttachedFiles([])
    localStorage.removeItem('aiCurrentChat')
    toast.success('New chat started')
  }

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation()
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) clearChat()
    toast.success('Chat deleted')
  }

  const handleOpenChat = (chat) => {
    const existingChat = chatHistory.find(c => c.id === chat.id)
    if (existingChat && existingChat.messages?.length > 0) {
      setMessages(existingChat.messages)
      setCurrentChatId(chat.id)
      localStorage.setItem('aiCurrentChat', JSON.stringify(existingChat))
    }
  }

  const filteredHistory = chatHistory.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#212121', color: '#ececec', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - ChatGPT Style */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 280 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 280 : 0,
            boxSizing: 'border-box',
            bgcolor: '#171717',
            color: '#ececec',
            height: '100vh',
            borderRight: '1px solid #2f2f2f',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#10a37f', width: 32, height: 32 }}>
                <AIIcon fontSize="small" sx={{ color: '#fff' }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: '1.05rem' }}>
                CrimeLens AI
              </Typography>
            </Box>
            <IconButton onClick={() => setSidebarOpen(false)} size="small" sx={{ color: '#8e8e8e' }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          {/* New Chat Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={clearChat}
            sx={{
              borderColor: '#3e3e3e',
              color: '#fff',
              '&:hover': { bgcolor: '#212121', borderColor: '#10a37f' },
              borderRadius: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              mb: 2,
              justifyContent: 'flex-start',
              px: 2,
            }}
          >
            New chat
          </Button>

          {/* Search Chat History Bar */}
          <TextField
            size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiInputBase-input': { color: '#fff', fontSize: '0.8rem', py: 0.8 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#212121',
                borderRadius: 2,
                '& fieldset': { borderColor: '#2f2f2f' },
                '&:hover fieldset': { borderColor: '#444' },
              },
            }}
          />

          {/* Chat History List */}
          <Typography variant="caption" sx={{ px: 1, mb: 1, color: '#8e8e8e', fontWeight: 600, fontSize: '0.7rem' }}>
            Recent Conversations ({filteredHistory.length})
          </Typography>

          <List sx={{ flex: 1, overflowY: 'auto', px: 0 }}>
            {filteredHistory.length === 0 ? (
              <Typography variant="caption" color="textSecondary" sx={{ px: 1 }}>No chats found</Typography>
            ) : (
              filteredHistory.map((chat) => (
                <ListItem
                  key={chat.id}
                  disablePadding
                  sx={{ mb: 0.5 }}
                  secondaryAction={
                    <IconButton size="small" onClick={(e) => handleDeleteChat(chat.id, e)} sx={{ color: '#666', '&:hover': { color: '#f44336' } }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleOpenChat(chat)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: currentChatId === chat.id ? '#2f2f2f' : 'transparent',
                      '&:hover': { bgcolor: '#212121' },
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="body2" noWrap sx={{ color: currentChatId === chat.id ? '#10a37f' : '#ececec', fontWeight: 500, fontSize: '0.85rem' }}>{chat.title}</Typography>}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>

          <Divider sx={{ borderColor: '#2f2f2f', my: 1 }} />
          <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
            CrimeLens Llama 3.3 70B • KSP AI
          </Typography>
        </Box>
      </Drawer>

      {/* Main ChatGPT Chat Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#212121', height: '100vh', position: 'relative' }}>
        {/* Top Header */}
        <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #2f2f2f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#212121', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!sidebarOpen && (
              <IconButton onClick={() => setSidebarOpen(true)} size="small" sx={{ color: '#fff' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: '1rem' }}>
              CrimeLens Intelligence Assistant
            </Typography>
            <Chip label="Llama 3.3 70B Enterprise" size="small" sx={{ bgcolor: '#10a37f', color: '#fff', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
          </Box>

          {/* Intelligence Mode Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
            {INTELLIGENCE_MODES.map((mode) => (
              <Chip
                key={mode.id}
                icon={<mode.icon style={{ fontSize: 14, color: selectedMode === mode.id ? '#fff' : '#a1a1aa' }} />}
                label={mode.label}
                size="small"
                onClick={() => setSelectedMode(mode.id)}
                sx={{
                  bgcolor: selectedMode === mode.id ? '#10a37f' : '#2f2f2f',
                  color: selectedMode === mode.id ? '#fff' : '#a1a1aa',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: selectedMode === mode.id ? '#0d8c6e' : '#383838' },
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export Chat Markdown">
              <IconButton onClick={handleExportChat} sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Chat">
              <IconButton onClick={clearChat} sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Message Container */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {messages.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', my: 'auto' }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#10a37f', mb: 2 }}>
                <SparklesIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
                How can I help you today?
              </Typography>
              <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 4, maxWidth: 550 }}>
                Ask CrimeLens AI about FIR records, 7-day predictive risk forecasts, cross-jurisdiction repeat offenders, or Modus Operandi (MO) signatures.
              </Typography>

              <Grid container spacing={2} sx={{ maxWidth: 850 }}>
                {SUGGESTED_PROMPTS.map((card, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper
                      onClick={() => handleSend(card.title)}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: '#2f2f2f',
                        border: '1px solid #3e3e3e',
                        borderRadius: 3,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#383838', borderColor: '#10a37f', transform: 'translateY(-2px)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        {card.icon}
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>{card.title}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#b4b4b4' }}>{card.subtitle}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            messages.map((message) => (
              <Box key={message.id} sx={{ display: 'flex', gap: 2, maxWidth: '900px', width: '100%', mx: 'auto', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: message.type === 'user' ? '#383838' : '#10a37f', flexShrink: 0 }}>
                  {message.type === 'user' ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: message.type === 'user' ? '#2f2f2f' : '#1a1a1a',
                      color: '#ececec',
                      border: message.type === 'user' ? '1px solid #3e3e3e' : '1px solid #2f2f2f',
                    }}
                  >
                    {message.type === 'bot' ? (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 1, fontSize: '0.95rem' }}>{children}</Typography>,
                            strong: ({ children }) => <strong style={{ color: '#10a37f' }}>{children}</strong>,
                            ul: ({ children }) => <Box component="ul" sx={{ pl: 2.5, mb: 1 }}>{children}</Box>,
                            li: ({ children }) => <Typography component="li" variant="body1" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>{children}</Typography>,
                            table: ({ children }) => <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', my: 1, border: '1px solid #333' }}>{children}</Box>,
                            th: ({ children }) => <Box component="th" sx={{ border: '1px solid #333', p: 1, bgcolor: '#27272a', fontWeight: 700 }}>{children}</Box>,
                            td: ({ children }) => <Box component="td" sx={{ border: '1px solid #333', p: 1 }}>{children}</Box>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {/* Interactive Bot Message Action Bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #2a2a2a' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Copy Response">
                              <IconButton size="small" onClick={() => handleCopyMessage(message.content)} sx={{ color: '#8e8e8e', '&:hover': { color: '#fff' } }}>
                                <CopyIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={speakingId === message.id ? 'Stop Reading' : 'Read Aloud'}>
                              <IconButton size="small" onClick={() => handleSpeak(message.content, message.id)} sx={{ color: speakingId === message.id ? '#10a37f' : '#8e8e8e', '&:hover': { color: '#fff' } }}>
                                <SpeakerIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <IconButton size="small" onClick={() => handleRateResponse(message.id, 'up')} sx={{ color: ratings[message.id] === 'up' ? '#10a37f' : '#666' }}>
                              <ThumbUpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleRateResponse(message.id, 'down')} sx={{ color: ratings[message.id] === 'down' ? '#f44336' : '#666' }}>
                              <ThumbDownIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem' }}>
                          {message.content}
                        </Typography>
                        {message.attachments?.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {message.attachments.map((att, idx) => (
                              <Chip key={idx} icon={<AttachFileIcon sx={{ fontSize: 14 }} />} label={att.name} size="small" sx={{ bgcolor: '#383838', color: '#fff' }} />
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                </Box>
              </Box>
            ))
          )}

          {loading && (
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '900px', width: '100%', mx: 'auto' }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#10a37f' }}><AIIcon fontSize="small" /></Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
                <CircularProgress size={18} sx={{ color: '#10a37f' }} />
                <Typography variant="caption" sx={{ color: '#8e8e8e', fontWeight: 600 }}>Analyzing Karnataka CrimeLens records...</Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Attached Files Bar */}
        {attachedFiles.length > 0 && (
          <Box sx={{ px: { xs: 2, md: 4 }, py: 1, bgcolor: '#212121', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: '900px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {attachedFiles.map((file) => (
                <Chip
                  key={file.id}
                  label={file.name}
                  onDelete={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                  size="small"
                  sx={{ bgcolor: '#2f2f2f', color: '#fff', borderColor: '#3e3e3e' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* ChatGPT Style Capsule Input Bar */}
        <Box sx={{ p: 2, px: { xs: 2, md: 4 }, bgcolor: '#212121', display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={4}
            sx={{
              width: '100%',
              maxWidth: '900px',
              bgcolor: '#2f2f2f',
              border: isListening ? '1px solid #10a37f' : '1px solid #3e3e3e',
              borderRadius: 4,
              p: 1,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'border 0.2s ease',
            }}
          >
            <IconButton onClick={() => setFileDialogOpen(true)} sx={{ color: '#b4b4b4' }}>
              <AttachFileIcon />
            </IconButton>

            <Tooltip title={isListening ? 'Listening...' : 'Voice Dictation'}>
              <IconButton onClick={toggleListening} sx={{ color: isListening ? '#10a37f' : '#b4b4b4' }}>
                {isListening ? <MicOffIcon sx={{ color: '#f44336' }} /> : <MicIcon />}
              </IconButton>
            </Tooltip>

            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Message CrimeLens AI Assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                '& .MuiInputBase-input': { color: '#fff', fontSize: '0.95rem' },
                '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
              }}
            />

            <IconButton
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachedFiles.length === 0) || loading}
              sx={{
                bgcolor: input.trim() ? '#10a37f' : '#3e3e3e',
                color: '#fff',
                '&:hover': { bgcolor: '#0d8c6e' },
                '&.Mui-disabled': { bgcolor: '#3e3e3e', color: '#666' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {/* File Upload Modal */}
      <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#212121', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Attach Files</Typography>
          <IconButton onClick={() => setFileDialogOpen(false)} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#212121' }}>
          <Box {...getRootProps()} sx={{ border: '2px dashed #444', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: '#2f2f2f' }}>
            <input {...getInputProps()} />
            <AttachFileIcon sx={{ fontSize: 48, color: '#10a37f', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#fff' }}>Drag & drop files here</Typography>
            <Typography variant="caption" sx={{ color: '#aaa' }}>Supported: Images, PDF, TXT, CSV (Max 10MB)</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#212121', p: 2 }}>
          <Button onClick={() => setFileDialogOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setFileDialogOpen(false)} sx={{ bgcolor: '#10a37f' }}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AIChat