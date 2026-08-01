import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress, Grid,
  Chip, Divider, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Menu, MenuItem, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  FilePresent as FilePresentIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  AutoAwesome as SparklesIcon,
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

// ✅ Smart Chat Title Generator
const generateSmartTitle = (chatMessages) => {
  const userMessages = chatMessages.filter(m => m.type === 'user')
  if (userMessages.length === 0) return 'New Chat'

  const GREETINGS = ['hi', 'hii', 'hiii', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon']

  // Find first message that is NOT a simple greeting
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
  const [attachedFiles, setAttachedFiles] = useState([])
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
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

  // ✅ Dynamically update Chat Title based on meaningful user question
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#212121', color: '#ececec', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar - ChatGPT Style */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 260 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 260 : 0,
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
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: '1.1rem' }}>
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
              '&:hover': { bgcolor: '#212121', borderColor: '#666' },
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600,
              mb: 2,
              justifyContent: 'flex-start',
              px: 2,
            }}
          >
            New chat
          </Button>

          {/* Chat History */}
          <Typography variant="caption" sx={{ px: 1, mb: 1, color: '#8e8e8e', fontWeight: 600, fontSize: '0.7rem' }}>
            Recent Conversations ({chatHistory.length})
          </Typography>

          <List sx={{ flex: 1, overflowY: 'auto', px: 0 }}>
            {chatHistory.length === 0 ? (
              <Typography variant="caption" color="textSecondary" sx={{ px: 1 }}>No chat history yet</Typography>
            ) : (
              chatHistory.map((chat) => (
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
        <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #2f2f2f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#212121' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!sidebarOpen && (
              <IconButton onClick={() => setSidebarOpen(true)} size="small" sx={{ color: '#fff' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: '1rem' }}>
              CrimeLens Assistant
            </Typography>
            <Chip label="GPT-4o Intelligence" size="small" sx={{ bgcolor: '#10a37f', color: '#fff', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
          </Box>
          <Tooltip title="New Chat">
            <IconButton onClick={clearChat} sx={{ color: '#aaa' }}><RefreshIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>

        {/* Message Container */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {messages.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', my: 'auto' }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#10a37f', mb: 2 }}>
                <SparklesIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>
                How can I help you today?
              </Typography>
              <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 4, maxWidth: 500 }}>
                Ask CrimeLens AI about FIR records, 7-day predictive risk forecasts, cross-jurisdiction repeat offenders, or Modus Operandi (MO) signatures.
              </Typography>

              <Grid container spacing={2} sx={{ maxWidth: 800 }}>
                {SUGGESTED_PROMPTS.map((card, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper
                      onClick={() => handleSend(card.title)}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: '#2f2f2f',
                        border: '1px solid #3e3e3e',
                        borderRadius: 3,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: '#383838', borderColor: '#10a37f' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
              <Box key={message.id} sx={{ display: 'flex', gap: 2, maxWidth: '850px', width: '100%', mx: 'auto', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: message.type === 'user' ? '#383838' : '#10a37f', flexShrink: 0 }}>
                  {message.type === 'user' ? <PersonIcon fontSize="small" /> : <AIIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: message.type === 'user' ? '#2f2f2f' : 'transparent',
                      color: '#ececec',
                      border: message.type === 'user' ? '1px solid #3e3e3e' : 'none',
                    }}
                  >
                    {message.type === 'bot' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 1, fontSize: '0.95rem' }}>{children}</Typography>,
                          strong: ({ children }) => <strong style={{ color: '#10a37f' }}>{children}</strong>,
                          ul: ({ children }) => <Box component="ul" sx={{ pl: 2.5, mb: 1 }}>{children}</Box>,
                          li: ({ children }) => <Typography component="li" variant="body1" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>{children}</Typography>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem' }}>
                        {message.content}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>
            ))
          )}

          {loading && (
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '850px', width: '100%', mx: 'auto' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#10a37f' }}><AIIcon fontSize="small" /></Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
                <CircularProgress size={18} sx={{ color: '#10a37f' }} />
                <Typography variant="caption" sx={{ color: '#8e8e8e', fontWeight: 600 }}>Thinking...</Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* ChatGPT Style Capsule Input Bar */}
        <Box sx={{ p: 2, px: { xs: 2, md: 4 }, bgcolor: '#212121', display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={4}
            sx={{
              width: '100%',
              maxWidth: '850px',
              bgcolor: '#2f2f2f',
              border: '1px solid #3e3e3e',
              borderRadius: 4,
              p: 1,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconButton onClick={() => setFileDialogOpen(true)} sx={{ color: '#b4b4b4' }}>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Message CrimeLens AI..."
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