const { get, post } = require('./api');

function unwrap(res) {
  return res.data !== undefined ? res.data : res;
}

async function submitAssessment(data) {
  const res = await post('/assessment/submit', data);
  return unwrap(res);
}

async function getAssessmentHistory(page = 1, pageSize = 10) {
  const res = await get('/assessment/history', { page, pageSize });
  return unwrap(res);
}

async function getAssessmentDetail(id) {
  const res = await get(`/assessment/${id}`);
  return unwrap(res);
}

async function generateCareerPlan(assessmentId, jobTitle) {
  const res = await post('/career/generate', { assessmentId, jobTitle });
  return unwrap(res);
}

async function generateTrainingPlan(assessmentId, jobTitle) {
  const res = await post('/career/training', { assessmentId, jobTitle });
  return unwrap(res);
}

async function getCareerPlanList(page = 1, pageSize = 10) {
  const res = await get('/career/list', { page, pageSize });
  return unwrap(res);
}

async function getOverview() {
  const res = await get('/data/overview');
  return unwrap(res);
}

async function getTrend(jobTitle, period = '6m') {
  const res = await get('/data/trend', { jobTitle, period });
  return unwrap(res);
}

async function getSkillCloud(jobTitle) {
  const res = await get('/data/skill-cloud', { jobTitle });
  return unwrap(res);
}

async function getRadar(jobTitle) {
  const res = await get('/data/radar', { jobTitle });
  return unwrap(res);
}

async function getJobList(keyword, page = 1, pageSize = 10) {
  const res = await get('/data/jobs', { keyword, page, pageSize });
  return unwrap(res);
}

async function startCrawler() {
  const res = await post('/crawler/start');
  return unwrap(res);
}

async function getCrawlerStatus() {
  const res = await get('/crawler/status');
  return unwrap(res);
}

module.exports = {
  submitAssessment, getAssessmentHistory, getAssessmentDetail,
  generateCareerPlan, generateTrainingPlan, getCareerPlanList,
  getOverview, getTrend, getSkillCloud, getRadar, getJobList,
  startCrawler, getCrawlerStatus
};
