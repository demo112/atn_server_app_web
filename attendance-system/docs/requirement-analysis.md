# 需求分析文档

## 一、业务全景图

```mermaid
flowchart TB
    subgraph 管理员操作["🖥️ Web 管理端"]
        A1[组织架构管理]
        A2[人员管理]
        A3[考勤规则配置]
        A4[排班管理]
        A5[考勤处理]
        A6[统计报表]
    end
    
    subgraph 员工操作["📱 App 端"]
        B1[登录]
        B2[打卡]
        B3[查看个人考勤]
    end
    
    subgraph 系统处理["⚙️ Server"]
        C1[考勤计算引擎]
        C2[数据存储]
    end
    
    A1 --> A2
    A2 --> A4
    A3 --> A4
    A4 --> C1
    B2 --> C1
    C1 --> C2
    C2 --> A5
    C2 --> A6
    C2 --> B3
```

---

## 二、核心业务流程

### 2.1 考勤主流程

```mermaid
flowchart LR
    subgraph 准备阶段
        P1[创建部门] --> P2[录入人员]
        P2 --> P3[配置时间段]
        P3 --> P4[创建班次]
        P4 --> P5[排班]
    end
    
    subgraph 执行阶段
        E1[员工打卡] --> E2[记录原始数据]
        E2 --> E3[考勤计算]
        E3 --> E4[生成每日记录]
    end
    
    subgraph 处理阶段
        H1[异常处理<br/>补签/请假]
        H1 --> H2[重新计算]
    end
    
    subgraph 统计阶段
        S1[汇总统计]
        S2[生成报表]
    end
    
    P5 --> E1
    E4 --> H1
    H2 --> E4
    E4 --> S1 --> S2
```

### 2.2 打卡流程详解

```mermaid
sequenceDiagram
    participant App as 📱 App
    participant Server as ⚙️ Server
    participant DB as 🗄️ Database
    
    App->>Server: 1. 请求打卡(userId, time)
    Server->>DB: 2. 查询人员当日排班
    DB-->>Server: 3. 返回班次信息
    Server->>DB: 4. 保存原始打卡记录
    Server->>Server: 5. 触发考勤计算
    Server->>DB: 6. 更新/创建每日考勤记录
    Server-->>App: 7. 返回打卡结果
```

### 2.3 考勤计算流程

```mermaid
flowchart TD
    Start[开始计算] --> A{有排班?}
    A -->|否| B[标记为无需考勤]
    A -->|是| C[获取当日打卡记录]
    C --> D{有打卡?}
    D -->|否| E{有请假?}
    E -->|是| F[标记为请假]
    E -->|否| G[标记为缺勤]
    D -->|是| H[匹配签到签退]
    H --> I{签到时间?}
    I -->|早于上班时间| J[正常签到]
    I -->|晚于上班时间| K[计算迟到时长]
    J --> L{签退时间?}
    K --> L
    L -->|早于下班时间| M[计算早退时长]
    L -->|晚于下班时间| N[正常签退]
    L -->|无签退| O{有请假?}
    O -->|是| P[部分请假]
    O -->|否| Q[标记未签退]
    M --> R[生成每日记录]
    N --> R
    P --> R
    Q --> R
    B --> End[结束]
    F --> End
    G --> End
    R --> End
```

---

## 三、领域模型

### 3.1 核心实体关系

