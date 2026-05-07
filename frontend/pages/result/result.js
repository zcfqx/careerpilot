const { getAssessmentDetail, generateCareerPlan, generateTrainingPlan } = require('../../utils/service');
const { getScoreColor } = require('../../utils/util');

const MAX_RETRY = 2;

Page({
  data: {
    assessmentId: 0,
    result: null,
    loading: true,
    activeJobIndex: 0,
    generatingPlan: false,
    generatingTraining: false,
    generatingType: '',
    generatingProgress: 0,
    generatingStep: '',
    generatingStepsCareer: [
      '正在连接AI引擎...',
      '正在分析评估数据...',
      '正在制定职业路径...',
      '正在匹配技能缺口...',
      '正在生成发展规划...'
    ],
    generatingStepsTraining: [
      '正在连接AI引擎...',
      '正在分析岗位需求...',
      '正在设计培训阶段...',
      '正在匹配学习资源...',
      '正在生成培养方案...'
    ]
  },

  _progressTimer: null,

  onLoad(options) {
    if (options.assessmentId) {
      this.setData({ assessmentId: parseInt(options.assessmentId) });
      this.loadResult();
    }
  },

  onUnload() {
    this._clearProgressTimer();
  },

  _clearProgressTimer() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
  },

  _startProgressAnimation(type) {
    const steps = type === 'career' ? this.data.generatingStepsCareer : this.data.generatingStepsTraining;
    let currentStep = 0;
    this.setData({
      generatingType: type,
      generatingProgress: 5,
      generatingStep: steps[0]
    });

    this._progressTimer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        this._clearProgressTimer();
        return;
      }
      const progress = Math.min(5 + currentStep * 18, 90);
      this.setData({
        generatingProgress: progress,
        generatingStep: steps[currentStep]
      });
    }, 2500);
  },

  _stopProgressAnimation() {
    this._clearProgressTimer();
    this.setData({ generatingProgress: 100, generatingStep: '生成完成！' });
    setTimeout(() => {
      this.setData({ generatingProgress: 0, generatingStep: '', generatingType: '' });
    }, 500);
  },

  async _retryCall(fn, retries = MAX_RETRY) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  },

  async loadResult() {
    try {
      const data = await getAssessmentDetail(this.data.assessmentId);
      this.setData({ result: data, loading: false });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载结果失败', icon: 'none' });
      console.error('加载结果失败', err);
    }
  },

  selectJob(e) {
    this.setData({ activeJobIndex: e.currentTarget.dataset.index });
  },

  async viewCareerPlan(e) {
    const job = this.data.result.matchedJobs[this.data.activeJobIndex];
    if (!job) return;

    this.setData({ generatingPlan: true });
    this._startProgressAnimation('career');

    try {
      const plan = await this._retryCall(() => generateCareerPlan(this.data.assessmentId, job.jobTitle));
      this._stopProgressAnimation();
      this.setData({ generatingPlan: false });
      wx.navigateTo({
        url: `/pages/career/career?planId=${plan.planId}`
      });
    } catch (err) {
      this._stopProgressAnimation();
      this.setData({ generatingPlan: false });
      console.error('生成规划失败', err);
      wx.showModal({
        title: '生成失败',
        content: '职业规划生成失败，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) this.viewCareerPlan();
        }
      });
    }
  },

  async viewTrainingPlan(e) {
    const job = this.data.result.matchedJobs[this.data.activeJobIndex];
    if (!job) return;

    this.setData({ generatingTraining: true });
    this._startProgressAnimation('training');

    try {
      const plan = await this._retryCall(() => generateTrainingPlan(this.data.assessmentId, job.jobTitle));
      this._stopProgressAnimation();
      this.setData({ generatingTraining: false });
      const app = getApp();
      app.globalData = app.globalData || {};
      app.globalData.trainingData = plan;
      wx.navigateTo({
        url: `/pages/training/training?assessmentId=${this.data.assessmentId}&jobTitle=${encodeURIComponent(job.jobTitle)}`
      });
    } catch (err) {
      this._stopProgressAnimation();
      this.setData({ generatingTraining: false });
      console.error('生成方案失败', err);
      wx.showModal({
        title: '生成失败',
        content: '培养方案生成失败，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) this.viewTrainingPlan();
        }
      });
    }
  },

  goBack() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
