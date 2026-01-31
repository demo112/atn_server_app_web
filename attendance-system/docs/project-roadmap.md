# 项目战斗地图

## 一、规格总览

```mermaid
flowchart TB
    subgraph sasuke["👤 人A (sasuke) - 用户/组织/统计"]
        UA1[UA1 用户管理]
        UA2[UA2 人员管理]
        UA3[UA3 部门管理]
        SW70[SW70 考勤汇总]
        SW71[SW71 考勤明细]
        SW72[SW72 统计报表]
    end

    subgraph naruto["👤 人B (naruto) - 考勤核心"]
        subgraph 基础配置
            SW62[SW62 考勤制度]
            SW63[SW63 时间段设置]
            SW64[SW64 班次管理]
        end
        
        subgraph 排班打卡
            SW65[SW65 排班管理]
            SW69[SW69 原始考勤数据]
        end
        
        subgraph 考勤处理
            SW66[SW66 补签处理]
            SW67[SW67 请假/出差]
            SW68[SW68 补签记录]
        end
    end

    UA1 --> UA2
    UA2 --> UA3
    UA3 --> SW65
    
    SW62 --> SW63
    SW63 --> SW64
    SW64 --> SW65
    SW65 --> SW69
    
    SW69 --> SW66
    SW69 --> SW67
    SW66 --> SW68
    
    SW69 --> SW70
    SW69 --> SW71
    SW70 --> SW72
    SW71 --> SW72
```

---

## 二、甘特图

```mermaid
gantt
    title 考勤系统开发计划
    dateFormat  YYYY-MM-DD
    
    section 里程碑
    M1-最小可用           :milestone, m1, 2026-02-13, 0d
    M2-核心功能           :milestone, m2, 2026-02-27, 0d
    M3-完整交付           :milestone, m3, 2026-03-13, 0d
    
    section sasuke-用户组织
    UA1-用户管理-Server   :a1, 2026-02-02, 3d
    UA1-用户管理-Web      :a2, 2026-02-02, 3d
    UA1-用户管理-App      :a3, after a1, 3d
    UA2-人员管理-Server   :a4, after a1, 2d
    UA2-人员管理-Web      :a5, after a4, 3d
    UA3-部门管理-Server   :a6, 2026-02-02, 2d
    UA3-部门管理-Web      :a7, after a6, 3d
    
    section sasuke-考勤统计
    SW70-汇总-Server      :a8, 2026-02-23, 3d
    SW70-汇总-Web         :a9, after a8, 3d
    SW71-明细-Server      :a10, 2026-02-23, 3d
    SW71-明细-Web         :a11, after a10, 3d
    SW72-报表-Server      :a12, after a8, 4d
    SW72-报表-Web         :a13, after a12, 4d
    
    section naruto-基础配置
    SW62-考勤制度         :b1, 2026-02-02, 1d
    SW63-时间段-Server    :b2, after b1, 3d
    SW63-时间段-Web       :b3, after b2, 3d
    SW64-班次-Server      :b4, after b2, 3d
    SW64-班次-Web         :b5, after b4, 3d
    
    section naruto-排班打卡
    SW65-排班-Server      :b6, after b4, 4d
    SW65-排班-Web         :b7, after b6, 4d
    SW69-打卡-Server      :b8, 2026-02-02, 5d
    SW69-打卡-Web         :b9, after b6, 3d
    SW69-打卡-App         :b10, 2026-02-02, 8d
    
    section naruto-考勤处理
    SW66-补签-Server      :b11, after b8, 3d
    SW66-补签-Web         :b12, after b11, 3d
    SW67-请假-Server      :b13, after b8, 3d
    SW67-请假-Web         :b14, after b13, 3d
    SW68-补签记录         :b15, after b11, 2d
```

---

## 三、任务依赖图

