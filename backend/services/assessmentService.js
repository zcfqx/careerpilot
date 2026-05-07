const { getWrapper } = require('../models/db-wrapper');
const llm = require('../utils/llm');

function buildAssessmentPrompt(answers) {
  const { major, personality, workPreference, resume } = answers;

  const workModeMap = { remote: '远程办公', office: '坐班办公', hybrid: '混合办公' };
  const companyTypeMap = { big: '大厂/名企', startup: '创业公司', state: '国企/体制内', foreign: '外企' };
  const workStyleMap = { stable: '稳定优先', challenge: '挑战优先', balanced: '平衡发展' };

  return `你是一个专业的职业规划AI助手。请根据以下学生信息进行职业韧性评估分析。

## 学生信息
- 专业：${major}
- 性格类型：${personality.type}
- 性格测试原始答案：${JSON.stringify(personality.answers)}
- 工作模式偏好：${workModeMap[workPreference.workMode] || workPreference.workMode}
- 企业类型偏好：${companyTypeMap[workPreference.companyType] || workPreference.companyType}
- 工作风格偏好：${workStyleMap[workPreference.workStyle] || workPreference.workStyle}
- 实习经历：${resume.internships || '无'}
- 项目经验：${resume.projects || '无'}
- 掌握技能：${resume.skills || '无'}

## 请严格按照以下JSON格式返回分析结果（不要添加任何其他文字，只返回JSON）：

{
  "resilienceScore": {
    "total": <0-100的综合韧性得分>,
    "dimensions": {
      "stressResistance": <抗压能力 0-100>,
      "adaptability": <适应能力 0-100>,
      "learningAbility": <学习能力 0-100>,
      "innovation": <创新能力 0-100>,
      "collaboration": <协作能力 0-100>
    }
  },
  "personalityAnalysis": "<性格特质分析，2-3句话>",
  "interestAnalysis": "<兴趣倾向分析，2-3句话>",
  "abilityAnalysis": "<能力评估分析，2-3句话>",
  "valuesAnalysis": "<价值观分析，2-3句话>",
  "overallAnalysis": "<综合评估总结，3-4句话>",
  "matchedJobs": [
    {
      "jobTitle": "<推荐岗位1名称>",
      "matchScore": <匹配度 0-100>,
      "matchReasons": ["<匹配理由1>", "<匹配理由2>", "<匹配理由3>"],
      "gapSkills": ["<需要补充的技能1>", "<需要补充的技能2>"],
      "gapAbilities": ["<需要培养的能力1>", "<需要培养的能力2>"]
    },
    {
      "jobTitle": "<推荐岗位2名称>",
      "matchScore": <匹配度 0-100>,
      "matchReasons": ["<匹配理由1>", "<匹配理由2>"],
      "gapSkills": ["<需要补充的技能1>"],
      "gapAbilities": ["<需要培养的能力1>"]
    },
    {
      "jobTitle": "<推荐岗位3名称>",
      "matchScore": <匹配度 0-100>,
      "matchReasons": ["<匹配理由1>", "<匹配理由2>"],
      "gapSkills": ["<需要补充的技能1>"],
      "gapAbilities": ["<需要培养的能力1>"]
    }
  ]
}`;
}

