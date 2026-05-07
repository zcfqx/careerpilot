const { getTrend, getSkillCloud, getJobList } = require('../../utils/service');

Page({
  data: {
    activeTab: 'trend',
    trendData: null,
    skillData: null,
    jobList: [],
    jobTotal: 0,
    jobPage: 1,
    keyword: '',
    loading: true,
    hasData: false,
    errorMsg: '',
    _dataLoaded: { trend: false, skill: false, jobs: false }
  },

  onLoad(options) {
    if (options.tab) {
      this.setData({ activeTab: options.tab });
    }
    this.loadData();
  },

  onShow() {
    if (!this.data._dataLoaded[this.data.activeTab]) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.setData({ jobPage: 1, jobList: [], _dataLoaded: { trend: false, skill: false, jobs: false } });
    this.loadData().then(() => wx.stopPullDownRefresh()).catch(() => wx.stopPullDownRefresh());
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    if (!this.data._dataLoaded[tab]) {
      this.setData({ loading: true, errorMsg: '' });
      this.loadData();
    }
  },

  async loadData() {
    const tab = this.data.activeTab;
    try {
      if (tab === 'trend') {
        await this.loadTrend();
      } else if (tab === 'skill') {
        await this.loadSkillCloud();
      } else {
        await this.loadJobs();
      }
    } catch (err) {
      console.error('[Trend] loadData error:', err);
    }
  },

  async loadTrend() {
    try {
      this.setData({ loading: true, errorMsg: '' });
      const data = await getTrend();
      const loaded = { ...this.data._dataLoaded, trend: true };
      this.setData({
        trendData: data,
        hasData: data && data.trends && data.trends.length > 0,
        loading: false,
        errorMsg: '',
        _dataLoaded: loaded
      });
    } catch (err) {
      console.error('[Trend] loadTrend error:', err);
      const loaded = { ...this.data._dataLoaded, trend: true };
      this.setData({
        loading: false,
        errorMsg: '加载趋势数据失败，请下拉刷新重试',
        _dataLoaded: loaded
      });
    }
  },

  async loadSkillCloud() {
    try {
      this.setData({ loading: true, errorMsg: '' });
      const data = await getSkillCloud();
      const loaded = { ...this.data._dataLoaded, skill: true };
      this.setData({ skillData: data, loading: false, errorMsg: '', _dataLoaded: loaded });
    } catch (err) {
      console.error('[Trend] loadSkillCloud error:', err);
      const loaded = { ...this.data._dataLoaded, skill: true };
      this.setData({ loading: false, errorMsg: '加载技能数据失败', _dataLoaded: loaded });
    }
  },

  async loadJobs() {
    try {
      this.setData({ loading: true, errorMsg: '' });
      const data = await getJobList(this.data.keyword, this.data.jobPage);
      const loaded = { ...this.data._dataLoaded, jobs: true };
      this.setData({
        jobList: this.data.jobPage === 1 ? (data.list || []) : [...this.data.jobList, ...(data.list || [])],
        jobTotal: data.total || 0,
        loading: false,
        errorMsg: '',
        _dataLoaded: loaded
      });
    } catch (err) {
      console.error('[Trend] loadJobs error:', err);
      const loaded = { ...this.data._dataLoaded, jobs: true };
      this.setData({ loading: false, errorMsg: '加载岗位数据失败', _dataLoaded: loaded });
    }
  },

  refreshData() {
    this.setData({ loading: true, errorMsg: '' });
    const loaded = { ...this.data._dataLoaded };
    loaded[this.data.activeTab] = false;
    this.setData({ _dataLoaded: loaded });
    this.loadData();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  searchJobs() {
    this.setData({ jobPage: 1, jobList: [] });
    this.loadJobs();
  },

  onReachBottom() {
    if (this.data.activeTab === 'jobs') {
      const loaded = this.data.jobList.length;
      if (loaded < this.data.jobTotal) {
        this.setData({ jobPage: this.data.jobPage + 1 });
        this.loadJobs();
      }
    }
  }
});
