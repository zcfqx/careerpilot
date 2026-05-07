const config = require('./config/index');
const { login } = require('./utils/auth');

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: config.baseUrl
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  checkLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.token) {
        resolve(this.globalData.token);
        return;
      }

      wx.login({
        success: (res) => {
          if (res.code) {
            login(res.code).then(data => {
              this.globalData.token = data.token;
              this.globalData.userInfo = data.userInfo;
              wx.setStorageSync('token', data.token);
              resolve(data.token);
            }).catch(err => {
              console.warn('微信登录失败，尝试开发登录', err);
              this.devLogin().then(resolve).catch(reject);
            });
          } else {
            this.devLogin().then(resolve).catch(reject);
          }
        },
        fail: () => {
          this.devLogin().then(resolve).catch(reject);
        }
      });
    });
  },

  devLogin() {
    return new Promise((resolve, reject) => {
      login('dev_login_code').then(data => {
        this.globalData.token = data.token;
        this.globalData.userInfo = data.userInfo;
        wx.setStorageSync('token', data.token);
        resolve(data.token);
      }).catch(err => {
        console.error('所有登录方式均失败', err);
        wx.navigateTo({ url: '/pages/login/login' });
        reject(err);
      });
    });
  }
});
