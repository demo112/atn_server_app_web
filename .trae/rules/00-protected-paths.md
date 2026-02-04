# 受保护路径规则

## 强制约束

**以下路径禁止 AI 修改，必须由人工维护：**

| 路径 | 说明 |
|------|------|
| `.trae/` | Trae 配置和规则文件 |
| `.kiro/` | Kiro 配置和 steering 文件 |
| `attendance-system/docs/*.md` | docs 根目录下的核心文档 |
| `attendance-system/.env` | 环境变量配置文件 |
## docs 根目录保护说明

`attendance-system/docs/` 根目录下的以下文档禁止 AI 直接修改：

- `api-contract.md` - API 契约
- `database-design.md` - 数据库设计
- `requirements.md` - 需求规格
- `requirement-analysis.md` - 需求分析
- `project-roadmap.md` - 项目路线图
- `task-backlog.md` - 任务清单
- `changelog.md` - 变更日志
- `deployment.md` - 部署文档

**注意**：`docs/features/` 和 `docs/progress/` 子目录下的文档可以正常编辑。

## 规则

1. **禁止创建** - 不得在上述目录下创建任何新文件
2. **禁止修改** - 不得修改上述目录下的任何现有文件
3. **禁止删除** - 不得删除上述目录下的任何文件

## 遇到相关请求时

如果用户要求修改这些文件：

1. **拒绝执行**
2. **说明原因**：这些是 AI 工具的配置文件，需要人工审核后手动修改
3. **提供建议**：将修改内容输出为代码块，由用户自行复制粘贴

## 示例回复

```
这个文件位于 .trae/ 目录下，属于受保护路径。
我无法直接修改，但可以提供修改建议：

[修改内容]

请您手动将上述内容更新到文件中。
```
