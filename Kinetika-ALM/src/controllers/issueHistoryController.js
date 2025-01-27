// controllers/issueHistoryController.js
const IssueHistoryModel = require('../models/issueHistoryModel');

// Controller function to retrieve issue history by issue ID
const getIssueHistory = async (req, res) => {
  const { issueId } = req.params;
  try {
    const history = await IssueHistoryModel.getHistoryByIssueId(issueId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issue history', error });
  }
};

// Controller function to insert a new issue history record
const createIssueHistory = async (req, res) => {
  const { issueId, updatedBy, oldValue, newValue, fieldChanged } = req.body;
  try {
    const result = await IssueHistoryModel.insertHistory(
      issueId,
      updatedBy,
      oldValue,
      newValue,
      fieldChanged
    );
    res.status(201).json({ message: 'Issue history record created', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating issue history record', error });
  }
};

module.exports = { getIssueHistory, createIssueHistory };
