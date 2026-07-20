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
  useTheme,
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
  Share as ShareIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api/ai'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AIChat = () => {
  const theme = useTheme()
  
  // ✅ Load chats from localStorage
  const loadChatsFromStorage = () => {
    const saved = localStorage.getItem('aiChatHistory')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return []
      }
    }
    return []
  }

  const loadCurrentChatFromStorage = () => {
    const saved = localStorage.getItem('aiCurrentChat')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return null
      }
    }
    return null
  }

  const [chatHistory, setChatHistory] = useState(loadChatsFromStorage())
  const [currentChatId, setCurrentChatId] = useState(null)
  const [messages, setMessages] = useState(() => {
    const saved = loadCurrentChatFromStorage()
    if (saved && saved.messages && saved.messages.length > 0) {
      return saved.messages
    }
    return [
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm CrimeLens AI. How can I help you with crime analysis today?",
        timestamp: new Date().toISOString(),
      },
    ]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ✅ Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  // ✅ Save current chat to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const chatData = {
        id: currentChatId || Date.now(),
        messages: messages,
        title: messages[0]?.content?.substring(0, 30) || 'New Chat',
        date: new Date().toISOString(),
        preview: messages[messages.length - 1]?.content?.substring(0, 50) || '',
      }
      localStorage.setItem('aiCurrentChat', JSON.stringify(chatData))
    }
  }, [messages, currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const chatMutation = useMutation({
    mutationFn: (data) => aiAPI.chat(data),
    onSuccess: (response) => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data?.data?.response || 'I processed your request.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, botMessage])
      setLoading(false)
    },
    onError: (error) => {
      toast.error('Failed to get AI response. Please try again.')
      setLoading(false)
    }
  })

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    // ✅ Create new chat if first message
    if (messages.length === 1 && messages[0].type === 'bot' && messages[0].id === 1) {
      const newChat = {
        id: Date.now(),
        title: currentInput.substring(0, 30),
        date: new Date().toISOString(),
        preview: currentInput.substring(0, 50),
        messages: [messages[0]],
      }
      setChatHistory(prev => [newChat, ...prev])
      setCurrentChatId(newChat.id)
    }

    try {
      const context = messages.slice(-3).map(m => 
        `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n')

      await chatMutation.mutateAsync({
        message: currentInput,
        context: context,
        history: messages.slice(-5).map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      })

      // ✅ Update chat preview after response
      if (currentChatId) {
        setChatHistory(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, preview: messages[messages.length - 1]?.content?.substring(0, 50) || chat.preview }
            : chat
        ))
      }
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
    const newMessages = [
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm CrimeLens AI. How can I help you with crime analysis today?",
        timestamp: new Date().toISOString(),
      },
    ]
    setMessages(newMessages)
    setCurrentChatId(null)
    localStorage.removeItem('aiCurrentChat')
    toast.success('New chat started')
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const handleShare = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
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
    setCurrentChatId(chat.id)
    // ✅ Load messages from chat history
    if (chat.messages && chat.messages.length > 0) {
      setMessages(chat.messages)
    } else {
      // Fallback: try to load from localStorage
      const saved = localStorage.getItem('aiCurrentChat')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.id === chat.id && parsed.messages) {
            setMessages(parsed.messages)
          }
        } catch (e) {}
      }
    }
    toast.info(`Loading: ${chat.title}`)
  }

  const handleMenuOpen = (event, chatId) => {
    setAnchorEl(event.currentTarget)
    setSelectedChatId(chatId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const suggestions = [
    'Analyze crime patterns in Bengaluru',
    'Predict crime hotspots for next week',
    'Analyze suspect network connections',
    'Generate monthly crime report',
  ]

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? 260 : 0,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: '1px solid #e8ecf1',
            bgcolor: '#fafafa',
            position: 'relative',
            height: '100%',
            transition: 'transform 0.2s ease',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-260px)',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo & Close Sidebar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a237e, #4fc3f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AIIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} fontSize="1rem">
                CrimeLens AI
              </Typography>
            </Box>
            <IconButton onClick={toggleSidebar} size="small">
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          {/* New Chat Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={clearChat}
            sx={{
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#283593' },
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600,
              mb: 2,
            }}
          >
            New Chat
          </Button>

          {/* History List */}
          <Typography variant="caption" color="textSecondary" sx={{ px: 1, mb: 1 }}>
            Recent Chats ({chatHistory.length})
          </Typography>
          
          <List sx={{ flex: 1, overflow: 'auto', px: 0 }}>
            {chatHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  No chats yet
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Start a new conversation
                </Typography>
              </Box>
            ) : (
              chatHistory.map((chat) => (
                <ListItem
                  key={chat.id}
                  disablePadding
                  sx={{
                    mb: 0.5,
                    '&:hover .chat-actions': {
                      opacity: 1,
                    },
                    bgcolor: currentChatId === chat.id ? 'rgba(26, 35, 126, 0.08)' : 'transparent',
                    borderRadius: 2,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleOpenChat(chat)}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'rgba(26, 35, 126, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap fontWeight={currentChatId === chat.id ? 600 : 400}>
                          {chat.title || 'Untitled Chat'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {new Date(chat.date).toLocaleDateString()} • {chat.preview || 'No messages'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <IconButton
                    className="chat-actions"
                    size="small"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      mr: 1,
                    }}
                    onClick={(e) => handleMenuOpen(e, chat.id)}
                  >
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>

          {/* Bottom */}
          <Divider />
          <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              CrimeLens AI • v1.0
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Chat Area - NO FOOTER */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          minWidth: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e8ecf1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!sidebarOpen && (
              <IconButton onClick={toggleSidebar} size="small">
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a237e, #4fc3f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AIIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                CrimeLens AI
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Share">
              <IconButton onClick={handleShare} size="small">
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Chat">
              <IconButton onClick={clearChat} size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fafafa',
          }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 3,
                  maxWidth: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    maxWidth: '80%',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.type === 'user' ? '#1a237e' : 'linear-gradient(135deg, #4fc3f7, #1a237e)',
                      flexShrink: 0,
                    }}
                  >
                    {message.type === 'user' ? <PersonIcon sx={{ fontSize: 16 }} /> : <AIIcon sx={{ fontSize: 16 }} />}
                  </Avatar>

                  <Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: message.type === 'user' 
                          ? '#1a237e' 
                          : '#ffffff',
                        color: message.type === 'user' ? '#ffffff' : '#1a1a1a',
                        border: message.type === 'bot' ? '1px solid #e8ecf1' : 'none',
                        position: 'relative',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.8,
                          fontSize: '0.95rem',
                          '& strong': {
                            color: message.type === 'user' ? '#ffffff' : '#1a237e',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                      
                      {message.type === 'bot' && (
                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => copyMessage(message.content)}
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              opacity: 0.3,
                              '&:hover': { opacity: 1 }
                            }}
                          >
                            <CopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Paper>

                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', px: 0.5 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </AnimatePresence>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4fc3f7', width: 32, height: 32 }}>
                  <AIIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ffffff', border: '1px solid #e8ecf1' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    >
                      <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    >
                      <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                    </motion.div>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          {/* Suggestions */}
          {messages.length <= 1 && !loading && (
            <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {suggestions.map((suggestion, idx) => (
                <Chip
                  key={idx}
                  label={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    setTimeout(handleSend, 100)
                  }}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: '#f0f0f0',
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                    },
                    fontSize: '0.85rem',
                    py: 2,
                    height: 'auto',
                    '& .MuiChip-label': {
                      py: 0.5,
                    },
                  }}
                />
              ))}
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input - Fixed at bottom, NO FOOTER */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #e8ecf1',
            bgcolor: '#ffffff',
            display: 'flex',
            gap: 2,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            ref={inputRef}
            placeholder="Message CrimeLens AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f5f7fa',
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '& fieldset': {
                  borderColor: 'transparent',
                },
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
              width: 48,
              height: 48,
              flexShrink: 0,
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
      </Box>

      {/* Delete Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleDeleteChat(selectedChatId)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Chat
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AIChat