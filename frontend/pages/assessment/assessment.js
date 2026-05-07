const app = getApp();
const { submitAssessment } = require('../../utils/service');

Page({
  data: {
    step: 1,
    totalSteps: 3,
    major: '',
    majorList: ['工商管理', '人力资源管理', '市场营销', '行政管理', '公共管理', '信息管理', '财务管理', '会计学', '经济学', '国际经济与贸易', '计算机科学与技术', '数据科学与大数据技术', '心理学', '社会学', '新闻传播学', '法学', '教育学', '其他'],
    showMajorPicker: false,

    personalityAnswers: [0, 0, 0, 0, 0],
    personalityQuestions: [
      { question: '面对突发变化，你通常？', options: ['冷静分析再行动', '先适应再调整', '寻找创新解决方案', '组织协调资源应对'] },
      { question: '在团队中，你更倾向于？', options: ['独立完成专业任务', '协调团队成员关系', '提出创新想法', '制定计划并推进执行'] },
      { question: '学习新事物时，你偏好？', options: ['系统学习理论知识', '在实践中边做边学', '尝试多种方法找到最优解', '与他人交流讨论学习'] },
      { question: '面对压力，你会？', options: ['按优先级逐一处理', '调整心态积极应对', '寻找突破口创新解决', '寻求团队支持协作'] },
      { question: '你对AI工具的态度？', options: ['主动学习并应用到工作', '愿意尝试但需要指导', '认为能提升效率但需谨慎', '更重视人际互动和判断'] }
    ],
    personalityType: '',

    workModeOptions: [
      { value: 'remote', label: '远程办公', selected: false },
      { value: 'office', label: '坐班办公', selected: false },
      { value: 'hybrid', label: '混合办公', selected: false }
    ],
    companyTypeOptions: [
      { value: 'big', label: '大厂/名企', selected: false },
      { value: 'startup', label: '创业公司', selected: false },
      { value: 'state', label: '国企/体制内', selected: false },
      { value: 'foreign', label: '外企', selected: false }
    ],
    workStyleOptions: [
      { value: 'stable', label: '稳定优先', selected: false },
      { value: 'challenge', label: '挑战优先', selected: false },
      { value: 'balanced', label: '平衡发展', selected: false }
    ],

    resume: {
      internships: '',
      projects: '',
      skills: ''
    },

    submitting: false,
    generatingProgress: 0,
    generatingStep: '',
    generatingSteps: [
      '正在提交评估数据...',
      'AI正在分析性格特质...',
      'AI正在评估能力维度...',
      'AI正在匹配适配岗位...',
      'AI正在生成评估报告...',
      '即将完成，请稍候...'
    ]
  },

  _progressTimer: null,

  showMajorPicker() {
    this.setData({ showMajorPicker: true });
  },

  hideMajorPicker() {
    this.setData({ showMajorPicker: false });
  },

  selectMajor(e) {
    const major = e.currentTarget.dataset.major;
    this.setData({ major, showMajorPicker: false });
  },

  onMajorInput(e) {
    this.setData({ major: e.detail.value });
  },

  selectPersonality(e) {
    const { qindex, oindex } = e.currentTarget.dataset;
    const answers = [...this.data.personalityAnswers];
    answers[qindex] = oindex + 1;
    this.setData({ personalityAnswers: answers });
  },

  toggleOption(e) {
    const { type, index } = e.currentTarget.dataset;
    const key = type + 'Options';
    const options = [...this.data[key]];
    options.forEach((opt, i) => { opt.selected = i === index; });
    this.setData({ [key]: options });
  },

  onResumeInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`resume.${field}`]: e.detail.value });
  },

  nextStep() {
    if (this.data.step === 1 && !this.data.major) {
      wx.showToast({ title: '请选择或输入专业', icon: 'none' });
      return;
    }
    if (this.data.step === 2) {
      const answered = this.data.personalityAnswers.filter(a => a > 0).length;
      if (answered < 5) {
        wx.showToast({ title: '请完成所有性格问题', icon: 'none' });
        return;
      }
    }
    this.setData({ step: this.data.step + 1 });
  },

  prevStep() {
    this.setData({ step: this.data.step - 1 });
  },

  _startProgressAnimation() {
    const steps = this.data.generatingSteps;
    let currentStep = 0;
    this.setData({
      generatingProgress: 5,
      generatingStep: steps[0]
    });

    this._progressTimer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(this._progressTimer);
        this._progressTimer = null;
        return;
      }
      const progress = Math.min(5 + currentStep * 18, 90);
      this.setData({
        generatingProgress: progress,
        generatingStep: steps[currentStep]
      });
    }, 3000);
  },

  _stopProgressAnimation() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
    this.setData({ generatingProgress: 100, generatingStep: '评估完成！' });
    setTimeout(() => {
      this.setData({ generatingProgress: 0, generatingStep: '' });
    }, 500);
  },

  async submitForm() {
    const workMode = this.data.workModeOptions.find(o => o.selected);
    const companyType = this.data.companyTypeOptions.find(o => o.selected);
    const workStyle = this.data.workStyleOptions.find(o => o.selected);

    if (!workMode || !companyType || !workStyle) {
      wx.showToast({ title: '请完成工作偏好选择', icon: 'none' });
      return;
    }

    const typeMap = { 1: '分析型', 2: '社交型', 3: '创造型', 4: '组织型' };
    const answerCounts = [0, 0, 0, 0];
    this.data.personalityAnswers.forEach(a => {
      if (a > 0 && a <= 4) answerCounts[a - 1]++;
    });
    const maxIdx = answerCounts.indexOf(Math.max(...answerCounts));
    const personalityType = typeMap[maxIdx + 1];

    const data = {
      major: this.data.major,
      personality: {
        type: personalityType,
        answers: this.data.personalityAnswers
      },
      workPreference: {
        workMode: workMode.value,
        companyType: companyType.value,
        workStyle: workStyle.value
      },
      resume: this.data.resume
    };

    this.setData({ submitting: true });
    this._startProgressAnimation();

    try {
      await app.checkLogin();
      const result = await submitAssessment(data);
      this._stopProgressAnimation();
      this.setData({ submitting: false });
      wx.navigateTo({
        url: `/pages/result/result?assessmentId=${result.assessmentId}`
      });
    } catch (err) {
      this._stopProgressAnimation();
      this.setData({ submitting: false });
      wx.showToast({ title: '评估提交失败，请重试', icon: 'none' });
      console.error('提交评估失败', err);
    }
  },

  onUnload() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
  }
});
