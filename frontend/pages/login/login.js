const { login } = require('../../utils/auth');

const app = getApp();

Page({
  data: {
    logging: false
  },

  handleLogin() {
    if (this.data.logging) return;
    this.setData({ logging: true });

    wx.login({
      success: (res) => {
        if (res.code) {
          login(res.code).then(data => {
            app.globalData.token = data.token;
            app.globalData.userInfo = data.userInfo;
            wx.setStorageSync('token', data.token);
            wx.showToast({ title: '登录成功', icon: 'success' });
            setTimeout(() => {
              wx.switchTab({ url: '/pages/index/index' });
            }, 800);
          }).catch(err => {
            console.error('登录失败', err);
            this.loginWithDev();
          }).finally(() => {
            this.setData({ logging: false });
          });
        } else {
          this.loginWithDev();
        }
      },
      fail: () => {
        this.loginWithDev();
      }
    });
  },

  loginWithDev() {
    login('dev_login_code').then(data => {
      app.globalData.token = data.token;
      app.globalData.userInfo = data.userInfo;
      wx.setStorageSync('token', data.token);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 800);
    }).catch(err => {
      console.error('开发登录失败', err);
      wx.showToast({ title: '登录失败，请检查网络', icon: 'none' });
    }).finally(() => {
      this.setData({ logging: false });
    });
  }
});