function generateMockResult(answers) {
  const { major, personality, workPreference } = answers;

  const jobPool = {
    '计算机科学与技术': [
      { title: '软件开发工程师', skills: ['React', 'Python', 'Docker'], abilities: ['系统设计', '代码审查'] },
      { title: '数据分析师', skills: ['SQL', 'Python', 'Tableau'], abilities: ['数据建模', '业务洞察'] },
      { title: 'AI产品经理', skills: ['需求分析', 'Axure', '数据分析'], abilities: ['产品规划', '用户研究'] }
    ],
    '工商管理': [
      { title: '管理培训生', skills: ['Excel', 'PPT', '数据分析'], abilities: ['项目管理', '团队协作'] },
      { title: '运营专员', skills: ['数据分析', '内容运营', '用户运营'], abilities: ['活动策划', '沟通协调'] },
      { title: '市场营销专员', skills: ['市场调研', '社交媒体', '文案策划'], abilities: ['创意思维', '数据分析'] }
    ],
    'default': [
      { title: '项目助理', skills: ['Office', '项目管理工具', '沟通'], abilities: ['执行力', '协调能力'] },
      { title: '客户成功专员', skills: ['CRM系统', '沟通技巧', '数据分析'], abilities: ['同理心', '问题解决'] },
      { title: '行政管理专员', skills: ['Office', '流程管理', '文档管理'], abilities: ['细心', '组织能力'] }
    ]
  };

  const jobs = jobPool[major] || jobPool['default'];
  const scores = {
    stressResistance: 60 + Math.floor(Math.random() * 25),
    adaptability: 60 + Math.floor(Math.random() * 25),
    learningAbility: 65 + Math.floor(Math.random() * 25),
    innovation: 55 + Math.floor(Math.random() * 30),
    collaboration: 60 + Math.floor(Math.random() * 25)
  };

  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  return {
    resilienceScore: { total, dimensions: scores },
    personalityAnalysis: `您的性格类型为${personality.type}，具备较好的逻辑思维和分析能力，在面对复杂问题时能够冷静思考并找到解决方案。`,
    interestAnalysis: `根据您的专业背景和测试结果，您对技术驱动型工作有较强兴趣，倾向于通过数据和事实来指导决策。`,
    abilityAnalysis: `您在学习能力和适应能力方面表现突出，具备快速掌握新知识的潜力，建议在实践项目中进一步提升动手能力。`,
    valuesAnalysis: `您偏好${workPreference.workStyle === 'stable' ? '稳定发展' : workPreference.workStyle === 'challenge' ? '挑战成长' : '平衡发展'}的职业路径，重视个人成长与工作生活的平衡。`,
    overallAnalysis: `综合来看，您是一位具有较强学习能力和适应能力的学生，建议在职业发展中注重实践积累，同时培养创新思维和团队协作能力。`,
    matchedJobs: jobs.map((job, i) => ({
      jobTitle: job.title,
      matchScore: 85 - i * 8 + Math.floor(Math.random() * 5),
      matchReasons: [
        `专业背景${major}与岗位需求高度相关`,
        `性格特质${personality.type}适合该岗位的工作模式`,
        `个人能力与岗位核心要求匹配度较高`
      ],
      gapSkills: job.skills.slice(0, 2),
      gapAbilities: job.abilities.slice(0, 1)
    }))
  };
}

function parseAIResponse(text) {
  let jsonStr = text.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(jsonStr);
}

async function callLLM(prompt) {
  const systemMsg = '你是一个专业的职业规划AI助手，擅长分析学生的性格特质、兴趣倾向、能力水平和价值观，提供精准的职业韧性评估和岗位匹配建议。请始终以JSON格式返回分析结果。';
  const result = await llm.chat(systemMsg, prompt);
  if (typeof result === 'object' && result !== null) return result;
  return parseAIResponse(String(result));
}

async function submitAssessment(userId, answers) {
  const db = await getWrapper();
  const insertResult = db.prepare(
    'INSERT INTO assessments (user_id, answers) VALUES (?, ?)'
  ).run(userId, JSON.stringify(answers));
  const assessmentId = insertResult.lastInsertRowid;

  let aiResult;
  try {
    const prompt = buildAssessmentPrompt(answers);
    const response = await callLLM(prompt);
    if (typeof response === 'object' && response !== null) {
      aiResult = response;
    } else {
      aiResult = parseAIResponse(String(response));
    }
  } catch (llmErr) {
    console.warn('[AI评估] LLM调用失败，使用模拟数据:', llmErr.message);
    aiResult = generateMockResult(answers);
  }

  try {
    db.prepare(
      `UPDATE assessments SET
        personality_result = ?,
        interest_result = ?,
        ability_result = ?,
        values_result = ?,
        overall_result = ?,
        score = ?
      WHERE id = ?`
    ).run(
      aiResult.personalityAnalysis || '',
      aiResult.interestAnalysis || '',
      aiResult.abilityAnalysis || '',
      aiResult.valuesAnalysis || '',
      JSON.stringify(aiResult),
      aiResult.resilienceScore ? aiResult.resilienceScore.total : 0,
      assessmentId
    );
  } catch (saveErr) {
    console.error('[AI评估] 保存结果失败:', saveErr.message);
  }

  return { assessmentId };
}

