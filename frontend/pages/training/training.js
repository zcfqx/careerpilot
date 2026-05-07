const { get } = require('../../utils/api');

const MAX_RETRY = 2;

Page({
  data: {
    assessmentId: 0,
    jobTitle: '',
    training: null,
    loading: true,
    errorMsg: '',
    retryCount: 0
  },

  onLoad(options) {
    if (options.assessmentId && options.jobTitle) {
      this.setData({
        assessmentId: parseInt(options.assessmentId),
        jobTitle: decodeURIComponent(options.jobTitle)
      });
      this.loadTraining();
    } else {
      this.setData({ loading: false, errorMsg: '参数错误，缺少必要信息' });
    }
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

  _normalizeTrainingData(data) {
    if (!data) return null;

    let trainingPlan = data.trainingPlan || data.training_plan || [];
    if (typeof trainingPlan === 'string') {
      try { trainingPlan = JSON.parse(trainingPlan); } catch (e) { trainingPlan = []; }
    }

    if (!Array.isArray(trainingPlan)) {
      if (typeof trainingPlan === 'object' && trainingPlan !== null) {
        trainingPlan = Object.entries(trainingPlan).map(([key, val]) => ({
          skill: val.name || key,
          level: val.level || '入门',
          priority: val.priority || 'medium',
          suggestedHours: val.suggestedHours || val.duration_hours || 20,
          courses: val.courses || [],
          aiTools: val.aiTools || []
        }));
      } else {
        trainingPlan = [];
      }
    }

    trainingPlan = trainingPlan.map(item => ({
      skill: item.skill || item.name || '未知技能',
      level: item.level || '入门',
      priority: item.priority || 'medium',
      suggestedHours: item.suggestedHours || item.duration_hours || 20,
      courses: Array.isArray(item.courses) ? item.courses : [],
      aiTools: Array.isArray(item.aiTools) ? item.aiTools : []
    }));

    const totalSuggestedHours = data.totalSuggestedHours ||
      trainingPlan.reduce((sum, item) => sum + (item.suggestedHours || 0), 0);
    const estimatedWeeks = data.estimatedWeeks ||
      Math.max(1, Math.ceil(totalSuggestedHours / 20));

    return { trainingPlan, totalSuggestedHours, estimatedWeeks };
  },

  async loadTraining() {
    this.setData({ loading: true, errorMsg: '' });

    const app = getApp();
    if (app.globalData && app.globalData.trainingData) {
      const normalized = this._normalizeTrainingData(app.globalData.trainingData);
      delete app.globalData.trainingData;
      if (normalized && normalized.trainingPlan.length > 0) {
        this.setData({ training: normalized, loading: false });
        return;
      }
    }

    try {
      const unwrap = (res) => res.data !== undefined ? res.data : res;
      const raw = await this._retryCall(() =>
        get('/career/training-detail', {
          assessmentId: this.data.assessmentId,
          jobTitle: this.data.jobTitle
        })
      );
      const data = unwrap(raw);
      const normalized = this._normalizeTrainingData(data);

      if (!normalized || normalized.trainingPlan.length === 0) {
        this.setData({ loading: false, errorMsg: '培养方案数据为空，请重新生成' });
        return;
      }

      this.setData({ training: normalized, loading: false });
    } catch (err) {
      console.error('加载培养方案失败', err);
      const msg = (err && err.message) ? err.message : '加载培养方案失败';
      this.setData({
        loading: false,
        errorMsg: msg.includes('404') || msg.includes('不存在')
          ? '培养方案不存在，请先在评估结果页生成'
          : '加载失败，请检查网络后重试'
      });
    }
  },

  retryLoad() {
    this.setData({ retryCount: this.data.retryCount + 1 });
    this.loadTraining();
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
