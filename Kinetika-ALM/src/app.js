const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const loginRoute = require('./routes/login');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectsRoutes');
const issueRoutes = require('./routes/issuesRoute');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const issueHistoryRoutes = require('./routes/issueHistoryRoutes');
const statusRoutes = require('./routes/statusRoute');
const forgotPassword = require("./routes/forgotPasswordRoutes.js");
const emailRoutes = require('./routes/emailRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register routes
app.use('/api', loginRoute);
app.use('/api/users', userRoutes);
app.use('/api', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues/comments', commentRoutes);
app.use('/api/issues/attachments', attachmentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/issues/history', issueHistoryRoutes);
app.use('/api/status', statusRoutes);
app.use('/api', forgotPassword);
app.use('/api/notifications', emailRoutes);
app.use('/api', profileRoutes);

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
