const config = require('../config/index');

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    wx.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          reject(res.data);
        } else {
          const msg = res.data?.message || '请求失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络异常，请检查网络', icon: 'none' });
        reject(err);
      }
    });
  });
};

const get = (url, data) => request({ url, method: 'GET', data });
const post = (url, data) => request({ url, method: 'POST', data });
const put = (url, data) => request({ url, method: 'PUT', data });
const del = (url, data) => request({ url, method: 'DELETE', data });

module.exports = { request, get, post, put, del };
