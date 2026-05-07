const { getWrapper } = require('../models/db-wrapper');
const llm = require('../utils/llm');

async function generateCareerPlan(userId, assessmentId, jobTitle) {
  const db = await getWrapper();
  const assessment = db.prepare(
    'SELECT * FROM assessments WHERE id = ? AND user_id = ?'
  ).get(assessmentId, userId);

  if (!assessment) {
    return null;
  }

  const systemPrompt = `你是一个资深的职业规划师。请根据用户的评估结果和目标岗位，生成详细的职业规划建议。
返回JSON格式：
{
  "career_direction": "职业方向概述",
  "career_plan": {
    "short_term": "短期目标(0-1年)",
    "medium_term": "中期目标(1-3年)",
    "long_term": "长期目标(3-5年)",
    "key_milestones": ["里程碑1", "里程碑2"]
  },
  "skill_gaps": [
    {"skill": "技能名", "current_level": "当前水平", "target_level": "目标水平", "priority": "high/medium/low"}
  ],
  "learning_plan": {
    "courses": ["推荐课程"],
    "books": ["推荐书籍"],
    "practices": ["实践建议"],
    "timeline": "学习时间线"
  }
}`;

  const userPrompt = `目标岗位：${jobTitle}
评估结果：
- 性格特征：${assessment.personality_result || '未评估'}
- 兴趣倾向：${assessment.interest_result || '未评估'}
- 能力评估：${assessment.ability_result || '未评估'}
- 价值观念：${assessment.values_result || '未评估'}
- 综合评分：${assessment.score || 0}`;

  const aiResult = await llm.chat(systemPrompt, userPrompt);

  const careerDirection = typeof aiResult === 'object' ? (aiResult.career_direction || JSON.stringify(aiResult)) : String(aiResult);
  const careerPlan = typeof aiResult === 'object' ? JSON.stringify(aiResult.career_plan || aiResult) : String(aiResult);
  const skillGaps = typeof aiResult === 'object' ? (aiResult.skill_gaps || []) : [];
  const learningPlan = typeof aiResult === 'object' ? JSON.stringify(aiResult.learning_plan || aiResult) : String(aiResult);

  const result = db.prepare(
    `INSERT INTO career_plans (user_id, assessment_id, career_direction, career_plan, skill_gaps, learning_plan)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(userId, assessmentId, careerDirection, careerPlan, JSON.stringify(skillGaps), learningPlan);

  return { planId: result.lastInsertRowid, ...aiResult };
}

async function generateTrainingPlan(userId, assessmentId, jobTitle) {
  const db = await getWrapper();
  const assessment = db.prepare(
    'SELECT * FROM assessments WHERE id = ? AND user_id = ?'
  ).get(assessmentId, userId);

  if (!assessment) {
    return null;
  }

  const systemPrompt = `你是一个专业的职业培训师。请根据用户的评估结果和目标岗位，生成个性化的培训方案。
返回JSON格式：
{
  "training_plan": [
    {
      "skill": "技能名称",
      "level": "入门/进阶/高级",
      "priority": "high/medium/low",
      "suggestedHours": 40,
      "courses": [{"name": "课程名", "platform": "平台", "duration": "时长"}],
      "aiTools": [{"name": "工具名", "practice": "实践方式"}]
    }
  ],
  "totalSuggestedHours": 200,
  "estimatedWeeks": 12,
  "recommended_resources": {
    "courses": ["课程推荐"],
    "tools": ["工具推荐"],
    "communities": ["社区推荐"]
  }
}`;

  const userPrompt = `目标岗位：${jobTitle}
评估结果：
- 性格特征：${assessment.personality_result || '未评估'}
- 兴趣倾向：${assessment.interest_result || '未评估'}
- 能力评估：${assessment.ability_result || '未评估'}
- 综合评分：${assessment.score || 0}`;

  const aiResult = await llm.chat(systemPrompt, userPrompt);

  const trainingPlan = typeof aiResult === 'object' ? (aiResult.training_plan || []) : [];
  const totalHours = typeof aiResult === 'object' ? (aiResult.totalSuggestedHours || 0) : 0;
  const weeks = typeof aiResult === 'object' ? (aiResult.estimatedWeeks || 0) : 0;
  const resources = typeof aiResult === 'object' ? (aiResult.recommended_resources || {}) : {};

  db.prepare(
    `INSERT INTO career_plans (user_id, assessment_id, career_direction, career_plan, skill_gaps, learning_plan)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    userId, assessmentId,
    `培养方案-${jobTitle}`,
    JSON.stringify({ type: 'training', training_plan: trainingPlan, totalSuggestedHours: totalHours, estimatedWeeks: weeks }),
    JSON.stringify([]),
    JSON.stringify(resources)
  );

  return {
    trainingPlan,
    totalSuggestedHours: totalHours,
    estimatedWeeks: weeks,
    recommended_resources: resources
  };
}

async function getTrainingDetail(assessmentId, userId) {
  const db = await getWrapper();
  const plan = db.prepare(
    `SELECT * FROM career_plans WHERE assessment_id = ? AND user_id = ? AND career_direction LIKE '培养方案-%' ORDER BY created_at DESC LIMIT 1`
  ).get(assessmentId, userId);

  if (!plan) return null;

  let careerPlanData = plan.career_plan;
  try { careerPlanData = JSON.parse(careerPlanData); } catch (e) {}

  if (careerPlanData && careerPlanData.type === 'training') {
    return {
      trainingPlan: careerPlanData.training_plan || [],
      totalSuggestedHours: careerPlanData.totalSuggestedHours || 0,
      estimatedWeeks: careerPlanData.estimatedWeeks || 0
    };
  }
  return null;
}

async function getPlanDetail(planId, userId) {
  const db = await getWrapper();
  const plan = db.prepare(
    'SELECT * FROM career_plans WHERE id = ? AND user_id = ?'
  ).get(planId, userId);

  return plan;
}

async function getCareerPlanList(userId, page = 1, pageSize = 10) {
  const db = await getWrapper();
  const offset = (page - 1) * pageSize;
  const total = db.prepare(
    'SELECT COUNT(*) as count FROM career_plans WHERE user_id = ?'
  ).get(userId);
  const list = db.prepare(
    'SELECT id, career_direction, created_at FROM career_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, pageSize, offset);

  return { total: total?.count || 0, page, pageSize, list };
}

module.exports = {
  generateCareerPlan,
  generateTrainingPlan,
  getPlanDetail,
  getCareerPlanList,
  getTrainingDetail
};
