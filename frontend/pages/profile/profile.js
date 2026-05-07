const app = getApp();
const { getUserInfo } = require('../../utils/auth');
const { getAssessmentHistory } = require('../../utils/service');

Page({
  data: {
    userInfo: null,
    assessmentHistory: [],
    loading: true
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      await app.checkLogin();
      const info = await getUserInfo();
      const history = await getAssessmentHistory(1, 5);
      this.setData({
        userInfo: info,
        assessmentHistory: history.list,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goToAssessment() {
    wx.switchTab({ url: '/pages/assessment/assessment' });
  },

  viewAssessment(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/result/result?assessmentId=${id}` });
  },

  goToTrend() {
    wx.navigateTo({ url: '/pages/trend/trend' });
  }
});
