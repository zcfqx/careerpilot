# Git操作流程规范

## 1. 分支策略

### 1.1 分支类型

| 分支类型 | 命名规范 | 用途 | 生命周期 |
|---------|---------|------|---------|
| 主分支 | `main` | 生产环境代码，始终稳定可部署 | 永久 |
| 开发分支 | `develop` | 日常开发集成分支，最新开发进度 | 永久 |
| 功能分支 | `feature/功能名称` | 新功能开发 | 临时，合并后删除 |
| 修复分支 | `bugfix/问题描述` | 非紧急Bug修复 | 临时，合并后删除 |
| 热修复分支 | `hotfix/问题描述` | 生产环境紧急修复 | 临时，合并后删除 |
| 发布分支 | `release/版本号` | 版本发布准备 | 临时，发布后删除 |

### 1.2 分支工作流

```
main (生产)
  ↑
  ├── release/v1.0.0 (发布准备)
  │     ↑
  │     ├── develop (开发集成)
  │     │     ↑
  │     │     ├── feature/user-auth (功能开发)
  │     │     ├── feature/ai-assessment (功能开发)
  │     │     └── bugfix/login-error (Bug修复)
  │     │
  │     └── hotfix/critical-bug (紧急修复)
  │
  └── tag: v1.0.0 (版本标签)
```

### 1.3 分支操作命令

```bash
# 创建并切换到开发分支
git checkout -b develop main

# 创建功能分支
git checkout -b feature/user-auth develop

# 创建修复分支
git checkout -b bugfix/login-error develop

# 创建热修复分支
git checkout -b hotfix/critical-bug main

# 创建发布分支
git checkout -b release/v1.0.0 develop
```

---

## 2. 提交规范

### 2.1 Commit Message 格式

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Type 类型说明

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加微信登录功能` |
| `fix` | Bug修复 | `fix(api): 修复用户信息查询错误` |
| `docs` | 文档更新 | `docs(readme): 更新安装指南` |
| `style` | 代码格式（不影响功能） | `style(frontend): 格式化代码缩进` |
| `refactor` | 代码重构 | `refactor(service): 重构评估服务逻辑` |
| `perf` | 性能优化 | `perf(db): 优化数据库查询性能` |
| `test` | 测试相关 | `test(auth): 添加登录接口单元测试` |
| `chore` | 构建/工具变动 | `chore(deps): 更新依赖版本` |
| `ci` | CI配置 | `ci(github): 添加自动化测试流程` |
| `revert` | 回滚 | `revert: 回滚feat(auth)提交` |

### 2.3 Scope 范围说明

| Scope | 说明 |
|-------|------|
| `frontend` | 前端相关 |
| `backend` | 后端相关 |
| `crawler` | 爬虫相关 |
| `auth` | 认证模块 |
| `api` | API接口 |
| `db` | 数据库 |
| `config` | 配置 |
| `docs` | 文档 |

### 2.4 提交示例

```bash
# 新功能
git commit -m "feat(auth): 实现JWT Token认证机制"

# Bug修复
git commit -m "fix(api): 修复职位列表分页参数错误"

# 文档更新
git commit -m "docs(api): 添加接口设计文档"

# 代码重构
git commit -m "refactor(service): 重构AI服务调用逻辑"

# 性能优化
git commit -m "perf(db): 添加数据库索引优化查询"

# 多行提交
git commit -m "feat(assessment): 实现AI韧性评估功能

- 集成通义千问大模型API
- 实现评估数据采集和处理
- 生成评估结果和建议

Closes #123"
```

### 2.5 提交前检查清单

- [ ] 代码已经过本地测试
- [ ] 代码符合项目编码规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 没有提交敏感信息（API Key、密码等）
- [ ] 提交信息清晰明了

---

## 3. 代码审查流程

### 3.1 审查流程

```
1. 开发者完成功能开发
   ↓
2. 自我审查代码
   ↓
3. 提交Pull Request (PR)
   ↓
4. 自动化测试运行
   ↓
5. 指定审查者审查代码
   ↓
6. 审查通过 → 合并到目标分支
   ↓
7. 审查不通过 → 返回修改 → 重新提交
```

### 3.2 Pull Request 规范

#### PR 标题格式
```
[类型] 简短描述
```

示例：
- `[Feature] 实现用户登录功能`
- `[Bugfix] 修复评估结果计算错误`
- `[Refactor] 重构爬虫数据处理模块`

#### PR 描述模板

```markdown
## 变更描述
简要描述本次变更的内容和目的。

## 变更类型
- [ ] 新功能 (Feature)
- [ ] Bug修复 (Bugfix)
- [ ] 代码重构 (Refactor)
- [ ] 文档更新 (Docs)
- [ ] 性能优化 (Performance)
- [ ] 其他 (Other)

## 测试情况
- [ ] 已添加单元测试
- [ ] 已进行集成测试
- [ ] 已进行手动测试

## 相关Issue
Closes #<issue_number>

## 截图（如有UI变更）
[添加截图]

