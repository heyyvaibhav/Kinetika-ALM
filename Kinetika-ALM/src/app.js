const express = require('express');
const bodyParser = require('body-parser');

// Import routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectsRoutes');
const issueRoutes = require('./routes/issuesRoute');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const issueHistoryRoutes = require('./routes/issueHistoryRoutes');

const app = express();
app.use(bodyParser.json());

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues/comments', commentRoutes);
app.use('/api/issues/attachments', attachmentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/issues/history', issueHistoryRoutes);

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
