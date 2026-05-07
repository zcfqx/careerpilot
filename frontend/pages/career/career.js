const { generateCareerPlan, getCareerPlanList, getAssessmentHistory } = require('../../utils/service');
const { get } = require('../../utils/api');

const app = getApp();
const MAX_RETRY = 2;

function transformPlanData(rawData, jobTitle) {
  let careerPlan = rawData.career_plan || rawData;
  if (typeof careerPlan === 'string') {
    try { careerPlan = JSON.parse(careerPlan); } catch (e) { careerPlan = {}; }
  }

  const milestones = rawData.key_milestones || careerPlan.key_milestones || [];
  const shortTermText = careerPlan.short_term || '';
  const midTermText = careerPlan.medium_term || '';

  const shortTermGoals = shortTermText
    ? (typeof shortTermText === 'string' ? shortTermText.split(/[；;。\n]/).filter(Boolean).slice(0, 4) : [String(shortTermText)])
    : ['提升专业核心技能', '积累行业实践经验', '建立职业发展基础'];

  const midTermGoals = midTermText
    ? (typeof midTermText === 'string' ? midTermText.split(/[；;。\n]/).filter(Boolean).slice(0, 4) : [String(midTermText)])
    : ['成为领域专业人才', '拓展跨域能力', '构建职业竞争力'];

  const shortTermMilestones = milestones.slice(0, 4).map((m, i) => ({
    month: (i + 1) * 3,
    content: typeof m === 'string' ? m : (m.content || m.description || String(m))
  }));

  const midTermMilestones = milestones.slice(4, 7).map((m, i) => ({
    year: i + 1,
    content: typeof m === 'string' ? m : (m.content || m.description || String(m))
  }));

  return {
    jobTitle: jobTitle || rawData.career_direction || '职业规划',
    shortTerm: {
      goals: shortTermGoals,
      milestones: shortTermMilestones.length > 0 ? shortTermMilestones : [
        { month: 3, content: '完成基础技能学习' },
        { month: 6, content: '参与实际项目实践' },
        { month: 9, content: '获取相关认证或作品集' }
      ]
    },
    midTerm: {
      goals: midTermGoals,
      milestones: midTermMilestones.length > 0 ? midTermMilestones : [
        { year: 1, content: '独立负责核心业务模块' },
        { year: 2, content: '成为团队技术/业务骨干' },
        { year: 3, content: '向管理或专家方向发展' }
      ]
    }
  };
}

Page({
  data: {
    jobTitle: '',
    plans: [],
    plan: null,
    assessmentId: null,
    loading: false,
    generating: false,
    generatingStep: '',
    generatingProgress: 0,
    errorMsg: ''
  },

  _progressTimer: null,

  onLoad(options) {
    if (options.jobTitle) {
      this.setData({ jobTitle: decodeURIComponent(options.jobTitle) });
    }
    if (options.assessmentId) {
      this.setData({ assessmentId: parseInt(options.assessmentId) });
    }
    if (options.planId) {
      this.loadPlanDetail(parseInt(options.planId));
    }
    this.loadPlans();
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

  onJobInput(e) {
    this.setData({ jobTitle: e.detail.value });
  },

  async loadPlans() {
    try {
      await app.checkLogin();
      const data = await getCareerPlanList(1, 10);
      this.setData({ plans: data.list || [] });
    } catch (err) {
      console.error('加载规划列表失败', err);
    }
  },

  async loadPlanDetail(planId) {
    this.setData({ loading: true, errorMsg: '' });
    try {
      await app.checkLogin();
      const res = await this._retryCall(() => get(`/career/detail/${planId}`));
      const rawData = res.data || res;
      const transformed = transformPlanData(rawData, this.data.jobTitle || rawData.career_direction);
      this.setData({ plan: transformed, loading: false });
    } catch (err) {
      console.error('加载规划详情失败', err);
      this.setData({
        loading: false,
        errorMsg: '加载规划失败，请检查网络后重试'
      });
    }
  },

  _startProgressAnimation() {
    const steps = [
      '正在调用AI引擎...',
      '正在分析评估数据...',
      '正在制定职业路径...',
      '正在匹配技能缺口...',
      '正在生成学习计划...',
      '即将完成...'
    ];
    let currentStep = 0;
    this.setData({
      generatingProgress: 5,
      generatingStep: steps[0]
    });

    this._progressTimer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        this._clearProgressTimer();
        return;
      }
      const progress = Math.min(5 + currentStep * 16, 90);
      this.setData({
        generatingProgress: progress,
        generatingStep: steps[currentStep]
      });
    }, 2500);
  },

  _stopProgressAnimation() {
    this._clearProgressTimer();
    this.setData({ generatingProgress: 100, generatingStep: '规划生成完成！' });
    setTimeout(() => {
      this.setData({ generatingProgress: 0, generatingStep: '' });
    }, 500);
  },

  async generatePlan() {
    if (!this.data.jobTitle) {
      wx.showToast({ title: '请输入目标岗位', icon: 'none' });
      return;
    }

    let assessmentId = this.data.assessmentId;
    if (!assessmentId) {
      try {
        const historyData = await getAssessmentHistory(1, 1);
        if (historyData.list && historyData.list.length > 0) {
          assessmentId = historyData.list[0].id;
        }
      } catch (err) {
        console.error('获取评估记录失败', err);
      }
    }

    if (!assessmentId) {
      wx.showToast({ title: '请先完成AI评估', icon: 'none' });
      return;
    }

    this.setData({ generating: true });
    this._startProgressAnimation();

    try {
      const data = await this._retryCall(() => generateCareerPlan(assessmentId, this.data.jobTitle));
      this._stopProgressAnimation();
      const transformed = transformPlanData(data, this.data.jobTitle);
      wx.showToast({ title: '规划生成成功', icon: 'success' });
      this.setData({
        plan: transformed,
        generating: false
      });
      this.loadPlans();
    } catch (err) {
      this._stopProgressAnimation();
      this.setData({ generating: false });
      console.error('生成规划失败', err);
      wx.showModal({
        title: '生成失败',
        content: '职业规划生成失败，请检查网络后重试',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) this.generatePlan();
        }
      });
    }
  },

  async viewPlan(e) {
    const planId = e.currentTarget.dataset.id;
    this.setData({ loading: true, errorMsg: '' });
    try {
      await app.checkLogin();
      const res = await this._retryCall(() => get(`/career/detail/${planId}`));
      const rawData = res.data || res;
      const transformed = transformPlanData(rawData, rawData.career_direction || this.data.jobTitle);
      this.setData({ plan: transformed, loading: false });
    } catch (err) {
      console.error('加载规划失败', err);
      this.setData({
        loading: false,
        errorMsg: '加载规划失败，请重试'
      });
    }
  },

  retryLoad() {
    this.setData({ errorMsg: '' });
    if (this.data.plan === null) {
      this.loadPlans();
    }
  },

  closePlan() {
    this.setData({ plan: null, errorMsg: '' });
  }
});
