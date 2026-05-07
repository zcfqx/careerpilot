require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: '7d'
  },
  db: {
    path: process.env.DB_PATH || './data/ai_career.db'
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'qwen',
    qwenApiKey: process.env.QWEN_API_KEY || '',
    glmApiKey: process.env.GLM_API_KEY || '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || ''
  },
  wx: {
    appid: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || ''
  }
};
