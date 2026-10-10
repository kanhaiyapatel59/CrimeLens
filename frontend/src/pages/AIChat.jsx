import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress, Grid,
  Chip, Divider, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Menu, MenuItem, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Badge,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
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
  { icon: <TrendingUpIcon sx={{ color: '#239B62' }} />, title: 'Analyze Crime Trends', subtitle: 'State-wide district forecasts & risk scores' },
  { icon: <LocationIcon sx={{ color: '#D99118' }} />, title: 'Predict Hotspots', subtitle: '7-day diurnal high-risk areas' },
  { icon: <PeopleIcon sx={{ color: '#356AE6' }} />, title: 'Repeat Suspects', subtitle: 'Cross-jurisdiction offender profiling' },
  { icon: <DescriptionIcon sx={{ color: '#8E44AD' }} />, title: 'Executive Report', subtitle: 'SCRB briefing & dispatch directives' },
]

const INTELLIGENCE_MODES = [
  { id: 'all', label: 'All Intelligence', icon: SparklesIcon },
  { id: 'trends', label: 'Crime Trends', icon: TrendingUpIcon },
  { id: 'hotspots', label: 'Hotspot Matrix', icon: LocationIcon },
  { id: 'suspects', label: 'Offender Profiles', icon: PeopleIcon },
  { id: 'executive', label: 'Executive Briefing', icon: DescriptionIcon },
]

