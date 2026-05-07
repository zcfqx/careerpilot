const { getWrapper } = require('../models/db-wrapper');

async function getOverview() {
  const db = await getWrapper();
  const totalJobs = db.prepare('SELECT COUNT(*) as count FROM job_data').get();
  const avgSalary = db.prepare('SELECT AVG((salary_min + salary_max) / 2) as avg FROM job_data').get();
  const cityCount = db.prepare('SELECT COUNT(DISTINCT city) as count FROM job_data').get();
  const jobTypes = db.prepare('SELECT COUNT(DISTINCT job_title) as count FROM job_data').get();

  const hotJobs = db.prepare(
    `SELECT job_title as jobTitle, COUNT(*) as count
     FROM job_data GROUP BY job_title ORDER BY count DESC LIMIT 5`
  ).all().map(j => ({ ...j, trend: 'up' }));

  const recentJobs = db.prepare(
    `SELECT job_title, company_name, salary_min, salary_max, city, publish_date
     FROM job_data ORDER BY publish_date DESC LIMIT 5`
  ).all();

  const skillRows = db.prepare('SELECT skill_tags FROM job_data LIMIT 200').all();
  const skillCount = {};
  skillRows.forEach(row => {
    try {
      const tags = JSON.parse(row.skill_tags || '[]');
      tags.forEach(tag => { skillCount[tag] = (skillCount[tag] || 0) + 1; });
    } catch (e) {}
  });
  const hotSkills = Object.entries(skillCount)
    .map(([name, count]) => ({ name, growth: Math.min(Math.round((count / (totalJobs?.count || 1)) * 200), 150) }))
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5);

  return {
    totalJobs: totalJobs?.count || 0,
    avgSalary: Math.round(avgSalary?.avg || 0),
    cityCount: cityCount?.count || 0,
    jobTypes: jobTypes?.count || 0,
    hotJobs,
    hotSkills,
    recentJobs
  };
}

async function getTrend(jobTitle = '', period = '6m') {
  const db = await getWrapper();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM job_data').get();
  if (!countRow || countRow.count === 0) {
    return { trends: [], hasData: false };
  }

  const months = parseInt(period) || 6;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const startDateStr = startDate.toISOString().slice(0, 10);

  let sql;
  let params;

  if (jobTitle) {
    sql = `SELECT job_title as jobTitle, strftime('%Y-%m', COALESCE(publish_date, created_at, 'now')) as date, COUNT(*) as count
           FROM job_data WHERE COALESCE(publish_date, created_at, 'now') >= ? AND job_title LIKE ?
           GROUP BY job_title, strftime('%Y-%m', COALESCE(publish_date, created_at, 'now'))
           ORDER BY date ASC`;
    params = [startDateStr, `%${jobTitle}%`];
  } else {
    sql = `SELECT job_title as jobTitle, strftime('%Y-%m', COALESCE(publish_date, created_at, 'now')) as date, COUNT(*) as count
           FROM job_data WHERE COALESCE(publish_date, created_at, 'now') >= ?
           GROUP BY job_title, strftime('%Y-%m', COALESCE(publish_date, created_at, 'now'))
           ORDER BY job_title, date ASC`;
    params = [startDateStr];
  }

  const rows = db.prepare(sql).all(...params);

  const trendMap = {};
  rows.forEach(row => {
    const date = row.date || '未知';
    const jobTitleName = row.jobTitle || '未知岗位';
    if (!trendMap[jobTitleName]) {
      trendMap[jobTitleName] = { jobTitle: jobTitleName, data: [] };
    }
    trendMap[jobTitleName].data.push({ date, count: row.count });
  });

  const trends = Object.values(trendMap).slice(0, 10);
  return { trends, hasData: trends.length > 0 };
}

async function getSkillCloud(jobTitle = '') {
  const db = await getWrapper();
  let sql = 'SELECT skill_tags FROM job_data';
  const params = [];

  if (jobTitle) {
    sql += ' WHERE job_title = ?';
    params.push(jobTitle);
  }

  const jobs = db.prepare(sql).all(...params);
  const skillCount = {};

  jobs.forEach(job => {
    try {
      const tags = JSON.parse(job.skill_tags || '[]');
      tags.forEach(tag => {
        skillCount[tag] = (skillCount[tag] || 0) + 1;
      });
    } catch (e) {
      // ignore
    }
  });

  const skills = Object.entries(skillCount)
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 30);

  return { skills };
}

async function getRadar(jobTitle = '') {
  const db = await getWrapper();
  const dimensions = ['判断决策', 'AI工具使用', '跨域整合', '沟通协作', '数据分析', '创新思维'];

  if (!jobTitle) {
    const values = dimensions.map(() => Math.floor(Math.random() * 30) + 60);
    return { dimensions, values };
  }

  const values = {};
  const jobTitles = jobTitle ? [jobTitle] :
    db.prepare('SELECT DISTINCT job_title FROM job_data LIMIT 10').all().map(r => r.job_title);

  jobTitles.forEach(title => {
    values[title] = dimensions.map(() => Math.floor(Math.random() * 30) + 60);
  });

  return { dimensions, values };
}

async function getJobList(keyword = '', page = 1, pageSize = 10) {
  const db = await getWrapper();
  const offset = (page - 1) * pageSize;
  let countSql = 'SELECT COUNT(*) as total FROM job_data';
  let dataSql = 'SELECT * FROM job_data';
  const params = [];

  if (keyword) {
    const where = ' WHERE job_title LIKE ? OR company_name LIKE ? OR city LIKE ?';
    countSql += where;
    dataSql += where;
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  dataSql += ' ORDER BY publish_date DESC LIMIT ? OFFSET ?';

  const total = db.prepare(countSql).get(...params);
  const list = db.prepare(dataSql).all(...params, pageSize, offset);

  return {
    total: total?.total || 0,
    page,
    pageSize,
    list
  };
}

module.exports = {
  getOverview,
  getTrend,
  getSkillCloud,
  getRadar,
  getJobList
};