## 审查者
@<reviewer_username>
```

### 3.3 代码审查要点

#### 代码质量
- 代码逻辑是否清晰
- 命名是否规范
- 是否有重复代码
- 是否有潜在的性能问题

#### 功能实现
- 是否满足需求
- 边界情况处理
- 错误处理是否完善
- 是否有安全漏洞

#### 代码规范
- 是否符合项目编码规范
- 注释是否充分
- 是否有未使用的代码
- 是否有硬编码的值

### 3.4 审查者职责

| 职责 | 说明 |
|------|------|
| 及时响应 | PR提交后24小时内完成审查 |
| 详细反馈 | 提供具体、建设性的反馈意见 |
| 代码讨论 | 对不确定的问题进行讨论 |
| 最终决策 | 决定是否合并代码 |

---

## 4. 版本控制计划

### 4.1 版本号规范

采用 [Semantic Versioning](https://semver.org/) 规范：

```
MAJOR.MINOR.PATCH
```

| 版本类型 | 说明 | 示例 |
|---------|------|------|
| MAJOR | 不兼容的API变更 | 1.0.0 → 2.0.0 |
| MINOR | 向后兼容的功能性新增 | 1.0.0 → 1.1.0 |
| PATCH | 向后兼容的问题修复 | 1.0.0 → 1.0.1 |

### 4.2 版本发布流程

```
1. 从develop分支创建release分支
   ↓
2. 在release分支上进行最后测试和修复
   ↓
3. 更新版本号和CHANGELOG
   ↓
4. 合并到main分支
   ↓
5. 打版本标签
   ↓
6. 合并回develop分支
   ↓
7. 删除release分支
```

### 4.3 版本标签操作

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "版本1.0.0发布"

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 查看所有标签
git tag

# 查看特定标签信息
git show v1.0.0
```

### 4.4 CHANGELOG 格式

```markdown
# Changelog

## [1.1.0] - 2026-05-15

### Added
- 新增用户收藏功能
- 新增深色模式支持

### Changed
- 优化首页加载速度
- 更新依赖版本

### Fixed
- 修复登录偶尔失败的问题
- 修复评估结果计算错误

## [1.0.0] - 2026-05-01

### Added
- 初始版本发布
- 用户认证功能
- AI韧性评估功能
- 岗位适配推荐
- 职业发展规划
- 能力培养方案
```

---

## 5. 常用Git命令

### 5.1 基础操作

```bash
# 初始化仓库
git init

# 克隆仓库
git clone <repository_url>

# 查看状态
git status

# 添加文件到暂存区
git add <file>
git add .

# 提交更改
git commit -m "commit message"

# 查看提交历史
git log
git log --oneline
git log --graph
```

### 5.2 分支操作

```bash
# 查看分支
git branch
git branch -a

# 创建分支
git branch <branch_name>

# 切换分支
git checkout <branch_name>

# 创建并切换分支
git checkout -b <branch_name>

# 删除分支
git branch -d <branch_name>

# 强制删除分支
git branch -D <branch_name>
```

### 5.3 合并操作

```bash
# 合并分支
git merge <branch_name>

# 变基操作
git rebase <branch_name>

# 解决冲突后继续合并
git merge --continue

# 中止合并
git merge --abort
```

### 5.4 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <repository_url>

# 推送到远程
git push origin <branch_name>

# 拉取远程更新
git pull origin <branch_name>

# 获取远程更新（不合并）
git fetch origin
```

### 5.5 撤销操作

```bash
# 撤销工作区修改
git checkout -- <file>

# 撤销暂存区修改
git reset HEAD <file>

# 回滚到指定提交
git reset --hard <commit_hash>

# 创建新的提交来撤销之前的提交
git revert <commit_hash>
```

---

## 6. Git钩子配置

### 6.1 提交前检查 (pre-commit)

创建 `.husky/pre-commit` 文件：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test
```

### 6.2 提交信息检查 (commit-msg)

创建 `.husky/commit-msg` 文件：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit "$1"
```

### 6.3 推送前检查 (pre-push)

创建 `.husky/pre-push` 文件：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test
npm run build
```

---

## 7. 团队协作规范

### 7.1 日常工作流程

1. **开始工作前**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **开发过程中**
   ```bash
   git add .
   git commit -m "feat(scope): 描述"
   ```

3. **完成开发后**
   ```bash
   git push origin feature/my-feature
   # 创建Pull Request
   ```

4. **PR合并后**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/my-feature
   ```

### 7.2 冲突解决流程

1. 拉取最新代码
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/my-feature
   git merge develop
   ```

2. 解决冲突
   - 打开冲突文件
   - 手动编辑解决冲突
   - 标记冲突已解决

3. 提交解决方案
   ```bash
   git add .
   git commit -m "merge: 解决与develop分支的冲突"
   ```

### 7.3 代码同步规范

- 每天开始工作前先同步develop分支
- 功能分支定期从develop合并最新代码
- 避免长时间不合并导致大量冲突
- 大型功能拆分为多个小PR

---

## 8. 工具配置

### 8.1 Git配置

```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "code --wait"

# 设置默认分支名
git config --global init.defaultBranch main

# 设置自动换行处理
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Mac/Linux
```

### 8.2 IDE集成

#### VS Code
- 安装GitLens插件
- 安装Git Graph插件
- 配置自动格式化

#### WebStorm/IDEA
- 内置Git支持
- 配置Commit Template

### 8.3 Git GUI工具

| 工具 | 说明 | 推荐度 |
|------|------|--------|
| Source Tree | 免费，功能强大 | ⭐⭐⭐⭐⭐ |
| GitKraken | 界面美观，付费 | ⭐⭐⭐⭐ |
| GitHub Desktop | 简单易用，免费 | ⭐⭐⭐⭐ |
| Tortoise Git | Windows集成 | ⭐⭐⭐ |
