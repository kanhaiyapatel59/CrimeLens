// backend/src/routes/aiChatRoutes.js
router.post('/chat', AuthMiddleware.authenticate, async (req, res) => {
  const { message, context } = req.body;
  const response = await AIService.chat(message, context);
  res.json({ success: true, response });
});