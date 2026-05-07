const dataService = require('../services/dataService');
const { success, error } = require('../utils/response');

async function getOverview(req, res, next) {
  try {
    const result = await dataService.getOverview();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getTrend(req, res, next) {
  try {
    const jobTitle = req.query.jobTitle;
    const period = req.query.period || '6m';
    const result = await dataService.getTrend(jobTitle, period);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getSkillCloud(req, res, next) {
  try {
    const jobTitle = req.query.jobTitle;
    const result = await dataService.getSkillCloud(jobTitle);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getRadar(req, res, next) {
  try {
    const jobTitle = req.query.jobTitle;
    const result = await dataService.getRadar(jobTitle);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getJobList(req, res, next) {
  try {
    const keyword = req.query.keyword;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = await dataService.getJobList(keyword, page, pageSize);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview, getTrend, getSkillCloud, getRadar, getJobList };
