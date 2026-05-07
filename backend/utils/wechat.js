const axios = require('axios');
const config = require('../config');

async function code2Session(code) {
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const params = {
    appid: config.wx.appid,
    secret: config.wx.secret,
    js_code: code,
    grant_type: 'authorization_code'
  };
  const response = await axios.get(url, { params });
  if (response.data.errcode) {
    throw new Error(`微信登录失败: ${response.data.errmsg}`);
  }
  return {
    openid: response.data.openid,
    session_key: response.data.session_key,
    unionid: response.data.unionid
  };
}

module.exports = { code2Session };