```mermaid
erDiagram
    User ||--o| Employee : "关联"
    Employee }o--|| Department : "属于"
    Department ||--o{ Department : "父子"
    
    Employee ||--o{ AttSchedule : "排班"
    AttShift ||--o{ AttSchedule : "使用"
    AttShift ||--o{ AttShiftPeriod : "包含"
    AttTimePeriod ||--o{ AttShiftPeriod : "被引用"
    
    Employee ||--o{ AttClockRecord : "打卡"
    Employee ||--o{ AttDailyRecord : "每日记录"
    AttDailyRecord ||--o{ AttCorrection : "补签"
    Employee ||--o{ AttLeave : "请假"
    
    User {
        int id PK
        string username
        string passwordHash
        int employeeId FK
    }
    
    Employee {
        int id PK
        string employeeNo
        string name
        string phone
        int deptId FK
        enum status
    }
    
    Department {
        int id PK
        string name
        int parentId FK
        int sortOrder
    }
    
    AttTimePeriod {
        int id PK
        string name
        enum type
        time workStart
        time workEnd
    }
    
    AttShift {
        int id PK
        string name
        int cycleDays
    }
    
    AttSchedule {
        int id PK
        int employeeId FK
        int shiftId FK
        date startDate
        date endDate
    }
    
    AttClockRecord {
        bigint id PK
        int employeeId FK
        datetime clockTime
        enum clockType
    }
    
    AttDailyRecord {
        bigint id PK
        int employeeId FK
        date workDate
        datetime checkInTime
        datetime checkOutTime
        enum status
    }
    
    AttCorrection {
        int id PK
        bigint dailyRecordId FK
        enum type
        datetime correctionTime
    }
    
    AttLeave {
        int id PK
        int employeeId FK
        enum type
        datetime startTime
        datetime endTime
    }
```

### 3.2 实体说明

| 实体 | 说明 | 负责人 |
|------|------|--------|
| User | 系统账号，用于登录认证 | sasuke |
| Employee | 人员档案，考勤主体 | sasuke |
| Department | 部门，树形结构 | sasuke |
| AttTimePeriod | 时间段，定义上下班时间 | naruto |
| AttShift | 班次，由多个时间段组成 | naruto |
| AttSchedule | 排班，人员与班次的关联 | naruto |
| AttClockRecord | 原始打卡记录 | naruto |
| AttDailyRecord | 每日考勤记录（计算结果） | naruto |
| AttCorrection | 补签记录 | naruto |
| AttLeave | 请假/出差记录 | naruto |

---

## 四、状态定义

### 4.1 人员状态

```mermaid
stateDiagram-v2
    [*] --> 在职: 入职
    在职 --> 离职: 离职
    离职 --> 在职: 重新入职
    在职 --> [*]: 删除
```

| 状态 | 说明 |
|------|------|
| active | 在职，可打卡、可排班 |
| inactive | 离职，不可打卡、保留历史数据 |

### 4.2 考勤状态

```mermaid
stateDiagram-v2
    [*] --> 待计算: 打卡/排班变更
    待计算 --> 正常: 签到签退都正常
    待计算 --> 迟到: 签到晚于上班时间
    待计算 --> 早退: 签退早于下班时间
    待计算 --> 缺勤: 无打卡且无请假
    待计算 --> 请假: 有请假记录
    待计算 --> 出差: 有出差记录
    
    迟到 --> 正常: 补签
    早退 --> 正常: 补签
    缺勤 --> 正常: 补签
```

| 状态 | 代码 | 说明 |
|------|------|------|
| 正常 | normal | 签到签退都在规定时间内 |
| 迟到 | late | 签到时间晚于上班时间 |
| 早退 | early_leave | 签退时间早于下班时间 |
| 缺勤 | absent | 无打卡记录且无请假 |
| 请假 | leave | 有请假记录覆盖 |
| 出差 | business_trip | 有出差记录覆盖 |

### 4.3 请假状态

```mermaid
stateDiagram-v2
    [*] --> 待审批: 提交申请
    待审批 --> 已通过: 审批通过
    待审批 --> 已拒绝: 审批拒绝
    待审批 --> 已撤销: 申请人撤销
    已通过 --> [*]: 生效并影响考勤
    已拒绝 --> [*]: 结束
    已撤销 --> [*]: 结束
```

| 状态 | 代码 | 说明 |
|------|------|------|
| 待审批 | pending | 已提交，等待审批 |
| 已通过 | approved | 审批通过，影响考勤计算 |
| 已拒绝 | rejected | 审批拒绝，不影响考勤 |
| 已撤销 | cancelled | 申请人主动撤销 |

### 4.4 请假审批流程

```mermaid
sequenceDiagram
    participant E as 员工
    participant S as 系统
    participant A as 审批人
    participant C as 考勤计算
    
    E->>S: 1. 提交请假申请
    S->>S: 2. 创建请假记录(pending)
    S->>A: 3. 通知审批人
    A->>S: 4. 审批通过/拒绝
    alt 审批通过
        S->>S: 5a. 更新状态(approved)
        S->>C: 6a. 触发考勤重算
        C->>S: 7a. 更新每日记录
    else 审批拒绝
        S->>S: 5b. 更新状态(rejected)
    end
    S->>E: 8. 通知申请人结果
```

