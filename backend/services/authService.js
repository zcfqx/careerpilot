const { getWrapper } = require('../models/db-wrapper');
const { generateToken } = require('../middleware/auth');

async function login(openid, nickname = '', avatar = '') {
  const db = await getWrapper();
  const existing = db.prepare('SELECT id, nickname, avatar FROM users WHERE openid = ?').get(openid);

  if (existing) {
    if (nickname || avatar) {
      db.prepare(
        'UPDATE users SET nickname = ?, avatar = ? WHERE id = ?'
      ).run(nickname || existing.nickname, avatar || existing.avatar, existing.id);
    }

    const token = generateToken(existing.id);
    return {
      token,
      userInfo: { id: existing.id, openid, nickname: nickname || existing.nickname, avatar: avatar || existing.avatar }
    };
  }

  const result = db.prepare(
    'INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)'
  ).run(openid, nickname, avatar);

  const token = generateToken(result.lastInsertRowid);
  return {
    token,
    userInfo: { id: result.lastInsertRowid, openid, nickname, avatar }
  };
}

async function getUserInfo(userId) {
  const db = await getWrapper();
  const user = db.prepare(
    'SELECT id, openid, nickname, avatar FROM users WHERE id = ?'
  ).get(userId);

  if (!user) return null;

  const assessmentCountRow = db.prepare(
    'SELECT COUNT(*) as count FROM assessments WHERE user_id = ?'
  ).get(userId);

  const planCountRow = db.prepare(
    'SELECT COUNT(*) as count FROM career_plans WHERE user_id = ?'
  ).get(userId);

  user.assessmentCount = assessmentCountRow.count || 0;
  user.planCount = planCountRow.count || 0;

  return user;
}

async function updateProfile(userId, data) {
  const db = await getWrapper();
  const { nickname, avatar } = data;
  const updates = [];
  const params = [];

  if (nickname !== undefined) {
    updates.push('nickname = ?');
    params.push(nickname);
  }
  if (avatar !== undefined) {
    updates.push('avatar = ?');
    params.push(avatar);
  }

  if (updates.length === 0) {
    return null;
  }

  updates.push("updated_at = datetime('now', 'localtime')");
  params.push(userId);

  db.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).run(...params);

  return getUserInfo(userId);
}

module.exports = {
  login,
  getUserInfo,
  updateProfile
};