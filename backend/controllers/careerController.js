const careerService = require('../services/careerService');
const { success, error } = require('../utils/response');

async function generateCareer(req, res, next) {
  try {
    const { assessmentId, jobTitle } = req.body;
    if (!assessmentId || !jobTitle) {
      return res.status(400).json(error(400, '参数错误：assessmentId和jobTitle不能为空'));
    }
    const result = await careerService.generateCareerPlan(req.userId, assessmentId, jobTitle);
    if (!result) {
      return res.status(404).json(error(2003, '评估记录不存在'));
    }
    res.json(success(result, '规划生成成功'));
  } catch (err) {
    if (err.message && err.message.includes('API')) {
      return res.status(500).json(error(3001, '规划生成失败：' + err.message));
    }
    next(err);
  }
}

async function generateTraining(req, res, next) {
  try {
    const { assessmentId, jobTitle } = req.body;
    if (!assessmentId || !jobTitle) {
      return res.status(400).json(error(400, '参数错误：assessmentId和jobTitle不能为空'));
    }
    const result = await careerService.generateTrainingPlan(req.userId, assessmentId, jobTitle);
    if (!result) {
      return res.status(404).json(error(2003, '评估记录不存在'));
    }
    res.json(success(result, '方案生成成功'));
  } catch (err) {
    if (err.message && err.message.includes('API')) {
      return res.status(500).json(error(3001, '方案生成失败：' + err.message));
    }
    next(err);
  }
}

async function getTrainingDetail(req, res, next) {
  try {
    const assessmentId = parseInt(req.query.assessmentId);
    const jobTitle = req.query.jobTitle;
    if (!assessmentId || !jobTitle) {
      return res.status(400).json(error(400, '参数错误：assessmentId和jobTitle不能为空'));
    }
    const result = await careerService.getTrainingDetail(assessmentId, req.userId);
    if (!result) {
      return res.status(404).json(error(2004, '培养方案不存在，请先生成'));
    }
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getPlanList(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = await careerService.getCareerPlanList(req.userId, page, pageSize);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getPlanDetail(req, res, next) {
  try {
    const planId = parseInt(req.params.id);
    if (isNaN(planId) || planId <= 0) {
      return res.status(400).json(error(400, '参数错误：无效的规划ID'));
    }
    const result = await careerService.getPlanDetail(planId, req.userId);
    if (!result) {
      return res.status(404).json(error(2003, '规划不存在'));
    }
    try {
      result.career_plan = JSON.parse(result.career_plan);
    } catch (e) {}
    try {
      result.skill_gaps = JSON.parse(result.skill_gaps);
    } catch (e) {}
    try {
      result.learning_plan = JSON.parse(result.learning_plan);
    } catch (e) {}
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

module.exports = { generateCareer, generateTraining, getPlanList, getPlanDetail, getTrainingDetail };