---

## 五、模块接口边界

### 5.1 模块依赖关系

```mermaid
flowchart LR
    subgraph sasuke["sasuke 负责"]
        M1[用户模块]
        M2[人员模块]
        M3[部门模块]
        M4[统计模块]
    end
    
    subgraph naruto["naruto 负责"]
        M5[时间段模块]
        M6[班次模块]
        M7[排班模块]
        M8[打卡模块]
        M9[考勤处理模块]
    end
    
    M1 --> M2
    M2 --> M3
    M3 -.->|部门树| M7
    M2 -.->|人员列表| M7
    M2 -.->|人员信息| M8
    M5 --> M6 --> M7 --> M8 --> M9
    M9 -.->|考勤数据| M4
```

### 5.2 跨模块接口定义

#### sasuke 提供给 naruto 的接口

| 接口 | 方法 | 路径 | 说明 | 调用方 |
|------|------|------|------|--------|
| 获取部门树 | GET | /api/v1/departments/tree | 返回完整部门树 | 排班、统计页面 |
| 获取部门人员 | GET | /api/v1/departments/:id/employees | 返回部门下所有人员 | 排班页面 |
| 获取人员信息 | GET | /api/v1/employees/:id | 返回单个人员详情 | 打卡、考勤记录 |
| 批量获取人员 | POST | /api/v1/employees/batch | 批量查询人员信息 | 统计报表 |

#### naruto 提供给 sasuke 的接口

| 接口 | 方法 | 路径 | 说明 | 调用方 |
|------|------|------|------|--------|
| 获取每日考勤记录 | GET | /api/v1/attendance/daily | 按条件查询每日记录 | 统计模块 |
| 获取考勤汇总数据 | GET | /api/v1/attendance/summary | 返回汇总统计数据 | 统计模块 |
| 获取原始打卡记录 | GET | /api/v1/attendance/clock-records | 返回原始打卡数据 | 统计模块 |

### 5.3 数据格式约定

#### 人员信息（sasuke 提供）

```typescript
interface Employee {
  id: number;
  employeeNo: string;      // 人员编号
  name: string;            // 姓名
  phone?: string;          // 手机号
  deptId: number;          // 部门ID
  deptName: string;        // 部门名称（冗余，方便显示）
  status: 'active' | 'inactive';
}
```

#### 部门树（sasuke 提供）

```typescript
interface DepartmentTree {
  id: number;
  name: string;
  parentId?: number;
  children: DepartmentTree[];
  employeeCount: number;   // 部门人数（含子部门）
}
```

#### 每日考勤记录（naruto 提供）

```typescript
interface DailyRecord {
  id: number;
  employeeId: number;
  employeeNo: string;      // 冗余
  employeeName: string;    // 冗余
  deptId: number;          // 冗余
  deptName: string;        // 冗余
  workDate: string;        // YYYY-MM-DD
  shiftName?: string;      // 班次名称
  periodName?: string;     // 时间段名称
  checkInTime?: string;    // ISO datetime
  checkOutTime?: string;   // ISO datetime
  status: AttendanceStatus;
  actualMinutes: number;   // 实际出勤分钟
  effectiveMinutes: number;// 有效出勤分钟
  lateMinutes: number;     // 迟到分钟
  earlyLeaveMinutes: number;// 早退分钟
  absentMinutes: number;   // 缺勤分钟
  remark?: string;
}
```

---

## 六、数据流向

### 6.1 写入流向

```mermaid
flowchart LR
    subgraph 输入
        I1[Web 管理端]
        I2[App 打卡]
    end
    
    subgraph 处理
        P1[API Server]
        P2[考勤计算引擎]
    end
    
    subgraph 存储
        D1[(原始打卡表)]
        D2[(每日记录表)]
        D3[(补签记录表)]
        D4[(请假记录表)]
    end
    
    I1 -->|人员/部门/排班| P1
    I1 -->|补签/请假| P1
    I2 -->|打卡| P1
    
    P1 --> D1
    P1 --> D3
    P1 --> D4
    
    D1 --> P2
    D3 --> P2
    D4 --> P2
    P2 --> D2
```

