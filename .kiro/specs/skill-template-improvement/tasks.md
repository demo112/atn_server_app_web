# Implementation Plan: Skill Template Improvement

## Overview

改进 Trae 的三个核心 Skill 文档模板，使其输出能够直接转化为可执行的测试用例。按照「requirement-analysis → technical-design → task-planning」的顺序依次改进，确保上下游一致性。

## Tasks

- [x] 1. 改进 requirement-analysis Skill
  - [x] 1.1 更新 AC 模板为 GWT 格式
    - 将现有 AC 模板改为 Given-When-Then 三段式格式
    - 添加 GWT 各部分的说明和填写指南
    - _Requirements: 1.1, 1.2_
  
  - [x] 1.2 添加反例部分
    - 在模板中添加「禁止写法」反例部分
    - 提供低质量 AC 和高质量 AC 的对比示例
    - _Requirements: 3.1, 1.4_
  
  - [x] 1.3 添加质量检查清单
    - 添加 AC 质量检查清单（至少 5 项）
    - 包含 GWT 完整性检查、禁止词汇检查等
    - _Requirements: 3.3, 3.4_
  
  - [x] 1.4 更新示例为高质量版本
    - 将「员工打卡」示例的 AC 改为 GWT 格式
    - 确保示例能通过质量检查清单
    - _Requirements: 4.1, 4.4_

- [x] 2. Checkpoint - 验证 requirement-analysis 改进
  - 验证命令: `grep -E "Given.*When.*Then" .trae/skills/requirement-analysis/SKILL.md`
  - 验证命令: `grep -E "禁止写法|反例" .trae/skills/requirement-analysis/SKILL.md`
  - 验证命令: `grep -c "- \[ \]" .trae/skills/requirement-analysis/SKILL.md` (应 ≥ 5)
  - Ensure all checks pass, ask the user if questions arise.

- [x] 3. 改进 technical-design Skill
  - [x] 3.1 添加质量检查清单
    - 添加设计文档质量检查清单
    - 包含文件清单完整性检查、与任务划分一致性检查
    - _Requirements: 3.3, 3.4_
  
  - [x] 3.2 添加与 task-planning 一致性说明
    - 明确文件变更清单与任务划分的对应关系
    - 添加一致性检查指南
    - _Requirements: 5.2_

- [x] 4. Checkpoint - 验证 technical-design 改进
  - 验证命令: `grep -E "质量检查|Quality.*Check" .trae/skills/technical-design/SKILL.md`
  - Ensure all checks pass, ask the user if questions arise.

- [x] 5. 改进 task-planning Skill
  - [x] 5.1 更新验证方式为可执行命令格式
    - 将验证方式模板改为「命令 + 预期输出」格式
    - 提供不同任务类型的验证命令模板（编译/类型/测试/API）
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 5.2 添加反例部分
    - 在模板中添加「禁止写法」反例部分
    - 提供模糊验证方式和可执行命令的对比示例
    - _Requirements: 3.1, 2.3_
  
  - [x] 5.3 添加质量检查清单
    - 添加任务验证方式质量检查清单（至少 5 项）
    - 包含可执行性检查、预期输出检查等
    - _Requirements: 3.3, 3.4_
  
  - [x] 5.4 更新示例为高质量版本
    - 将「员工打卡」示例的验证方式改为可执行命令
    - 移除「手动测试」「页面正常」等模糊描述
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 6. Checkpoint - 验证 task-planning 改进
  - 验证命令: `grep -E "禁止写法|反例" .trae/skills/task-planning/SKILL.md`
  - 验证命令: `grep -vE "手动测试|页面正常|正常显示" .trae/skills/task-planning/SKILL.md` (应无匹配)
  - 验证命令: `grep -c "- \[ \]" .trae/skills/task-planning/SKILL.md` (应 ≥ 5)
  - Ensure all checks pass, ask the user if questions arise.

- [x] 7. 一致性验证
  - [x] 7.1 验证三个 Skill 的质量标准一致性
    - 检查 AC 格式与验证方式格式的对应关系
    - 检查文件清单与任务划分的一致性
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Final Checkpoint
  - 运行所有验证命令，确保改进完成
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- 本任务主要是文档模板改进，不涉及代码实现
- 按照 Skill 依赖顺序（requirement-analysis → technical-design → task-planning）依次改进
- 每个 Skill 改进后需要验证，确保符合质量标准
