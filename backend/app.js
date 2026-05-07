const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { getWrapper } = require('./models/db-wrapper');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'AI韧性职业适配系统后端服务运行中', data: null });
});

app.use(errorHandler);

async function startServer() {
  try {
    await getWrapper();
    console.log('[AI Career] 数据库初始化成功');
    
    app.listen(config.port, () => {
      console.log(`[AI Career] 服务器已启动: http://localhost:${config.port}`);
      console.log(`[AI Career] API文档: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('[AI Career] 数据库初始化失败:', error);
    process.exit(1);
  }
}

startServer();