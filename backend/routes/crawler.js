const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { exec } = require('child_process');
const path = require('path');

let crawlerRunning = false;
let crawlerOutput = '';

router.post('/start', (req, res) => {
  if (crawlerRunning) {
    return res.json(success({ status: 'running' }, '爬虫正在运行中'));
  }

  const { type = 'seed' } = req.body;
  let scriptPath;

  if (type === 'crawl') {
    scriptPath = path.resolve(__dirname, '..', '..', 'crawler', 'main.py');
  } else {
    scriptPath = path.resolve(__dirname, '..', '..', 'crawler', 'seed_data.py');
  }

  crawlerRunning = true;
  crawlerOutput = '';

  const timeout = type === 'crawl' ? 300000 : 60000;

  exec(`python "${scriptPath}"`, { timeout }, (err, stdout, stderr) => {
    crawlerRunning = false;
    if (err) {
      console.error('[Crawler] 执行失败:', stderr);
      crawlerOutput = stderr;
      return;
    }
    console.log('[Crawler] 执行完成:', stdout);
    crawlerOutput = stdout;
  });

  res.json(success({ status: 'started', type }, '爬虫任务已启动'));
});

router.get('/status', (req, res) => {
  res.json(success({ running: crawlerRunning, output: crawlerOutput }));
});

router.post('/seed', (req, res) => {
  if (crawlerRunning) {
    return res.json(success({ status: 'running' }, '爬虫正在运行中'));
  }

  const scriptPath = path.resolve(__dirname, '..', '..', 'crawler', 'seed_data.py');

  crawlerRunning = true;
  crawlerOutput = '';

  exec(`python "${scriptPath}"`, { timeout: 60000 }, (err, stdout, stderr) => {
    crawlerRunning = false;
    if (err) {
      console.error('[Crawler] 执行失败:', stderr);
      crawlerOutput = stderr;
      return;
    }
    console.log('[Crawler] 执行完成:', stdout);
    crawlerOutput = stdout;
  });

  res.json(success({ status: 'started' }, '种子数据生成任务已启动'));
});

router.post('/process', (req, res) => {
  if (crawlerRunning) {
    return res.json(success({ status: 'running' }, '爬虫正在运行中'));
  }

  const scriptPath = path.resolve(__dirname, '..', '..', 'crawler', 'pipelines.py');

  crawlerRunning = true;
  crawlerOutput = '';

  exec(`python "${scriptPath}"`, { timeout: 60000 }, (err, stdout, stderr) => {
    crawlerRunning = false;
    if (err) {
      console.error('[Crawler] 执行失败:', stderr);
      crawlerOutput = stderr;
      return;
    }
    console.log('[Crawler] 执行完成:', stdout);
    crawlerOutput = stdout;
  });

  res.json(success({ status: 'started' }, '数据处理任务已启动'));
});

module.exports = router;
