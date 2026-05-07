const authService = require('../services/authService');
const { code2Session } = require('../utils/wechat');
const { success, error } = require('../utils/response');
const config = require('../config');

async function login(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json(error(400, '参数错误：code不能为空'));
    }

    let openid;
    if (code === 'dev_login_code' && config.env !== 'production') {
      openid = 'dev_user_openid_001';
    } else {
      try {
        const wxSession = await code2Session(code);
        openid = wxSession.openid;
      } catch (wxErr) {
        if (config.env !== 'production') {
          openid = 'dev_user_openid_' + Date.now();
        } else {
          throw wxErr;
        }
      }
    }

    const result = await authService.login(openid);
    res.json(success(result, '登录成功'));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.userId;
    const result = await authService.updateProfile(userId, req.body);
    if (!result) {
      return res.status(400).json(error(400, '没有可更新的字段'));
    }
    res.json(success(result, '更新成功'));
  } catch (err) {
    next(err);
  }
}

async function getUserInfo(req, res, next) {
  try {
    const result = await authService.getUserInfo(req.userId);
    if (!result) {
      return res.status(404).json(error(404, '用户不存在'));
    }
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

module.exports = { login, updateProfile, getUserInfo };