// Smart Chat Title Generator
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
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: bgSurface, color: textPrimary, overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar - Neumorphic History Drawer */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 280 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 280 : 0,
            boxSizing: 'border-box',
            bgcolor: bgSurface,
            color: textPrimary,
            position: 'relative',
            height: '100%',
            borderRight: `1px solid ${dividerColor}`,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#356AE6', width: 34, height: 34, boxShadow: '3px 3px 8px rgba(53, 106, 230, 0.4)' }}>
                <AIIcon fontSize="small" sx={{ color: '#fff' }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: textPrimary, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  CrimeLens AI
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.7rem' }}>
                  Karnataka Intelligence
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setSidebarOpen(false)}
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
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* New Chat Button */}
          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={clearChat}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: '#356AE6',
              borderRadius: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              mb: 2,
              justifyContent: 'flex-start',
              px: 2,
              border: `1px solid ${dividerColor}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: bgSurface,
                boxShadow: insetShadow,
                transform: 'none',
              },
            }}
          >
            New Session
          </Button>

          {/* Search Chat History Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              boxShadow: insetShadow,
              bgcolor: bgSurface,
              mb: 2,
            }}
          >
            <SearchIcon sx={{ color: textSecondary, fontSize: 18, mr: 1 }} />
            <TextField
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                  color: textPrimary,
                  fontSize: '0.8rem',
                  py: 0.5,
                  '&::placeholder': { color: textSecondary, opacity: 0.7 },
                },
              }}
            />
          </Box>

          {/* Chat History List */}
          <Typography variant="caption" sx={{ px: 1, mb: 1, color: textSecondary, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Past Records ({filteredHistory.length})
          </Typography>

          <List sx={{ flex: 1, overflowY: 'auto', px: 0, pr: 0.5 }}>
            {filteredHistory.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: textSecondary }}>No conversations found</Typography>
              </Box>
            ) : (
              filteredHistory.map((chat) => {
                const isActive = currentChatId === chat.id
                return (
                  <ListItem
                    key={chat.id}
                    disablePadding
                    sx={{ mb: 1 }}
                    secondaryAction={
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        sx={{
                          color: textSecondary,
                          opacity: 0.6,
                          '&:hover': { color: '#D94F55', opacity: 1 },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleOpenChat(chat)}
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: bgSurface,
                        boxShadow: isActive ? insetShadow : raisedSubtle,
                        py: 0.8,
                        px: 1.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: bgSurface,
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              color: isActive ? '#356AE6' : textPrimary,
                              fontWeight: isActive ? 700 : 500,
                              fontSize: '0.8rem',
                            }}
                          >
                            {chat.title}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })
            )}
          </List>

          <Divider sx={{ borderColor: dividerColor, my: 1.5 }} />
          <Typography variant="caption" sx={{ color: textSecondary, textAlign: 'center', fontSize: '0.7rem' }}>
            CrimeLens Llama 3.3 70B • KSP AI
          </Typography>
        </Box>
      </Drawer>

      {/* Main Chat Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: bgSurface, position: 'relative', overflow: 'hidden' }}>
        {/* Top Header */}
        <Box
          sx={{
            p: 2,
            px: 3,
            borderBottom: `1px solid ${dividerColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: bgSurface,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!sidebarOpen && (
              <IconButton
                onClick={() => setSidebarOpen(true)}
                size="small"
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: textPrimary,
                  '&:hover': { color: '#356AE6' },
                }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={800} sx={{ color: textPrimary, fontSize: '0.95rem' }}>
              CrimeLens Intelligence Assistant
            </Typography>
            <Chip
              label="Llama 3.3 70B Enterprise"
              size="small"
              sx={{
                bgcolor: 'rgba(53, 106, 230, 0.12)',
                color: '#356AE6',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 22,
                borderRadius: 2,
              }}
            />
          </Box>

          {/* Intelligence Mode Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
            {INTELLIGENCE_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id
              return (
                <Chip
                  key={mode.id}
                  icon={<mode.icon style={{ fontSize: 14, color: isSelected ? '#356AE6' : textSecondary }} />}
                  label={mode.label}
                  size="small"
                  onClick={() => setSelectedMode(mode.id)}
                  sx={{
                    bgcolor: bgSurface,
                    boxShadow: isSelected ? insetShadow : raisedSubtle,
                    color: isSelected ? '#356AE6' : textSecondary,
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: bgSurface,
                    },
                  }}
                />
              )
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export Chat Markdown">
              <IconButton
                size="small"
                onClick={handleExportChat}
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: textSecondary,
                  '&:hover': { color: '#356AE6' },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Chat Session">
              <IconButton
                size="small"
                onClick={clearChat}
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: raisedSubtle,
                  color: textSecondary,
                  '&:hover': { color: '#356AE6' },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Message Container */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {messages.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', my: 'auto', px: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: bgSurface,
                  boxShadow: raisedShadow,
                  mb: 2.5,
                  color: '#356AE6',
                }}
              >
                <SparklesIcon sx={{ fontSize: 34, color: '#356AE6' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={800} sx={{ color: textPrimary, mb: 1, letterSpacing: -0.3 }}>
                How can I assist your investigation today?
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 4, maxWidth: 540, lineHeight: 1.6 }}>
                Ask CrimeLens AI about FIR records, 7-day predictive risk forecasts, cross-jurisdiction repeat offenders, or Modus Operandi (MO) signatures.
              </Typography>

              <Grid container spacing={2.5} sx={{ maxWidth: 840 }}>
                {SUGGESTED_PROMPTS.map((card, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper
                      onClick={() => handleSend(card.title)}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: bgSurface,
                        boxShadow: raisedShadow,
                        borderRadius: 3.5,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.25s ease',
                        border: 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '9px 9px 20px #B8C0CC, -9px -9px 20px #FFFFFF',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        {card.icon}
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: textPrimary }}>{card.title}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: textSecondary }}>{card.subtitle}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  maxWidth: '850px',
                  width: '100%',
                  mx: 'auto',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: message.type === 'user' ? '#356AE6' : bgSurface,
                    color: message.type === 'user' ? '#fff' : '#356AE6',
                    boxShadow: message.type === 'user' ? '2px 2px 8px rgba(53, 106, 230, 0.4)' : raisedSubtle,
                    flexShrink: 0,
                  }}
                >
                  {message.type === 'user' ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
                </Avatar>

                <Box sx={{ flex: 1, maxWidth: '85%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3.5,
                      bgcolor: message.type === 'user' ? '#356AE6' : bgSurface,
                      color: message.type === 'user' ? '#fff' : textPrimary,
                      boxShadow: message.type === 'user'
                        ? '4px 4px 12px rgba(53, 106, 230, 0.35)'
                        : raisedShadow,
                      border: 'none',
                    }}
                  >
                    {message.type === 'bot' ? (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 1.2, fontSize: '0.92rem', color: textPrimary }}>
                                {children}
                              </Typography>
                            ),
                            strong: ({ children }) => <strong style={{ color: '#356AE6', fontWeight: 700 }}>{children}</strong>,
                            ul: ({ children }) => <Box component="ul" sx={{ pl: 2.5, mb: 1.2 }}>{children}</Box>,
                            li: ({ children }) => (
                              <Typography component="li" variant="body1" sx={{ lineHeight: 1.7, fontSize: '0.92rem', color: textPrimary }}>
                                {children}
                              </Typography>
                            ),
                            table: ({ children }) => (
                              <Box
                                component="table"
                                sx={{
                                  borderCollapse: 'collapse',
                                  width: '100%',
                                  my: 1.5,
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  boxShadow: insetShadow,
                                }}
                              >
                                {children}
                              </Box>
                            ),
                            th: ({ children }) => (
                              <Box component="th" sx={{ p: 1.2, bgcolor: isDark ? '#222736' : '#DFE5EE', color: textPrimary, fontWeight: 700, fontSize: '0.8rem', textAlign: 'left' }}>
                                {children}
                              </Box>
                            ),
                            td: ({ children }) => (
                              <Box component="td" sx={{ p: 1, borderTop: `1px solid ${dividerColor}`, fontSize: '0.85rem', color: textPrimary }}>
                                {children}
                              </Box>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {/* Interactive Bot Message Action Bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: `1px solid ${dividerColor}` }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Copy Response">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyMessage(message.content)}
                                sx={{
                                  bgcolor: bgSurface,
                                  boxShadow: raisedSubtle,
                                  color: textSecondary,
                                  '&:hover': { color: '#356AE6' },
                                }}
                              >
                                <CopyIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={speakingId === message.id ? 'Stop Reading' : 'Read Aloud'}>
                              <IconButton
                                size="small"
                                onClick={() => handleSpeak(message.content, message.id)}
                                sx={{
                                  bgcolor: bgSurface,
                                  boxShadow: speakingId === message.id ? insetShadow : raisedSubtle,
                                  color: speakingId === message.id ? '#239B62' : textSecondary,
                                  '&:hover': { color: '#239B62' },
                                }}
                              >
                                <SpeakerIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRateResponse(message.id, 'up')}
                              sx={{
                                bgcolor: bgSurface,
                                boxShadow: ratings[message.id] === 'up' ? insetShadow : raisedSubtle,
                                color: ratings[message.id] === 'up' ? '#239B62' : textSecondary,
                              }}
                            >
                              <ThumbUpIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRateResponse(message.id, 'down')}
                              sx={{
                                bgcolor: bgSurface,
                                boxShadow: ratings[message.id] === 'down' ? insetShadow : raisedSubtle,
                                color: ratings[message.id] === 'down' ? '#D94F55' : textSecondary,
                              }}
                            >
                              <ThumbDownIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.92rem', color: '#fff' }}>
                          {message.content}
                        </Typography>
                        {message.attachments?.length > 0 && (
                          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {message.attachments.map((att, idx) => (
                              <Chip
                                key={idx}
                                icon={<AttachFileIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
                                label={att.name}
                                size="small"
                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: '#fff', borderRadius: 2 }}
                              />
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
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '850px', width: '100%', mx: 'auto' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: bgSurface, boxShadow: raisedSubtle, color: '#356AE6' }}>
                <AIIcon fontSize="small" />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  px: 2.5,
                  borderRadius: 3.5,
                  bgcolor: bgSurface,
                  boxShadow: raisedShadow,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={16} sx={{ color: '#356AE6' }} />
                <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 700, letterSpacing: 0.2 }}>
                  Analyzing Karnataka CrimeLens records & intelligence database...
                </Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Attached Files Bar */}
        {attachedFiles.length > 0 && (
          <Box sx={{ px: { xs: 2, md: 3 }, py: 1, bgcolor: bgSurface, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: '850px', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {attachedFiles.map((file) => (
                <Chip
                  key={file.id}
                  label={file.name}
                  onDelete={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                  size="small"
                  sx={{ bgcolor: bgSurface, boxShadow: raisedSubtle, color: textPrimary, borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Animated Audio Waveform Visualizer when Voice Input Active */}
        {isListening && (
          <Box sx={{ px: { xs: 2, md: 3 }, py: 1, bgcolor: bgSurface, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 3,
                bgcolor: bgSurface,
                boxShadow: insetShadow,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ color: '#239B62', letterSpacing: 0.5 }}>
                🎙️ LISTENING TO POLICE INVESTIGATOR VOICE COMMAND...
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 20 }}>
                <Box sx={{ width: 3, height: 12, bgcolor: '#239B62', borderRadius: 1, animation: 'audioPulse 0.8s ease-in-out infinite alternate' }} />
                <Box sx={{ width: 3, height: 20, bgcolor: '#239B62', borderRadius: 1, animation: 'audioPulse 0.8s ease-in-out infinite alternate 0.2s' }} />
                <Box sx={{ width: 3, height: 16, bgcolor: '#239B62', borderRadius: 1, animation: 'audioPulse 0.8s ease-in-out infinite alternate 0.4s' }} />
                <Box sx={{ width: 3, height: 22, bgcolor: '#239B62', borderRadius: 1, animation: 'audioPulse 0.8s ease-in-out infinite alternate 0.6s' }} />
                <Box sx={{ width: 3, height: 10, bgcolor: '#239B62', borderRadius: 1, animation: 'audioPulse 0.8s ease-in-out infinite alternate 0.8s' }} />
              </Box>
            </Paper>
          </Box>
        )}

        {/* Neumorphic Capsule Input Bar */}
        <Box sx={{ pt: 1.5, pb: { xs: 2.5, md: 3.5 }, px: { xs: 2, md: 3 }, bgcolor: bgSurface, display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: '850px',
              bgcolor: bgSurface,
              boxShadow: isListening ? '0 0 0 2px #239B62, ' + raisedShadow : raisedShadow,
              borderRadius: 4,
              p: 1,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <IconButton
              onClick={() => setFileDialogOpen(true)}
              size="small"
              sx={{
                bgcolor: bgSurface,
                boxShadow: raisedSubtle,
                color: textSecondary,
                '&:hover': { color: '#356AE6' },
              }}
            >
              <AttachFileIcon fontSize="small" />
            </IconButton>

            <Tooltip title={isListening ? 'Listening...' : 'Voice Dictation'}>
              <IconButton
                onClick={toggleListening}
                size="small"
                sx={{
                  bgcolor: bgSurface,
                  boxShadow: isListening ? insetShadow : raisedSubtle,
                  color: isListening ? '#D94F55' : textSecondary,
                  '&:hover': { color: '#356AE6' },
                }}
              >
                {isListening ? <MicOffIcon fontSize="small" sx={{ color: '#D94F55' }} /> : <MicIcon fontSize="small" />}
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
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{
                px: 1,
                '& .MuiInputBase-input': {
                  color: textPrimary,
                  fontSize: '0.92rem',
                  py: 0.5,
                  '&::placeholder': { color: textSecondary, opacity: 0.7 },
                },
              }}
            />

            <IconButton
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachedFiles.length === 0) || loading}
              sx={{
                bgcolor: input.trim() ? '#356AE6' : bgSurface,
                boxShadow: input.trim() ? '3px 3px 10px rgba(53, 106, 230, 0.4)' : raisedSubtle,
                color: input.trim() ? '#fff' : textSecondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: input.trim() ? '#254EBF' : bgSurface,
                },
                '&.Mui-disabled': {
                  bgcolor: bgSurface,
                  color: textSecondary,
                  opacity: 0.4,
                  boxShadow: 'none',
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {/* File Upload Modal */}
      <Dialog
        open={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: bgSurface,
            borderRadius: 4,
            boxShadow: raisedShadow,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: bgSurface, color: textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.05rem' }}>Attach Case Documents</Typography>
          <IconButton
            onClick={() => setFileDialogOpen(false)}
            size="small"
            sx={{ bgcolor: bgSurface, boxShadow: raisedSubtle, color: textSecondary }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: bgSurface }}>
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${dividerColor}`,
              borderRadius: 3.5,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: bgSurface,
              boxShadow: insetShadow,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#356AE6',
              },
            }}
          >
            <input {...getInputProps()} />
            <AttachFileIcon sx={{ fontSize: 44, color: '#356AE6', mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: textPrimary }}>Drag & drop case files here</Typography>
            <Typography variant="caption" sx={{ color: textSecondary }}>Supported: Images, PDF, TXT, CSV (Max 10MB)</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: bgSurface, p: 2.5 }}>
          <Button
            onClick={() => setFileDialogOpen(false)}
            sx={{
              bgcolor: bgSurface,
              boxShadow: raisedSubtle,
              color: textSecondary,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setFileDialogOpen(false)}
            sx={{
              bgcolor: '#356AE6',
              boxShadow: '3px 3px 10px rgba(53, 106, 230, 0.4)',
              color: '#fff',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#254EBF' },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AIChat