async function saveAIResult(assessmentId, userId, aiResult) {
  const db = await getWrapper();
  const assessment = db.prepare(
    'SELECT id FROM assessments WHERE id = ? AND user_id = ?'
  ).get(assessmentId, userId);

  if (!assessment) {
    throw new Error('评估记录不存在');
  }

  const overallJson = typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult);
  const parsed = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;

  db.prepare(
    `UPDATE assessments SET
      personality_result = ?,
      interest_result = ?,
      ability_result = ?,
      values_result = ?,
      overall_result = ?,
      score = ?
    WHERE id = ?`
  ).run(
    parsed.personalityAnalysis || parsed.personalityResult || '',
    parsed.interestAnalysis || parsed.interestResult || '',
    parsed.abilityAnalysis || parsed.abilityResult || '',
    parsed.valuesAnalysis || parsed.valuesResult || '',
    overallJson,
    parsed.resilienceScore ? parsed.resilienceScore.total : (parsed.score || 0),
    assessmentId
  );

  return { success: true };
}

async function getAssessmentDetail(assessmentId, userId) {
  const db = await getWrapper();
  const row = db.prepare(
    'SELECT * FROM assessments WHERE id = ? AND user_id = ?'
  ).get(assessmentId, userId);

  if (!row) return null;

  let result = {};

  try {
    if (row.overall_result) {
      const parsed = JSON.parse(row.overall_result);
      result = { ...parsed };
    }
  } catch (e) {
    // ignore parse errors
  }

  if (!result.resilienceScore && row.score > 0) {
    result.resilienceScore = {
      total: row.score,
      dimensions: {
        stressResistance: Math.round(row.score * (0.8 + Math.random() * 0.2)),
        adaptability: Math.round(row.score * (0.8 + Math.random() * 0.2)),
        learningAbility: Math.round(row.score * (0.85 + Math.random() * 0.15)),
        innovation: Math.round(row.score * (0.75 + Math.random() * 0.25)),
        collaboration: Math.round(row.score * (0.8 + Math.random() * 0.2))
      }
    };
  }

  if (!result.resilienceScore) {
    result.resilienceScore = {
      total: 0,
      dimensions: {
        stressResistance: 0,
        adaptability: 0,
        learningAbility: 0,
        innovation: 0,
        collaboration: 0
      }
    };
  }

  if (!result.matchedJobs) {
    result.matchedJobs = [];
  }

  if (!result.personalityAnalysis && row.personality_result) {
    result.personalityAnalysis = row.personality_result;
  }
  if (!result.interestAnalysis && row.interest_result) {
    result.interestAnalysis = row.interest_result;
  }
  if (!result.abilityAnalysis && row.ability_result) {
    result.abilityAnalysis = row.ability_result;
  }
  if (!result.valuesAnalysis && row.values_result) {
    result.valuesAnalysis = row.values_result;
  }
  if (!result.overallAnalysis) {
    result.overallAnalysis = row.overall_result && !row.overall_result.startsWith('{') ? row.overall_result : '';
  }

  result.id = row.id;
  result.userId = row.user_id;
  result.createdAt = row.created_at;

  return result;
}

async function getAssessmentHistory(userId, page, pageSize) {
  const db = await getWrapper();
  const offset = (page - 1) * pageSize;

  const countRow = db.prepare(
    'SELECT COUNT(*) as total FROM assessments WHERE user_id = ?'
  ).get(userId);

  const rows = db.prepare(
    'SELECT id, score, overall_result, created_at FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, pageSize, offset);

  const list = rows.map(row => {
    let topJob = '未知岗位';
    let topMatchScore = 0;

    try {
      if (row.overall_result) {
        const parsed = JSON.parse(row.overall_result);
        if (parsed.matchedJobs && parsed.matchedJobs.length > 0) {
          topJob = parsed.matchedJobs[0].jobTitle || '未知岗位';
          topMatchScore = parsed.matchedJobs[0].matchScore || 0;
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    return {
      assessmentId: row.id,
      totalScore: row.score || 0,
      topJob,
      topMatchScore,
      createdAt: row.created_at
    };
  });

  return {
    list,
    total: countRow.total,
    page,
    pageSize
  };
}

module.exports = {
  submitAssessment,
  saveAIResult,
  getAssessmentDetail,
  getAssessmentHistory,
  getAssessmentById: getAssessmentDetail,
  getAssessments: getAssessmentHistory
};