```mermaid
flowchart TD
    subgraph 基础设施["🏗️ 基础设施"]
        DB[(数据库)]
        Prisma[Prisma ORM]
        Shared[共享类型]
        API[API框架]
    end
    
    DB --> Prisma --> Shared --> API
    
    subgraph P0["🔴 P0 - 最小可用"]
        UA1[UA1 用户管理<br/>登录/认证/JWT<br/>👤 sasuke]
        UA2[UA2 人员管理<br/>人员档案CRUD<br/>👤 sasuke]
        UA3[UA3 部门管理<br/>部门树CRUD<br/>👤 sasuke]
        SW62[SW62 考勤制度<br/>基本规则<br/>👤 naruto]
        SW63[SW63 时间段<br/>普通/弹性<br/>👤 naruto]
        SW64[SW64 班次<br/>班次CRUD<br/>👤 naruto]
        SW69[SW69 打卡<br/>原始记录<br/>👤 naruto]
    end
    
    subgraph P1["🟡 P1 - 核心功能"]
        SW65[SW65 排班管理<br/>👤 naruto]
        SW66[SW66 补签处理<br/>👤 naruto]
        SW67[SW67 请假/出差<br/>👤 naruto]
        SW68[SW68 补签记录<br/>👤 naruto]
    end
    
    subgraph P2["🟢 P2 - 完整功能"]
        SW70[SW70 考勤汇总<br/>👤 sasuke]
        SW71[SW71 考勤明细<br/>👤 sasuke]
        SW72[SW72 统计报表<br/>👤 sasuke]
    end
    
    API --> UA1 & SW62
    
    UA1 --> UA2 --> UA3
    SW62 --> SW63 --> SW64
    
    UA3 --> SW65
    SW64 --> SW65
    SW65 --> SW69
    
    SW69 --> SW66 --> SW68
    SW69 --> SW67
    
    SW69 --> SW70 & SW71
    SW70 & SW71 --> SW72
```

---

## 四、模块依赖关系

```mermaid
flowchart LR
    subgraph Shared["@attendance/shared"]
        Types[类型定义]
    end
    
    subgraph Server["@attendance/server"]
        UserMod[modules/user<br/>👤 sasuke]
        AttMod[modules/attendance<br/>👤 naruto]
        StatsMod[modules/stats<br/>👤 sasuke]
    end
    
    subgraph Web["@attendance/web"]
        WebUser[用户/人员/部门<br/>👤 sasuke]
        WebAtt[考勤配置/处理<br/>👤 naruto]
        WebStats[统计报表<br/>👤 sasuke]
    end
    
    subgraph App["@attendance/app"]
        AppUser[登录模块<br/>👤 sasuke]
        AppAtt[打卡模块<br/>👤 naruto]
    end
    
    Types --> UserMod & AttMod & StatsMod
    Types --> WebUser & WebAtt & WebStats
    Types --> AppUser & AppAtt
    
    UserMod -.->|API| WebUser & AppUser
    AttMod -.->|API| WebAtt & AppAtt
    StatsMod -.->|API| WebStats
```

---

## 五、优先级矩阵

| 优先级 | 规格 | 依赖 | 工时 | 负责人 |
|:------:|------|------|:----:|:------:|
| 🔴 P0 | UA1-用户管理 | - | 3d | sasuke |
| 🔴 P0 | UA2-人员管理 | UA1 | 2d | sasuke |
| 🔴 P0 | UA3-部门管理 | UA2 | 2d | sasuke |
| 🔴 P0 | SW62-考勤制度 | - | 0.5d | naruto |
| 🔴 P0 | SW63-时间段 | SW62 | 2d | naruto |
| 🔴 P0 | SW64-班次 | SW63 | 2d | naruto |
| � P0 | SW69-打卡 | SW65 | 3d | naruto |
| 🟡 P1 | SW65-排班 | UA3,SW64 | 3d | naruto |
| 🟡 P1 | SW66-补签 | SW69 | 2d | naruto |
| 🟡 P1 | SW67-请假 | UA2 | 2d | naruto |
| 🟡 P1 | SW68-补签记录 | SW66 | 1d | naruto |
| 🟢 P2 | SW70-汇总 | SW69 | 2d | sasuke |
| 🟢 P2 | SW71-明细 | SW69 | 2d | sasuke |
| 🟢 P2 | SW72-报表 | SW70,SW71 | 3d | sasuke |

---

## 六、检查点

```mermaid
timeline
    title 项目里程碑
    
    section W1-W2
        CP1 基础框架 : Server启动
                    : 数据库连接
                    : API框架就绪
        CP2 最小可用 : 用户登录
                    : App打卡成功
    
    section W3-W4
        CP3 排班完成 : 时间段配置
                    : 班次管理
                    : 排班分配
        CP4 考勤处理 : 补签功能
                    : 请假功能
    
    section W5-W6
        CP5 统计基础 : 汇总查询
                    : 明细查询
        CP6 完整交付 : 全部报表
                    : 三端联调
```
