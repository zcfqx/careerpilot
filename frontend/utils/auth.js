const { post } = require('./api');

async function login(code) {
  return post('/auth/login', { code });
}

async function updateProfile(data) {
  const { put } = require('./api');
  return put('/auth/profile', data);
}

async function getUserInfo() {
  const { get } = require('./api');
  return get('/auth/info');
}

module.exports = { login, updateProfile, getUserInfo };
