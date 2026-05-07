# AI韧性职业适配系统

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D3.11-yellow.svg)
![WeChat](https://img.shields.io/badge/微信小程序-原生框架-07C160.svg)

**基于招聘大数据与AI大模型的智能职业规划平台**

为应届生和职场新人提供AI驱动的职业韧性评估、岗位适配推荐、职业发展规划和能力培养方案。

[功能特性](#功能特性) • [快速开始](#快速开始) • [项目结构](#项目结构) • [API文档](#api文档) • [贡献指南](#贡献指南) • [许可证](#许可证)

</div>

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装步骤](#安装步骤)
  - [配置说明](#配置说明)
  - [启动项目](#启动项目)
- [项目结构](#项目结构)
- [API文档](#api文档)
- [使用指南](#使用指南)
- [开发指南](#开发指南)
  - [分支策略](#分支策略)
  - [提交规范](#提交规范)
  - [代码审查](#代码审查)
- [部署说明](#部署说明)
- [常见问题](#常见问题)
- [路线图](#路线图)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [联系方式](#联系方式)

---

## 项目简介

AI韧性职业适配系统是一款创新的微信小程序应用，旨在帮助应届生和职场新人更好地了解自身职业竞争力，获得个性化的职业发展建议。

### 核心价值

- **数据驱动**：基于真实招聘市场数据，提供客观的岗位趋势分析
- **AI赋能**：集成先进大模型技术，提供智能化的职业评估和建议
- **个性化服务**：根据用户画像，量身定制职业发展规划
- **一站式平台**：从评估到规划再到学习，提供完整的职业发展闭环

### 适用人群

- 即将毕业的大学生
- 初入职场的新人
- 考虑职业转型的职场人士
- 对职业规划有需求的人群

---

## 功能特性

### 1. 招聘大数据趋势洞察

- 热门岗位需求排行
- 技能关键词词云
- 薪资水平分布
- 行业发展趋势

### 2. AI职业韧性评估

基于五大维度进行综合评估：

| 维度 | 说明 |
|------|------|
| 抗压能力 | 面对工作压力的心理承受能力 |
| 适应能力 | 快速适应新环境和变化的能力 |
| 学习能力 | 持续学习和自我提升的能力 |
| 沟通能力 | 有效沟通和团队协作的能力 |
| 创新能力 | 突破常规、创新思维的能力 |

### 3. 智能岗位适配推荐

- 基于用户画像的精准匹配
- 匹配度评分和详细理由
- 岗位要求与个人能力对比
- 发展前景分析

### 4. 个性化职业规划

- 短期（1年）发展路径
- 中期（3年）职业目标
- 关键里程碑设定
- 可行的行动计划

### 5. 能力培养方案

- 定制化课程推荐
- AI工具实操练习
- 学习资源整理
- 进度跟踪反馈

---

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| 微信小程序 | 原生框架 | 跨平台移动应用框架 |
| WXML | - | 微信小程序标记语言 |
| WXSS | - | 微信小程序样式语言 |
| JavaScript | ES6+ | 前端逻辑处理 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 20.0.0 | 服务端运行环境 |
| Express | ^4.18.2 | Web应用框架 |
| sql.js | ^1.10.0 | SQLite数据库驱动 |
| JWT | ^9.0.2 | 身份认证 |
| Axios | ^1.6.0 | HTTP客户端 |

### 数据采集

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | >= 3.11 | 爬虫运行环境 |
| Requests | - | HTTP请求库 |
| BeautifulSoup | - | HTML解析库 |

### AI引擎

| 服务商 | 模型 | 说明 |
|--------|------|------|
| 通义千问 | qwen-turbo | 阿里云大模型 |
| 智谱GLM | glm-4 | 清华大模型 |
| DeepSeek | deepseek-chat | 深度求索大模型 |

### 数据库

| 技术 | 说明 |
|------|------|
| SQLite | 轻量级嵌入式数据库，无需单独安装 |

---

## 快速开始

### 环境要求

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 20.0.0 | 后端运行环境 |
| Python | >= 3.11 | 爬虫运行环境 |
| 微信开发者工具 | 最新稳定版 | 前端开发调试 |
| Git | >= 2.0 | 版本控制 |

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-career-weapp.git
cd ai-career-weapp
```

#### 2. 安装后端依赖

```bash
cd backend
npm install
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，填入必要配置
# 使用文本编辑器打开.env文件
```

#### 4. 注册大模型API

访问以下平台注册并获取API Key：

| 平台 | 网址 | 免费额度 |
|------|------|---------|
| 通义千问 | https://dashscope.aliyun.com/ | 100万token |
| 智谱GLM | https://open.bigmodel.cn/ | 500万token |
| DeepSeek | https://platform.deepseek.com/ | 500万token |

#### 5. 初始化数据库

```bash
# 在backend目录下运行
node -e "require('./models/db-wrapper').getWrapper()"
```

#### 6. 加载模拟数据（可选）

```bash
cd crawler
python seed_data.py
```

### 配置说明

编辑 `backend/.env` 文件：

```env
# 服务器配置
PORT=3000

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your_jwt_secret_here

# 微信小程序配置
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# AI大模型配置
LLM_PROVIDER=tongyi
LLM_API_KEY=your_api_key_here
```

### 启动项目

#### 启动后端服务

```bash
cd backend
npm run dev
```

成功启动后将看到：
```
[AI Career] 数据库初始化成功
[AI Career] 服务器已启动: http://localhost:3000
```

#### 启动前端小程序

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择 `frontend` 文件夹
4. 填入你的小程序 AppID
5. 在「详情」->「本地设置」中勾选「不校验合法域名」
6. 点击「编译」运行

---

## 项目结构

```
wxproject/
├── frontend/                    # 微信小程序前端
│   ├── app.js                   # 小程序入口文件
│   ├── app.json                 # 全局配置
│   ├── app.wxss                 # 全局样式
│   ├── config/                  # 配置文件
│   │   └── index.js             # API地址等配置
│   ├── pages/                   # 页面目录
│   │   ├── index/               # 首页
│   │   ├── assessment/          # 评估页面
│   │   ├── result/              # 评估结果
│   │   ├── career/              # 职业规划
│   │   ├── training/            # 培养方案
│   │   ├── trend/               # 趋势分析
│   │   ├── job-detail/          # 岗位详情
│   │   ├── profile/             # 个人中心
│   │   └── login/               # 登录页面
│   ├── utils/                   # 工具函数
│   │   ├── api.js               # API请求封装
│   │   ├── auth.js              # 认证相关
│   │   ├── service.js           # 业务服务
│   │   └── util.js              # 通用工具
│   └── images/                  # 图片资源
│
├── backend/                     # Node.js后端
│   ├── app.js                   # 服务器入口
│   ├── package.json             # 依赖配置
│   ├── .env                     # 环境变量（不提交）
│   ├── .env.example             # 环境变量模板
│   ├── config/                  # 配置加载
│   │   └── index.js
│   ├── controllers/             # 控制器层
│   │   ├── assessmentController.js
│   │   ├── authController.js
│   │   ├── careerController.js
│   │   └── dataController.js
│   ├── services/                # 服务层（业务逻辑）
│   │   ├── assessmentService.js
│   │   ├── authService.js
│   │   ├── careerService.js
│   │   └── dataService.js
│   ├── models/                  # 数据模型层
│   │   ├── db.js
│   │   └── db-wrapper.js
│   ├── routes/                  # 路由定义
│   │   ├── index.js
│   │   ├── assessment.js
│   │   ├── auth.js
│   │   ├── career.js
│   │   ├── crawler.js
│   │   └── data.js
│   ├── middleware/               # 中间件
│   │   ├── auth.js              # 认证中间件
│   │   └── errorHandler.js      # 错误处理
│   ├── utils/                   # 工具函数
│   │   ├── llm.js               # 大模型调用
│   │   ├── response.js          # 响应格式化
│   │   └── wechat.js            # 微信API
│   └── data/                    # 数据目录
│       └── ai_career.db         # SQLite数据库
│
├── crawler/                     # Python爬虫
│   ├── main.py                  # 爬虫主程序
│   ├── pipelines.py             # 数据处理管道
│   ├── analysis.py              # 数据分析
│   ├── seed_data.py             # 模拟数据生成
│   ├── test_crawler.py          # 爬虫测试
│   └── output/                  # 输出目录
│       └── raw/                 # 原始数据
│
├── docs/                        # 项目文档
│   ├── 01-环境搭建指南.md
│   ├── 02-需求设计文档.md
│   ├── 03-架构设计文档.md
│   ├── 04-接口设计文档.md
│   ├── 05-数据库设计文档.md
│   └── 06-使用指南.md
│
├── sql/                         # SQL脚本
│   └── init.sql                 # 数据库初始化
│
├── .gitignore                   # Git忽略文件
└── README.md                    # 项目说明
```

---

## API文档

### 基础信息

- 基础URL: `http://localhost:3000/api`
- 认证方式: Bearer Token (JWT)
- 数据格式: JSON

### 接口列表

#### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/login | 微信登录 |
| POST | /auth/phone-login | 手机号登录 |
| GET | /auth/profile | 获取用户信息 |
| PUT | /auth/profile | 更新用户信息 |

#### 数据相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /data/trends | 获取岗位趋势数据 |
| GET | /data/jobs | 获取职位列表 |
| GET | /data/jobs/:id | 获取职位详情 |
| GET | /data/skills | 获取技能统计数据 |
| GET | /data/salary | 获取薪资分布数据 |

#### 评估相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /assessment/submit | 提交评估数据 |
| GET | /assessment/result/:id | 获取评估结果 |
| GET | /assessment/history | 获取评估历史 |

#### 职业规划相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /career/plan | 生成职业规划 |
| POST | /career/training | 生成培养方案 |
| GET | /career/recommendations | 获取岗位推荐 |

### 请求示例

```javascript
// 提交评估数据
const response = await wx.request({
  url: 'http://localhost:3000/api/assessment/submit',
  method: 'POST',
  header: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  data: {
    major: '计算机科学与技术',
    personality: 'INTJ',
    preferences: {
      city: '北京',
      salary: '15-25k',
      industry: '互联网'
    }
  }
});
```

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "assessment_123",
    "resilience_score": 85,
    "dimensions": {
      "stress_tolerance": 82,
      "adaptability": 88,
      "learning_ability": 90,
      "communication": 78,
      "innovation": 85
    }
  }
}
```

---

## 使用指南

### 首页功能

1. **热门岗位排行**：查看当前市场上最热门的岗位
2. **技能增长趋势**：了解哪些技能正在快速增长
3. **薪资分布**：查看不同岗位的薪资水平
4. **进入评估**：开始AI职业韧性评估

### AI评估流程

1. **填写基本信息**
   - 选择专业方向
   - 选择性格类型
   - 设置工作偏好

2. **完成评估问卷**
   - 回答关于职业态度的问题
   - 评估个人能力水平

3. **查看评估结果**
   - 五维韧性得分
   - 能力雷达图
   - 综合分析报告

4. **获取岗位推荐**
   - 匹配度排名
   - 推荐理由分析
   - 岗位详情查看

5. **查看职业规划**
   - 短期发展路径
   - 中期职业目标
   - 关键里程碑

6. **获取培养方案**
   - 推荐课程列表
   - 学习资源整理
   - AI工具练习

### 个人中心

- 查看评估历史
- 管理收藏岗位
- 修改个人信息
- 系统设置

---

## 开发指南

### 分支策略

本项目采用 Git Flow 分支策略：

| 分支 | 用途 | 说明 |
|------|------|------|
| main | 生产分支 | 稳定版本，可部署 |
| develop | 开发分支 | 日常开发集成 |
| feature/* | 功能分支 | 新功能开发 |
| bugfix/* | 修复分支 | Bug修复 |
| release/* | 发布分支 | 版本发布准备 |
| hotfix/* | 热修复 | 紧急修复 |

```bash
# 创建功能分支
git checkout -b feature/new-feature develop

# 完成后合并到develop
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature
```

### 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型：**

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 代码重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具 |

**示例：**

```bash
git commit -m "feat(auth): 实现微信登录功能"
git commit -m "fix(api): 修复职位查询分页错误"
git commit -m "docs(readme): 更新安装指南"
```

### 代码审查

1. 所有代码必须通过 Pull Request 提交
2. PR 必须至少获得 1 个审批
3. 自动化测试必须通过
4. 代码必须符合项目规范

### 开发环境

```bash
# 启动后端开发服务器（热重载）
cd backend
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint
```

---

## 部署说明

### 本地部署

项目默认配置为本地开发环境，按照「快速开始」步骤即可运行。

### 生产环境部署

#### 1. 服务器要求

| 资源 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2核 | 4核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 40GB | 100GB |
| 带宽 | 5Mbps | 10Mbps |

#### 2. 部署步骤

```bash
# 1. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 克隆代码
git clone <repository-url>
cd ai-career-weapp

# 3. 安装依赖
cd backend
npm install --production

# 4. 配置环境变量
cp .env.example .env
# 编辑.env文件

# 5. 使用PM2启动
npm install -g pm2
pm2 start app.js --name ai-career-backend

# 6. 配置Nginx反向代理
# 参考docs/01-环境搭建指南.md
```

#### 3. 微信小程序发布

1. 在微信后台配置服务器域名
2. 上传小程序代码
3. 提交审核
4. 发布上线

#### 4. 成本估算

| 项目 | 费用（年） | 说明 |
|------|-----------|------|
| 域名 | 50-100元 | 需要备案 |
| SSL证书 | 0-5000元 | Let's Encrypt免费 |
| 云服务器 | 500-2000元 | 2核4G起步 |
| 大模型API | 按量计费 | 约0.004元/千token |
| **合计** | **约1000-8000元** | 取决于配置和用量 |

---

## 常见问题

### Q1: 后端启动失败怎么办？

**问题**：运行 `npm run dev` 后报错

**解决方案**：
1. 检查Node.js版本是否 >= 20.0.0
2. 检查端口3000是否被占用
3. 检查 `.env` 文件配置是否正确
4. 运行 `npm install` 重新安装依赖

### Q2: 小程序页面空白怎么办？

**问题**：微信开发者工具中页面显示空白

**解决方案**：
1. 检查是否勾选「不校验合法域名」
2. 检查后端服务是否启动
3. 查看控制台错误信息
4. 检查 `config/index.js` 中的API地址

### Q3: AI评估一直转圈怎么办？

**问题**：提交评估后一直加载中

**解决方案**：
1. 检查 `.env` 中的API Key是否正确
2. 检查网络是否能访问大模型API
3. 查看后端日志是否有错误
4. 确认API Key额度是否充足

### Q4: 如何更换AI模型？

**问题**：想使用不同的大模型

**解决方案**：
1. 编辑 `backend/.env` 文件
2. 修改 `LLM_PROVIDER` 为对应平台
3. 修改 `LLM_API_KEY` 为对应的Key
4. 重启后端服务

支持的平台：
- `tongyi` - 通义千问
- `zhipu` - 智谱GLM
- `deepseek` - DeepSeek

### Q5: 数据库文件在哪里？

SQLite数据库文件位于 `backend/data/ai_career.db`，会在后端首次启动时自动创建。可以使用 [DB Browser for SQLite](https://sqlitebrowser.org/) 查看和编辑。

---

## 路线图

### V1.0 当前版本 ✅

- [x] 微信小程序基础框架
- [x] AI韧性评估与岗位匹配
- [x] 职业发展规划生成
- [x] 能力培养方案推荐
- [x] 招聘趋势数据展示
- [x] 模拟数据支持
- [x] SQLite数据库支持

### V1.1 增强版 🚧

- [ ] 真实爬虫数据采集
- [ ] 评估结果分享功能
- [ ] 学习进度跟踪
- [ ] 评估历史对比
- [ ] 薪资分布图表
- [ ] UI美化优化

### V1.2 完善版 📋

- [ ] 收藏功能完善
- [ ] 深色模式支持
- [ ] 地域筛选功能
- [ ] 路径对比功能
- [ ] 多语言支持
- [ ] 用户反馈入口

### V2.0 进阶版 🔮

- [ ] AI模拟面试功能
- [ ] 简历AI优化建议
- [ ] 行业报告生成
- [ ] 社区交流功能
- [ ] 企业端对接
- [ ] 数据大屏展示

---

## 贡献指南

我们欢迎所有形式的贡献，包括但不限于：报告Bug、提出新功能、提交代码、完善文档等。

### 如何贡献

1. **Fork 本仓库**

2. **创建功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **提交更改**
   ```bash
   git commit -m 'feat: Add some amazing feature'
   ```

4. **推送到分支**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **创建 Pull Request**

### 贡献规范

- 遵循项目的代码规范
- 提交前确保代码通过测试
- 更新相关文档
- 保持提交信息清晰明了

### Bug报告

请使用 GitHub Issues 报告Bug，包含以下信息：

- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息
- 截图（如有）

### 功能建议

欢迎在 GitHub Issues 中提出功能建议，请说明：

- 功能描述
- 使用场景
- 实现思路（可选）

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

```
MIT License

Copyright (c) 2026 AI Career Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 联系方式

- **作者**: MaJY
- **邮箱**: your-email@example.com
- **GitHub**: [your-github-profile](https://github.com/your-username)

---

## 致谢

感谢以下开源项目和服务：

- [Express](https://expressjs.com/) - Web应用框架
- [sql.js](https://github.com/sql-js/sql.js/) - SQLite数据库
- [通义千问](https://tongyi.aliyun.com/) - AI大模型
- [智谱GLM](https://open.bigmodel.cn/) - AI大模型
- [DeepSeek](https://deepseek.com/) - AI大模型

---

<div align="center">

**如果这个项目对你有帮助，请给个 Star ⭐ 支持一下！**

</div>
