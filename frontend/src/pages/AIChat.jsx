import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Badge,
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
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api/ai'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDropzone } from 'react-dropzone'

// ✅ File type icons
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <ImageIcon />
  if (['pdf'].includes(ext)) return <PdfIcon />
  if (['doc', 'docx'].includes(ext)) return <DocIcon />
  return <FileIcon />
}

// ✅ Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ✅ Suggested prompts
const SUGGESTED_PROMPTS = [
  { icon: <TrendingUpIcon />, label: 'Analyze crime patterns in Bengaluru' },
  { icon: <LocationIcon />, label: 'Predict crime hotspots for next week' },
  { icon: <PeopleIcon />, label: 'Analyze suspect network connections' },
  { icon: <DescriptionIcon />, label: 'Generate monthly crime report' },
]

const AIChat = () => {
  // ✅ Load chats from localStorage
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ✅ File Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
    }))
    setAttachedFiles(prev => [...prev, ...newFiles])
    setFileDialogOpen(false)
    toast.success(`${acceptedFiles.length} file(s) attached`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10485760,
    multiple: true,
  })

  // ✅ Remove attached file
  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // ✅ Save chat history
  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  // ✅ Save current chat
  useEffect(() => {
    const hasUserMessages = messages.some(m => m.type === 'user')
    if (messages.length > 0 && hasUserMessages) {
      const chatId = currentChatId || Date.now()
      const firstUserMsg = messages.find(m => m.type === 'user')
      const title = firstUserMsg?.content?.substring(0, 30) || 'New Chat'
      
      const chatData = {
        id: chatId,
        messages: messages,
        title: title,
        date: new Date().toISOString(),
        preview: messages[messages.length - 1]?.content?.substring(0, 50) || '',
      }
      localStorage.setItem('aiCurrentChat', JSON.stringify(chatData))
      
      setChatHistory(prev => {
        const existing = prev.find(c => c.id === chatId)
        if (existing) {
          return prev.map(c => c.id === chatId ? chatData : c)
        }
        return [chatData, ...prev]
      })
    }
  }, [messages, currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ✅ AI Chat Mutation
  const chatMutation = useMutation({
    mutationFn: (data) => aiAPI.chat(data),
    onSuccess: (response) => {
      const aiResponse = response.data?.data?.response || 
        "I'm not sure how to respond to that. Could you rephrase your question? 🤔"
      
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

  // ✅ Handle logo click - Opens sidebar AND creates new chat
  const handleLogoClick = () => {
    // Clear chat (create new chat)
    setMessages([])
    setCurrentChatId(null)
    setAttachedFiles([])
    localStorage.removeItem('aiCurrentChat')
    
    // Open sidebar
    setSidebarOpen(true)
    
    toast.success('New chat started')
  }

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || loading) return

    let messageContent = input.trim()
    const fileList = attachedFiles.map(f => f.file)

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent || '📎 Please analyze the attached files.',
      timestamp: new Date().toISOString(),
      attachments: attachedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    const currentFiles = [...fileList]
    setInput('')
    setAttachedFiles([])
    setLoading(true)

    if (!currentChatId) {
      const newChatId = Date.now()
      setCurrentChatId(newChatId)
    }

    try {
      await chatMutation.mutateAsync({
        message: currentInput || 'Please analyze the attached files.',
        context: messages.slice(-3).map(m => `${m.type}: ${m.content}`).join('\n'),
        history: messages.slice(-5).map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        files: currentFiles,
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

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const handleDeleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      clearChat()
    }
    setAnchorEl(null)
    toast.success('Chat deleted')
  }

  const handleOpenChat = (chat) => {
    const existingChat = chatHistory.find(c => c.id === chat.id)
    if (existingChat && existingChat.messages?.length > 0) {
      setMessages(existingChat.messages)
      setCurrentChatId(chat.id)
      localStorage.setItem('aiCurrentChat', JSON.stringify(existingChat))
      toast.info(`Loaded: ${chat.title}`)
    } else {
      clearChat()
      toast.info('Started new chat')
    }
  }

  const handleMenuOpen = (event, chatId) => {
    setAnchorEl(event.currentTarget)
    setSelectedChatId(chatId)
  }

  const handleMenuClose = () => setAnchorEl(null)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getChatTitle = (chat) => {
    if (chat.title && chat.title !== 'New Chat') {
      return chat.title
    }
    const firstUserMsg = chat.messages?.find(m => m.type === 'user')
    return firstUserMsg?.content?.substring(0, 25) || 'New Chat'
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f7f8fc', overflow: 'hidden' }}>
      {/* ✅ Sidebar - ChatGPT Style */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 260 : 0,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 260 : 0,
            boxSizing: 'border-box',
            bgcolor: '#1a1a2e',
            color: '#ffffff',
            position: 'relative',
            height: '100vh',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ 
          p: sidebarOpen ? 2 : 0, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          alignItems: sidebarOpen ? 'stretch' : 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
        }}>
          {/* ✅ Logo - Click opens sidebar + new chat */}
          {!sidebarOpen ? (
            // ✅ Small logo when sidebar is closed - Click to open new chat
            <Tooltip title="New Chat" placement="right">
              <Box
                onClick={handleLogoClick}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10a37f, #1a7f64)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 163, 127, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 20px rgba(16, 163, 127, 0.6)',
                  },
                }}
              >
                <AIIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
            </Tooltip>
          ) : (
            // ✅ Full logo when sidebar is open
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3,
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10a37f, #1a7f64)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(16, 163, 127, 0.3)',
                  }}
                >
                  <AIIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
                  CrimeLens
                </Typography>
              </Box>
              <IconButton onClick={toggleSidebar} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}

          {/* ✅ New Chat Button - Only when open */}
          {sidebarOpen && (
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={clearChat}
              sx={{
                bgcolor: '#10a37f',
                color: '#fff',
                '&:hover': { bgcolor: '#0d8c6e' },
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                mb: 3,
              }}
            >
              New Chat
            </Button>
          )}

          {/* ✅ Chat History - Only when open */}
          {sidebarOpen && (
            <>
              <Typography variant="caption" sx={{ px: 1, mb: 1, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Recent Chats ({chatHistory.length})
              </Typography>

              <List sx={{ flex: 1, overflow: 'auto', px: 0 }}>
                {chatHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>No chats yet</Typography>
                  </Box>
                ) : (
                  chatHistory.map((chat) => {
                    const displayTitle = getChatTitle(chat)
                    return (
                      <ListItem key={chat.id} disablePadding sx={{ mb: 0.5, borderRadius: 1, bgcolor: currentChatId === chat.id ? 'rgba(16, 163, 127, 0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                        <ListItemButton onClick={() => handleOpenChat(chat)} sx={{ borderRadius: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <HistoryIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2" noWrap sx={{ color: currentChatId === chat.id ? '#10a37f' : 'rgba(255,255,255,0.8)' }}>{displayTitle}</Typography>}
                            secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }} noWrap>{chat.preview || 'Empty chat'}</Typography>}
                          />
                        </ListItemButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, chat.id)} sx={{ color: 'rgba(255,255,255,0.3)' }}>
                          <MoreVertIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </ListItem>
                    )
                  })
                )}
              </List>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <Box sx={{ pt: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)' }}>CrimeLens AI v2.0</Typography>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* ✅ Main Chat Area - Adjusts margin based on sidebar state */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f7f8fc', 
        height: '100vh', 
        position: 'relative',
        ml: sidebarOpen ? '260px' : '0px',
        transition: 'margin-left 0.3s ease',
        width: sidebarOpen ? 'calc(100% - 260px)' : '100%',
      }}>
        {/* Header */}
        <Box sx={{ p: 2, px: 4, borderBottom: '1px solid #e8ecf1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#ffffff', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!sidebarOpen && (
              <IconButton onClick={toggleSidebar} size="small">
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600} sx={{ color: '#1a1a2e' }}>CrimeLens AI</Typography>
            <Chip label="Beta" size="small" sx={{ bgcolor: '#10a37f', color: '#fff', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="New Chat"><IconButton onClick={clearChat} size="small"><RefreshIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', bgcolor: '#f7f8fc', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: '#d0d0d0', borderRadius: 3 } }}>
          
          {messages.length === 0 && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10a37f, #1a7f64)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AIIcon sx={{ color: '#fff', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" fontWeight={600} sx={{ color: '#1a1a2e' }}>How can I help you today?</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
                Ask me about crime patterns, predictions, network analysis, or upload files for analysis.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 2 }}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <Chip
                    key={idx}
                    icon={prompt.icon}
                    label={prompt.label}
                    onClick={() => { setInput(prompt.label); setTimeout(handleSend, 200) }}
                    sx={{ cursor: 'pointer', bgcolor: '#ffffff', border: '1px solid #e8ecf1', py: 1.5, height: 'auto', '&:hover': { bgcolor: '#f0f2f5', borderColor: '#10a37f' }, '& .MuiChip-label': { py: 0.5 } }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <Fade key={message.id} in timeout={300}>
                <Box sx={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, maxWidth: { xs: '90%', sm: '80%', md: '70%' }, flexDirection: message.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: message.type === 'user' ? '#1a1a2e' : '#10a37f', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      {message.type === 'user' ? <PersonIcon sx={{ fontSize: 18 }} /> : <AIIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                    <Box sx={{ maxWidth: '100%' }}>
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', bgcolor: message.type === 'user' ? '#1a1a2e' : '#ffffff', color: message.type === 'user' ? '#ffffff' : '#1a1a1a', border: message.type === 'bot' ? '1px solid #e8ecf1' : 'none', boxShadow: message.type === 'user' ? '0 2px 8px rgba(26,35,126,0.2)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                        {message.type === 'user' && message.attachments?.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {message.attachments.map((file, idx) => (
                              <Chip key={idx} icon={file.type?.startsWith('image/') ? <ImageIcon /> : <FilePresentIcon />} label={file.name} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }} />
                            ))}
                          </Box>
                        )}
                        {message.type === 'bot' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                            p: ({ children }) => <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 0.5 }}>{children}</Typography>,
                            strong: ({ children }) => <strong style={{ color: '#10a37f' }}>{children}</strong>,
                            ul: ({ children }) => <Box component="ul" sx={{ pl: 2, m: 0.5 }}>{children}</Box>,
                            li: ({ children }) => <Typography component="li" variant="body2" sx={{ lineHeight: 1.8 }}>{children}</Typography>,
                          }}>{message.content}</ReactMarkdown>
                        ) : (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.8, fontSize: '0.95rem' }}>{message.content}</Typography>
                        )}
                        {message.type === 'bot' && (
                          <Tooltip title="Copy">
                            <IconButton size="small" onClick={() => copyMessage(message.content)} sx={{ position: 'absolute', bottom: 4, right: 4, opacity: 0.3, '&:hover': { opacity: 1 }, color: '#666' }}>
                              <CopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Paper>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">{formatTime(message.timestamp)}</Typography>
                        {message.type === 'user' && <CheckCircleIcon sx={{ fontSize: 12, color: '#10a37f' }} />}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            ))}
          </AnimatePresence>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#10a37f' }}><AIIcon sx={{ fontSize: 18 }} /></Avatar>
                <Paper sx={{ p: 2.5, borderRadius: '16px 16px 16px 4px', bgcolor: '#ffffff', border: '1px solid #e8ecf1' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}><Box sx={{ width: 8, height: 8, bgcolor: '#10a37f', borderRadius: '50%' }} /></motion.div>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}><Box sx={{ width: 8, height: 8, bgcolor: '#10a37f', borderRadius: '50%' }} /></motion.div>
                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}><Box sx={{ width: 8, height: 8, bgcolor: '#10a37f', borderRadius: '50%' }} /></motion.div>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <Box sx={{ px: 4, py: 1, bgcolor: '#ffffff', borderTop: '1px solid #e8ecf1', display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {attachedFiles.map((file) => (
              <Chip key={file.id} icon={file.type?.startsWith('image/') ? <ImageIcon /> : getFileIcon(file.name)} label={`${file.name} (${formatFileSize(file.size)})`} onDelete={() => removeFile(file.id)} sx={{ bgcolor: '#f0f2f5' }} size="small" />
            ))}
            <Typography variant="caption" color="textSecondary">{attachedFiles.length} file(s) ready</Typography>
          </Box>
        )}

        {/* Input with File Upload */}
        <Box sx={{ p: 2.5, px: 4, borderTop: '1px solid #e8ecf1', bgcolor: '#ffffff', display: 'flex', gap: 1, alignItems: 'flex-end', flexShrink: 0 }}>
          <Tooltip title="Attach file or image">
            <IconButton onClick={() => setFileDialogOpen(true)} sx={{ color: '#666' }}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            ref={inputRef}
            placeholder="Message CrimeLens AI... (Attach files for analysis)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            disabled={loading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f7f8fc', '&:hover fieldset': { borderColor: '#10a37f' }, '& fieldset': { borderColor: 'transparent' }, '&.Mui-focused fieldset': { borderColor: '#10a37f' } } }}
          />
          <IconButton
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || loading}
            sx={{ bgcolor: '#10a37f', color: '#fff', borderRadius: 2, width: 52, height: 52, flexShrink: 0, '&:hover': { bgcolor: '#0d8c6e' }, '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* File Upload Dialog */}
      <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Attach Files</Typography>
          <IconButton onClick={() => setFileDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box {...getRootProps()} sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: isDragActive ? '#f0f2f5' : 'transparent', '&:hover': { bgcolor: '#f5f7fa' }, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <>
                <ImageIcon sx={{ fontSize: 60, color: '#10a37f' }} />
                <Typography variant="h6" color="primary">Drop files here...</Typography>
              </>
            ) : (
              <>
                <AttachFileIcon sx={{ fontSize: 60, color: '#999' }} />
                <Typography variant="h6">Drag & drop files here</Typography>
                <Typography variant="body2" color="textSecondary">or click to select files</Typography>
                <Typography variant="caption" color="textSecondary">Supported: Images, PDF, DOC, DOCX, TXT, CSV, XLS, XLSX (Max 10MB each)</Typography>
              </>
            )}
          </Box>
          {attachedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Attached Files ({attachedFiles.length})</Typography>
              {attachedFiles.map((file) => (
                <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {file.type?.startsWith('image/') ? <ImageIcon sx={{ color: '#10a37f' }} /> : <FilePresentIcon />}
                    <Typography variant="body2">{file.name}</Typography>
                    <Typography variant="caption" color="textSecondary">({formatFileSize(file.size)})</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removeFile(file.id)}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setFileDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setFileDialogOpen(false)} sx={{ bgcolor: '#10a37f', '&:hover': { bgcolor: '#0d8c6e' } }}>Done ({attachedFiles.length} files)</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => handleDeleteChat(selectedChatId)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete Chat
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AIChat