### 6.2 读取流向

```mermaid
flowchart RL
    subgraph 存储
        D1[(人员表)]
        D2[(部门表)]
        D3[(每日记录表)]
        D4[(原始打卡表)]
    end
    
    subgraph 处理
        P1[API Server]
        P2[统计聚合]
    end
    
    subgraph 输出
        O1[Web 列表页]
        O2[Web 报表页]
        O3[App 个人考勤]
        O4[Excel 导出]
    end
    
    D1 --> P1
    D2 --> P1
    D3 --> P1
    D4 --> P1
    
    D3 --> P2
    
    P1 --> O1
    P1 --> O3
    P2 --> O2
    P1 --> O4
```

---

## 七、关键业务规则

### 7.1 考勤日切换

| 规则 | 说明 |
|------|------|
| 默认切换点 | 凌晨 05:00 |
| 切换逻辑 | 05:00 前的打卡归属前一天，05:00 后归属当天 |
| 配置位置 | att_settings 表，key = day_switch_time |

### 7.2 迟到/早退判定

| 场景 | 判定规则 |
|------|----------|
| 迟到 | 签到时间 > 上班时间 + 宽限期 |
| 早退 | 签退时间 < 下班时间 - 宽限期 |
| 缺勤 | 无签到且无签退且无请假 |
| 宽限期 | 可在时间段规则中配置 |

### 7.3 弹性工时计算

| 计算方式 | 说明 |
|----------|------|
| 首尾打卡 | 有效工时 = 最后打卡 - 最早打卡 - 休息时间 |
| 两两累积 | 有效工时 = Σ(偶数次打卡 - 奇数次打卡) |
| 有效间隔 | 两次打卡间隔 < 配置值则忽略 |

### 7.4 请假与考勤

| 规则 | 说明 |
|------|------|
| 审批生效 | 只有 approved 状态的请假才影响考勤计算 |
| 全天请假 | 当日考勤状态 = leave，不计缺勤 |
| 部分请假 | 请假时段不计入缺勤，其余时段正常计算 |
| 请假时长 | 按实际请假时间计入请假时长统计 |
| 审批后重算 | 审批通过后自动触发相关日期的考勤重算 |

### 7.5 多班次支持

| 规则 | 说明 |
|------|------|
| 一天多时间段 | 一个班次可配置多个时间段（最多8个） |
| 分段计算 | 每个时间段独立计算签到签退 |
| 汇总统计 | 每日记录汇总所有时间段的出勤情况 |
| 示例 | 早班 08:00-12:00 + 午班 14:00-18:00 |

---

## 八、非功能需求

### 8.1 性能要求

| 场景 | 要求 |
|------|------|
| 打卡响应 | < 500ms |
| 列表查询 | < 1s（1000条以内） |
| 报表生成 | < 5s（月报表） |
| 并发打卡 | 支持 100 人同时打卡 |

### 8.2 数据保留

| 数据类型 | 保留期限 |
|----------|----------|
| 原始打卡记录 | 2 年 |
| 每日考勤记录 | 2 年 |
| 统计报表 | 永久 |

### 8.3 安全要求

| 要求 | 说明 |
|------|------|
| 认证 | JWT Token，有效期 24 小时 |
| 权限 | 管理员可操作所有，普通用户只能查看自己 |
| 数据隔离 | 按部门隔离数据访问 |

---

## 九、已确认决策

| # | 问题 | 决策 | 影响 |
|---|------|------|------|
| 1 | 是否需要审批流程？ | ✅ 是 | SW67 需增加审批状态流转 |
| 2 | 是否支持多班次？ | ✅ 是 | 一天可配置多个时间段 |
| 3 | App 是否需要定位打卡？ | ❌ 否 | 简化 App 打卡逻辑 |
| 4 | 是否需要人脸识别打卡？ | ❌ 否 | 简化打卡方式 |
| 5 | 报表是否需要导出 PDF？ | ❌ 否 | 仅支持 Excel 导出 |
