const { getOverview, startCrawler, getCrawlerStatus } = require('../../utils/service');
const { formatSalary, getTrendIcon, getTrendColor } = require('../../utils/util');

const app = getApp();

Page({
  data: {
    overview: null,
    loading: true,
    crawlerRunning: false,
    crawlerText: '数据更新'
  },

  onLoad() {
    this.loadOverview();
    this.checkCrawlerStatus();
  },

  onShow() {
    if (!this.data.overview) {
      this.loadOverview();
    }
  },

  onPullDownRefresh() {
    this.loadOverview().then(() => wx.stopPullDownRefresh());
  },

  async loadOverview() {
    try {
      await app.checkLogin();
      const data = await getOverview();
      this.setData({ overview: data, loading: false });
    } catch (err) {
      this.setData({ loading: false });
      console.error('加载概览失败', err);
    }
  },

  async checkCrawlerStatus() {
    try {
      const status = await getCrawlerStatus();
      if (status && status.running) {
        this.setData({ crawlerRunning: true, crawlerText: '爬取中...' });
        this.pollCrawlerStatus();
      }
    } catch (err) {
      // ignore
    }
  },

  async startCrawler() {
    if (this.data.crawlerRunning) {
      wx.showToast({ title: '爬虫正在运行中', icon: 'none' });
      return;
    }

    this.setData({ crawlerRunning: true, crawlerText: '爬取中...' });
    wx.showLoading({ title: '正在启动数据爬取...' });

    try {
      await startCrawler();
      wx.hideLoading();
      wx.showToast({ title: '爬虫已启动', icon: 'success' });
      this.pollCrawlerStatus();
    } catch (err) {
      wx.hideLoading();
      this.setData({ crawlerRunning: false, crawlerText: '数据更新' });
      wx.showToast({ title: '启动失败: ' + (err.message || '未知错误'), icon: 'none' });
      console.error('启动爬虫失败', err);
    }
  },

  pollCrawlerStatus() {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = setInterval(async () => {
      try {
        const status = await getCrawlerStatus();
        if (!status || !status.running) {
          clearInterval(this._pollTimer);
          this._pollTimer = null;
          this.setData({ crawlerRunning: false, crawlerText: '数据更新' });
          wx.showToast({ title: '数据爬取完成', icon: 'success' });
          this.loadOverview();
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 3000);
  },

  onUnload() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  },

  formatSalary(min, max) {
    return formatSalary(min, max);
  },

  getTrendIcon(trend) {
    return getTrendIcon(trend);
  },

  getTrendColor(trend) {
    return getTrendColor(trend);
  },

  goToAssessment() {
    wx.switchTab({ url: '/pages/assessment/assessment' });
  },

  goToTrend(e) {
    const jobTitle = e.currentTarget.dataset.title || '';
    wx.navigateTo({ url: `/pages/trend/trend?jobTitle=${encodeURIComponent(jobTitle)}` });
  },

  goToJobDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/job-detail/job-detail?id=${id}` });
  },

  goToJobList() {
    wx.navigateTo({ url: '/pages/trend/trend' });
  },

  goToCareer() {
    wx.navigateTo({ url: '/pages/career/career' });
  },

  goToTraining() {
    wx.navigateTo({ url: '/pages/training/training' });
  },

  goToTrendPage() {
    wx.navigateTo({ url: '/pages/trend/trend' });
  }
});
