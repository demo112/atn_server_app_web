# 文档管理规范

## 目录结构

```
docs/
├── api-contract.md          # API 契约（全局）
├── database-design.md       # 数据库设计（全局）
├── requirements.md          # 需求规格（全局）
├── requirement-analysis.md  # 需求分析（全局）
├── project-roadmap.md       # 项目路线图
├── task-backlog.md          # 任务清单
├── changelog.md             # 变更日志
├── deployment.md            # 部署文档
├── progress/                # 进展日志（按日期）
│   └── YYYY-MM-DD.md
└── features/                # 功能文档（按规格编号）
    └── {SPEC_ID}/
        ├── requirements.md  # 需求文档
        ├── design.md        # 设计文档
        └── tasks.md         # 任务拆分
```

## 命名规范

### 功能目录

使用规格编号，全大写：`SW62/`、`UA1/`

❌ 禁止：`sw62/`、`SW62_考勤配置/`、`UA1_UserManagement/`

### 文档文件

统一英文 kebab-case：

| 正确 ✅ | 错误 ❌ |
|---------|---------|
| `requirements.md` | `需求文档.md` |
| `design.md` | `设计文档.md` |
| `tasks.md` | `任务拆分.md` |

### 进展日志

日期格式：`YYYY-MM-DD.md`

## 创建新功能文档

```bash
docs/features/{SPEC_ID}/
├── requirements.md
├── design.md
└── tasks.md
```

## 禁止事项

- ❌ 功能目录名加中文
- ❌ 使用中文文件名
- ❌ 在 docs 根目录创建功能文档
- ❌ 创建嵌套重复目录
