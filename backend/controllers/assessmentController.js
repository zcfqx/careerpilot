const assessmentService = require('../services/assessmentService');
const { success, error } = require('../utils/response');

async function submitAssessment(req, res, next) {
  try {
    const userId = req.userId;
    const { major, personality, workPreference, resume } = req.body;

    if (!major) return res.status(400).json(error(2001, '评估信息不完整：专业信息不能为空'));
    if (!personality || !personality.type) return res.status(400).json(error(2001, '评估信息不完整：性格特质不能为空'));
    if (!workPreference) return res.status(400).json(error(2001, '评估信息不完整：工作偏好不能为空'));

    const result = await assessmentService.submitAssessment(userId, {
      major, personality, workPreference, resume
    });
    res.json(success(result, '评估完成'));
  } catch (err) {
    if (err.message && err.message.includes('API')) {
      return res.status(500).json(error(2002, '大模型调用失败：' + err.message));
    }
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = await assessmentService.getAssessmentHistory(req.userId, page, pageSize);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getDetail(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json(error(400, '参数错误：无效的评估ID'));
    }
    const result = await assessmentService.getAssessmentById(id, req.userId);
    if (!result) {
      return res.status(404).json(error(2003, '评估记录不存在'));
    }
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAssessment, getHistory, getDetail };
