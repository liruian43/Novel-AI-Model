<p align="center">
  <img src="assets/logo.svg" width="120" height="120" alt="InkOS Logo">
  <img src="assets/inkos-text.svg" width="240" height="65" alt="InkOS">
</p>

<h1 align="center">自动化小说写作 CLI Agent</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@actalk/inkos"><img src="https://img.shields.io/npm/v/@actalk/inkos.svg?color=cb3837&logo=npm" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

<p align="center">
  中文 | <a href="README.en.md">English</a>
</p>

---

> [!IMPORTANT]
> ## 🔥 私有升级版本说明 (v0.4-HTML)
> 
> **本仓库在原项目基础上进行了以下私有化升级：**
> 
> ### ✨ 新增功能
> 
> #### 1. 🌐 HTML 图形界面应用程序
> - **双击即用**：无需安装 Node.js 和任何依赖，双击 `InkOS-Studio.html` 即可使用
> - **完整功能**：保留原 CLI 所有核心功能（书籍管理、智能写作、章节审阅、AIGC 检测等）
> - **本地存储**：使用浏览器 LocalStorage 保存数据，支持导入导出
> - **跨平台**：Windows 10/11、macOS、Linux + 主流浏览器（Chrome/Edge/Firefox）
> - **操作指引**：内置详细的使用帮助和 FAQ
> 
> #### 2. 🤖 扩展 LLM 支持
> - **阿里云通义千问**：原生支持 Qwen 系列模型（qwen-plus/qwen-max/qwen-turbo）
>   - 国内可直接访问，无需代理
>   - 支持支付宝/微信支付
>   - 中文创作能力强，性价比高
> - **自定义大模型**：支持任意 OpenAI 兼容接口
>   - 本地部署：Ollama、vLLM、LocalAI 等
>   - 第三方服务：DeepSeek、Moonshot、智谱 AI 等
> - **配置向导**：交互式命令行工具 (`inkos wizard`)，图形化选择提供商
> 
> #### 3. 📚 真相文件可视化
> - 7 个真相文件全部支持在线查看和管理
> - 支持单个文件导出为 MD 格式
> - 一键导出全部真相文件和章节内容为 ZIP
> 
> ### 📁 新增文件
> ```
> inkos/
> ├── InkOS-Studio.html          # ⭐ HTML 应用程序（双击运行）
> ├── LLM 配置指南.md              # ⭐ 详细的 LLM 配置说明
> ├── 更新说明.md                  # ⭐ 私有升级详细说明
> └── packages/
>     └── cli/src/commands/
>         └── config-wizard.ts   # ⭐ 交互式配置向导
> ```
> 
> ### 🚀 快速开始（HTML 版）
> ```bash
> # 方式一：图形界面（推荐）
> 双击打开 InkOS-Studio.html
> 
> # 方式二：CLI 配置向导
> inkos wizard
> 
> # 方式三：手动配置.env
> INKOS_LLM_PROVIDER=aliyun              # 通义千问
> INKOS_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
> INKOS_LLM_API_KEY=sk-your-key
> INKOS_LLM_MODEL=qwen-plus
> ```
> 
> ### 📊 与原项目的对比
> 
> | 特性 | 原 CLI 项目 | 私有升级版 |
> |------|-----------|-----------|
> | **使用门槛** | 需安装 Node.js | 双击即用 |
> | **LLM 支持** | OpenAI/Anthropic | + 通义千问 + 自定义 |
> | **界面** | 命令行 | 图形界面 + CLI |
> | **真相文件** | 磁盘 MD 文件 | 可视化查看 + 可导出 |
> | **配置方式** | 编辑.env | 图形界面/向导/CLI |
> | **数据存储** | 文件系统 | LocalStorage + 可导出 |
> 
> > **注意**：私有升级版完全兼容原项目功能，所有 CLI 命令仍然可用。
> 
> ---

Agent 写小说。写、审、改，全程接管。

## v0.4 更新

番外写作 + 文风仿写 + 写后验证器 + 审计闭环加固。

### 番外写作（Spinoff）

基于已有书创建前传、后传、外传或 if 线。番外和正传共享世界观和角色，但有独立剧情线。

```bash
inkos import canon 烈焰前传 --from 吞天魔帝   # 导入正传正典到番外
inkos write next 烈焰前传                     # 写手自动读取正典约束
```

导入后生成 `story/parent_canon.md`，包含正传的世界规则、角色快照（含信息边界）、关键事件时间线、伏笔状态。写手在动笔前参照正典，审计员自动激活 4 个番外专属维度：

| 维度 | 审查内容 |
|------|----------|
| 正传事件冲突 | 番外事件是否与正典约束表矛盾 |
| 未来信息泄露 | 角色是否引用了分歧点之后才揭示的信息 |
| 世界规则跨书一致性 | 番外是否违反正传世界规则（力量体系、地理、阵营） |
| 番外伏笔隔离 | 番外是否越权回收正传伏笔 |

检测到 `parent_canon.md` 自动激活，无需额外配置。

### 文风仿写

喂入真人小说片段，系统提取统计指纹 + 生成风格指南，后续每章自动注入写手 prompt。

```bash
inkos style analyze 参考小说.txt                     # 分析：句长、TTR、修辞特征
inkos style import 参考小说.txt 吞天魔帝 --name 某作者  # 导入文风到书
```

产出两个文件：
- `style_profile.json` — 统计指纹（句长分布、段落长度、词汇多样性、修辞密度）
- `style_guide.md` — LLM 生成的定性风格指南（节奏、语气、用词偏好、禁忌）

写手每章读取风格指南，审计员在文风维度对照检查。

### 写后验证器

11 条确定性规则，零 LLM 成本，每章写完立刻触发：

| 规则 | 说明 |
|------|------|
| 禁止句式 | 「不是……而是……」 |
| 禁止破折号 | 「——」 |
| 转折词密度 | 仿佛/忽然/竟然等，每 3000 字 ≤ 1 次 |
| 高疲劳词 | 题材疲劳词单章每词 ≤ 1 次 |
| 元叙事 | 编剧旁白式表述 |
| 报告术语 | 分析框架术语不入正文 |
| 作者说教 | 显然/不言而喻等 |
| 集体反应 | 「全场震惊」类套话 |
| 连续了字 | ≥ 4 句连续含「了」 |
| 段落过长 | ≥ 2 个段落超 300 字 |
| 本书禁忌 | book_rules.md 中的禁令 |

验证器发现 error 级违规时，自动触发 `spot-fix` 模式定点修复，不等 LLM 审计。

### 审计-修订闭环加固

实测发现 `rewrite` 模式引入 6 倍 AI 标记词，现在：

- 自动修订模式从 `rewrite` 改为 `spot-fix`（只改问题句，不碰其余正文）
- 修订后对比 AI 标记数，如果修订反而增多 AI 痕迹，丢弃修订保留原文
- 再审温度锁 0（消除审计随机性，同一章不再出现 0-6 个 critical 的波动）
- `polish` 模式加固边界（禁止增删段落、改人名、加新情节）

### 其他 v0.4 变更

- 审计维度从 26 扩展到 32（+4 番外维度 + dim 27 敏感词 + dim 32 读者期待管理）
- 审计员联网搜索：年代考据题材可联网核实真实事件/人物/地理（原生搜索能力）
- 调度器重写：AI 节奏（默认 15 分钟一轮）、并行书处理、立即重试、每日上限
- 修订者新增 `spot-fix` 模式（定点修复）
- `book_rules.md` 的 `additionalAuditDimensions` 支持中文名称匹配
- 全部 5 个题材激活 dim 24-26（支线停滞/弧线平坦/节奏单调）

---

## v0.3 更新

创作规则三层分离 + 跨章记忆 + AIGC 检测 + Webhook。

### 跨章记忆与写作质量

Writer 每章自动生成摘要、更新支线/情感/角色矩阵，全部追加到真相文件。后续章节加载全量上下文，长线伏笔不再丢失。

| 真相文件 | 用途 |
|----------|------|
| `chapter_summaries.md` | 各章摘要：出场人物、关键事件、状态变化、伏笔动态 |
| `subplot_board.md` | 支线进度板：A/B/C 线状态追踪 |
| `emotional_arcs.md` | 情感弧线：按角色追踪情绪、触发事件、弧线方向 |
| `character_matrix.md` | 角色交互矩阵：相遇记录、信息边界 |

### AIGC 检测

| 功能 | 说明 |
|------|------|
| AI 痕迹审计 | 纯规则检测（不走 LLM）：段落等长、套话密度、公式化转折、列表式结构，自动合并到审计结果 |
| AIGC 检测 API | 外部 API 集成（GPTZero / Originality / 自定义端点），`inkos detect` 命令 |
| 文风指纹学习 | 从参考文本提取 StyleProfile（句长、TTR、修辞特征），注入 Writer prompt |
| 反检测改写 | ReviserAgent `anti-detect` 模式，检测→改写→重检测循环 |
| 检测反馈闭环 | `detection_history.json` 记录每次检测/改写结果，`inkos detect --stats` 查看统计 |

```bash
inkos style analyze reference.txt         # 分析参考文本文风
inkos style import reference.txt 吞天魔帝  # 导入文风到书
inkos detect 吞天魔帝 --all               # 全书 AIGC 检测
inkos detect --stats                      # 检测统计
```

### Webhook + 智能调度

管线事件 POST JSON 到配置 URL（HMAC-SHA256 签名），支持事件过滤（`chapter-complete`、`audit-failed`、`pipeline-error` 等）。守护进程增加质量门控：审计失败自动重试（调高 temperature）、连续失败暂停书籍。

### 题材自定义

内置 5 个题材，每个题材带一套完整的创作规则：章节类型、禁忌清单、疲劳词、语言铁律、审计维度。

| 题材 | 自带规则 |
|------|----------|
| 玄幻 | 数值系统、战力体系、同质吞噬衰减公式、打脸/升级/收益兑现节奏 |
| 仙侠 | 修炼/悟道节奏、法宝体系、天道规则 |
| 都市 | 年代考据、商战/社交驱动、法律术语年代匹配、无数值系统 |
| 恐怖 | 氛围递进、恐惧层级、克制叙事、无战力审计 |
| 通用 | 最小化兜底 |

创建书时指定题材，对应规则自动生效：

```bash
inkos book create --title "吞天魔帝" --genre xuanhuan
```

题材规则可以查看、复制到项目中修改、或从零创建：

```bash
inkos genre list                      # 查看所有题材
inkos genre show xuanhuan             # 查看玄幻的完整规则
inkos genre copy xuanhuan             # 复制到项目中，随意改
inkos genre create wuxia --name 武侠   # 从零创建新题材
```

复制到项目后，增删禁忌、调整疲劳词、修改节奏规则、自定义语言铁律——改完下次写章自动生效。

每个题材有专属语言铁律（带 ✗→✓ 示例），写手和审计员同时执行：

- **玄幻**：✗ "火元从12缕增加到24缕" → ✓ "手臂比先前有力了，握拳时指骨发紧"
- **都市**：✗ "迅速分析了当前的债务状况" → ✓ "把那叠皱巴巴的白条翻了三遍"
- **恐怖**：✗ "感到一阵恐惧" → ✓ "后颈的汗毛一根根立起来"

### 单本书规则

每本书有独立的 `book_rules.md`，建筑师 agent 创建书时自动生成，也可以随时手改。写在这里的规则注入每一章的 prompt：

```yaml
protagonist:
  name: 林烬
  personalityLock: ["强势冷静", "能忍能杀", "有脑子不是疯狗"]
  behavioralConstraints: ["不圣母不留手", "对盟友有温度但不煽情"]
numericalSystemOverrides:
  hardCap: 840000000
  resourceTypes: ["微粒", "血脉浓度", "灵石"]
prohibitions:
  - 主角关键时刻心软
  - 无意义后宫暧昧拖剧情
  - 配角戏份喧宾夺主
fatigueWordsOverride: ["瞳孔骤缩", "不可置信"]   # 覆盖题材默认
```

主角人设锁定、数值上限、自定义禁令、疲劳词覆盖——每本书的规则独立调整，不影响题材模板。

### 32 维度审计

审计细化为 32 个维度，按题材自动启用对应的子集：

OOC检查、时间线、设定冲突、战力崩坏、数值检查、伏笔、节奏、文风、信息越界、词汇疲劳、利益链断裂、年代考据、配角降智、配角工具人化、爽点虚化、台词失真、流水账、知识库污染、视角一致性、段落等长、套话密度、公式化转折、列表式结构、支线停滞、弧线平坦、节奏单调、敏感词检查、正传事件冲突、未来信息泄露、世界规则跨书一致性、番外伏笔隔离、读者期待管理

dim 20-23（AI 痕迹）+ dim 27（敏感词）由纯规则引擎检测，不消耗 LLM 调用。dim 28-31（番外维度）检测到 `parent_canon.md` 自动激活。dim 32（读者期待管理）始终开启。

### 去 AI 味

5 条通用规则 + 每个题材的专属语言规则，控制 AI 标记词密度和叙述习惯：

- AI 标记词限频：仿佛/忽然/竟然/不禁/宛如/猛地，每 3000 字 ≤ 1 次
- 叙述者不替读者下结论，只写动作
- 禁止分析报告式语言（"核心动机""信息落差"不入正文）
- 同一意象渲染不超过两轮
- 方法论术语不入正文

词汇疲劳审计 + AI 痕迹审计（dim 20-23）双重检测。文风指纹注入进一步降低 AI 文本特征。

### 其他

- 支持 OpenAI + Anthropic 原生 + 所有 OpenAI 兼容接口
- 修订者支持 polish / rewrite / rework / anti-detect / spot-fix 五种模式
- 无数值系统的题材不生成资源账本
- 所有命令支持 `--json` 结构化输出，OpenClaw / 外部 Agent 可直接解析
- book-id 自动检测：项目只有一本书时省略 book-id
- `inkos update` 一键更新、`inkos init` 支持当前目录初始化
- API 错误附带中文诊断提示，`inkos doctor` 含 API 连通性测试

---

## 为什么需要 InkOS？

用 AI 写小说不是简单的"提示词 + 复制粘贴"。长篇小说很快就会崩：角色记忆混乱、物品凭空出现、同样的形容词每段都在重复、伏笔悄无声息地断掉。InkOS 把这些当工程问题来解决。

- **长期记忆** — 追踪世界的真实状态，而非 LLM 的幻觉
- **反信息泄漏** — 确保角色只知道他们亲眼见证过的事
- **资源衰减** — 物资会消耗、物品会损坏，没有无限背包
- **词汇疲劳检测** — 在读者发现之前就捕捉过度使用的词语
- **自动修订** — 在人工审核之前修复数值错误和连续性断裂

## 工作原理

每一章由五个 Agent 接力完成：

<p align="center">
  <img src="assets/screenshot-pipeline.png" width="800" alt="管线流程图">
</p>

| Agent | 职责 |
|-------|------|
| **雷达 Radar** | 扫描平台趋势和读者偏好，指导故事方向（可插拔，可跳过） |
| **建筑师 Architect** | 规划章节结构：大纲、场景节拍、节奏控制 |
| **写手 Writer** | 根据大纲 + 当前世界状态生成正文 |
| **连续性审计员 Auditor** | 对照长期记忆验证草稿 |
| **修订者 Reviser** | 修复审计发现的问题 — 关键问题自动修复，其他标记给人工审核 |

如果审计不通过，管线自动进入"修订 → 再审计"循环，直到所有关键问题清零。

### 长期记忆

每本书维护 7 个真相文件作为唯一事实来源：

| 文件 | 用途 |
|------|------|
| `current_state.md` | 世界状态：角色位置、关系网络、已知信息、情感弧线 |
| `particle_ledger.md` | 资源账本：物品、金钱、物资数量及衰减追踪 |
| `pending_hooks.md` | 未闭合伏笔：铺垫、对读者的承诺、未解决冲突 |
| `chapter_summaries.md` | 各章摘要：出场人物、关键事件、状态变化、伏笔动态 |
| `subplot_board.md` | 支线进度板：A/B/C 线状态、停滞检测 |
| `emotional_arcs.md` | 情感弧线：按角色追踪情绪变化和成长 |
| `character_matrix.md` | 角色交互矩阵：相遇记录、信息边界 |

连续性审计员对照这些文件检查每一章草稿。如果角色"记起"了从未亲眼见过的事，或者拿出了两章前已经丢失的武器，审计员会捕捉到。旧书无新真相文件时自动兼容。

<p align="center">
  <img src="assets/screenshot-state.png" width="800" alt="长期记忆快照">
</p>

### 创作规则体系

写手 agent 内置 ~25 条通用创作规则（人物塑造、叙事技法、逻辑自洽、语言约束、去 AI 味），适用于所有题材。

在此基础上，每个题材有专属规则（禁忌、语言铁律、节奏、审计维度），每本书有独立的 `book_rules.md`（主角人设、数值上限、自定义禁令）和 `story_bible.md`（世界观设定），由建筑师 agent 创建书籍时自动生成。

详见 [v0.3 更新](#v03-更新-2026-03-13)。

## 三种使用模式

InkOS 提供三种交互方式，底层共享同一组原子操作：

### 1. 完整管线（一键式）

```bash
inkos write next 吞天魔帝          # 写草稿 → 审计 → 自动修订，一步到位
inkos write next 吞天魔帝 --count 5 # 连续写 5 章
```

### 2. 原子命令（可组合，适合外部 Agent 调用）

```bash
inkos draft 吞天魔帝 --context "本章重点写师徒矛盾" --json
inkos audit 吞天魔帝 31 --json
inkos revise 吞天魔帝 31 --json
```

每个命令独立执行单一操作，`--json` 输出结构化数据。可被 OpenClaw 等 AI Agent 通过 `exec` 调用，也可用于脚本编排。

### 3. 自然语言 Agent 模式

```bash
inkos agent "帮我写一本都市修仙，主角是个程序员"
inkos agent "写下一章，重点写师徒矛盾"
inkos agent "先扫描市场趋势，然后根据结果创建一本新书"
```

内置 12 个工具（write_draft、audit_chapter、revise_chapter、scan_market、create_book、get_book_status、read_truth_files、list_books、write_full_pipeline、web_fetch、import_style、import_canon），LLM 通过 tool-use 决定调用顺序。

## 快速开始

### 安装

```bash
npm i -g @actalk/inkos
```

### 配置

**方式一：全局配置（推荐，只需一次）**

```bash
inkos config set-global \
  --provider openai \
  --base-url https://api.openai.com/v1 \
  --api-key sk-xxx \
  --model gpt-4o
```

配置保存在 `~/.inkos/.env`，所有项目共享。之后新建项目不用再配。

**方式二：项目级 `.env`**

```bash
inkos init my-novel     # 初始化项目
# 编辑 my-novel/.env
```

```bash
# 必填
INKOS_LLM_PROVIDER=openai                        # openai / anthropic / aliyun / custom
                                                   # - openai: OpenAI GPT 系列
                                                   # - anthropic: Anthropic Claude 系列
                                                   # - aliyun: 阿里云通义千问 (Qwen) ⭐新增
                                                   # - custom: 自定义大模型 (OpenAI 兼容) ⭐新增
INKOS_LLM_BASE_URL=https://api.openai.com/v1     # API 地址（支持中转站）
                                                   # 通义千问：https://dashscope.aliyuncs.com/compatible-mode/v1
INKOS_LLM_API_KEY=sk-xxx                          # API Key
INKOS_LLM_MODEL=gpt-4o                            # 模型名
                                                   # 通义千问：qwen-plus / qwen-max / qwen-turbo

# 可选
# INKOS_LLM_TEMPERATURE=0.7                       # 温度
# INKOS_LLM_MAX_TOKENS=8192                        # 最大输出 token
# INKOS_LLM_THINKING_BUDGET=0                      # Anthropic 扩展思考预算
```

**常用模型推荐**:

| 提供商 | 模型 | 特点 | 适用场景 |
|--------|------|------|----------|
| **OpenAI** | gpt-4o | 综合能力最强 | 高质量长篇创作 |
| | gpt-4-turbo | 性价比高 | 日常连载 |
| | gpt-3.5-turbo | 经济实惠 | 快速生成草稿 |
| **Anthropic** | claude-3-5-sonnet-20241022 | 文本自然度高 | 文学创作 |
| | claude-3-opus-20240229 | 上下文理解强 | 复杂剧情 |
| **阿里云** ⭐ | qwen-plus | 中文能力强，性价比高 | 日常写作推荐 |
| | qwen-max | 最强性能 | 复杂场景 |
| | qwen-turbo | 速度快，成本低 | 快速生成 |
| **自定义** | 任意 OpenAI 兼容模型 | 灵活定制 | 本地部署/第三方服务 |

项目 `.env` 会覆盖全局配置。不需要覆盖时可以不写。

### 使用

```bash
inkos book create --title "吞天魔帝" --genre xuanhuan  # 创建新书
inkos write next 吞天魔帝      # 写下一章（完整管线）
inkos status                   # 查看状态
inkos review list 吞天魔帝     # 审阅草稿
inkos export 吞天魔帝          # 导出全书
inkos up                       # 守护进程模式
```

<p align="center">
  <img src="assets/screenshot-terminal.png" width="700" alt="终端截图">
</p>

## 命令参考

| 命令 | 说明 |
|------|------|
| `inkos init [name]` | 初始化项目（省略 name 在当前目录初始化） |
| `inkos book create` | 创建新书（`--chapter-words` 设定字数） |
| `inkos book update [id]` | 修改书设置（`--chapter-words`、`--target-chapters`、`--status`） |
| `inkos book list` | 列出所有书籍 |
| `inkos genre list/show/copy/create` | 查看、复制、创建题材 |
| `inkos write next [id]` | 完整管线写下一章（`--words` 覆盖字数，`--count` 连写） |
| `inkos write rewrite [id] <n>` | 重写第 N 章（恢复状态快照，需确认） |
| `inkos draft [id]` | 只写草稿（`--words` 覆盖字数） |
| `inkos audit [id] [n]` | 审计指定章节 |
| `inkos revise [id] [n]` | 修订指定章节 |
| `inkos agent <instruction>` | 自然语言 Agent 模式 |
| `inkos review list [id]` | 审阅草稿 |
| `inkos review approve-all [id]` | 批量通过 |
| `inkos status [id]` | 项目状态 |
| `inkos export [id]` | 导出书籍为 txt/md |
| `inkos radar scan` | 扫描平台趋势 |
| `inkos config set-global` | 设置全局 LLM 配置（~/.inkos/.env） |
| `inkos config show-global` | 查看全局配置 |
| `inkos config set/show` | 查看/更新项目配置 |
| `inkos doctor` | 诊断配置问题（含 API 连通性测试） |
| `inkos detect [id] [n]` | AIGC 检测（`--all` 全部章节，`--stats` 统计） |
| `inkos style analyze <file>` | 分析参考文本提取文风指纹 |
| `inkos style import <file> [id]` | 导入文风指纹到指定书 |
| `inkos import canon [id] --from <parent>` | 导入正传正典到番外书 |
| `inkos update` | 更新到最新版本 |
| `inkos up / down` | 启动/停止守护进程 |

`[id]` 参数在项目只有一本书时可省略，自动检测。所有命令支持 `--json` 输出结构化数据。`draft`/`write next`/`book create` 支持 `--context` 传入创作指导，`--words` 覆盖每章字数（OpenClaw 可逐章动态控制）。

## LLM 提供商配置 ⭐

InkOS 支持多种大语言模型提供商：

### OpenAI (GPT 系列)
```bash
INKOS_LLM_PROVIDER=openai
INKOS_LLM_BASE_URL=https://api.openai.com/v1
INKOS_LLM_MODEL=gpt-4o
```

### Anthropic (Claude 系列)
```bash
INKOS_LLM_PROVIDER=anthropic
INKOS_LLM_BASE_URL=https://api.anthropic.com
INKOS_LLM_MODEL=claude-3-5-sonnet-20241022
```

### 阿里云通义千问 (Qwen) ⭐ 新增
```bash
INKOS_LLM_PROVIDER=aliyun
INKOS_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
INKOS_LLM_MODEL=qwen-plus        # 或 qwen-max, qwen-turbo
```

**开通步骤**:
1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 进入"API-KEY 管理"创建新的 API Key
4. 确保开通 Qwen 模型服务
5. 复制 API Key 到配置文件

**推荐模型**:
- `qwen-plus`: 性价比高，推荐用于日常写作
- `qwen-max`: 最强性能，适合复杂场景
- `qwen-turbo`: 速度快，成本低

### 自定义大模型 (Custom) ⭐ 新增
```bash
INKOS_LLM_PROVIDER=custom
INKOS_LLM_BASE_URL=<你的自定义 API 地址>
INKOS_LLM_MODEL=<你的模型名称>
```

**适用场景**:
- 本地部署的开源模型 (Ollama, vLLM, LocalAI 等)
- 其他第三方 OpenAI 兼容服务 (DeepSeek, Moonshot, 智谱 AI 等)
- 企业私有化部署模型

**常见兼容服务示例**:
- **Ollama**: `http://localhost:11434/v1`
- **DeepSeek**: `https://api.deepseek.com/v1`
- **Moonshot**: `https://api.moonshot.cn/v1`
- **智谱 AI**: `https://open.bigmodel.cn/api/paas/v4`

详细配置说明请查看 [LLM 配置指南](LLM 配置指南.md)。

## 实测数据

用 InkOS 全自动跑了一本玄幻题材的《吞天魔帝》：

<p align="center">
  <img src="assets/screenshot-chapters.png" width="800" alt="生产数据">
</p>

| 指标 | 数据 |
|------|------|
| 已完成章节 | 31 章 |
| 总字数 | 452,191 字 |
| 平均章字数 | ~14,500 字 |
| 审计通过率 | 100% |
| 资源追踪项 | 48 个 |
| 活跃伏笔 | 20 条 |
| 已回收伏笔 | 10 条 |

## 核心特性

### 状态快照 + 章节重写

每章自动创建状态快照。使用 `inkos write rewrite <id> <n>` 可以回滚并重新生成任意章节 — 世界状态、资源账本、伏笔钩子全部恢复到该章写入前的状态。

### 写入锁

基于文件的锁机制防止对同一本书的并发写入。

### 写前自检 + 写后结算

写手 agent 在动笔前必须输出自检表（上下文范围、当前资源、待回收伏笔、冲突概述、风险扫描），写完后输出结算表（资源变动、伏笔变动）。审计员对照结算表和正文内容做交叉验证。

### 可插拔雷达

雷达数据源通过 `RadarSource` 接口实现可插拔。内置番茄小说和起点中文网两个数据源，也可以传入自定义数据源或直接跳过雷达。用户自己提供题材时，agent 模式会自动跳过市场扫描。

### 守护进程模式

`inkos up` 启动后台循环，按计划写章。管线对非关键问题全自动运行，当审计员标记无法自动修复的问题时暂停等待人工审核。

### 通知推送

支持 Telegram、飞书、企业微信、Webhook。守护进程模式下，写完一章或审计不通过都会推通知到手机。Webhook 支持 HMAC-SHA256 签名和事件过滤。

### 外部 Agent 集成

原子命令 + `--json` 输出让 InkOS 可以被 OpenClaw 等 AI Agent 调用。OpenClaw 通过 `exec` 工具执行 `inkos draft`/`audit`/`revise`，读取 JSON 结果决定下一步操作。

## 项目结构

```
inkos/
├── packages/
│   ├── core/              # Agent 运行时、管线、状态管理
│   │   ├── agents/        # architect, writer, continuity, reviser, radar, ai-tells, post-write-validator, sensitive-words, detector, style-analyzer
│   │   ├── pipeline/      # runner, agent (tool-use), scheduler, detection-runner
│   │   ├── state/         # 基于文件的状态管理器（7+ 真相文件 + 快照）
│   │   ├── llm/           # OpenAI + Anthropic 双 SDK 接口 (流式)
│   │   ├── notify/        # Telegram, 飞书, 企业微信, Webhook
│   │   └── models/        # Zod schema 校验
│   └── cli/               # Commander.js 命令行 (20 条命令)
│       └── commands/      # init, book, write, draft, audit, revise, agent, review, detect, style...
└── (规划中) studio/        # 网页审阅编辑界面
```

TypeScript 单仓库，pnpm workspaces 管理。

## 路线图

- [x] 完整管线（雷达 → 建筑师 → 写手 → 审计 → 修订）
- [x] 长期记忆 + 连续性审计
- [x] 内置创作规则体系
- [x] CLI 全套命令（20 条）
- [x] 状态快照 + 章节重写
- [x] 守护进程模式
- [x] 通知推送（Telegram / 飞书 / 企微）
- [x] 原子命令 + JSON 输出（draft / audit / revise）
- [x] 自然语言 Agent 模式（tool-use 编排）
- [x] 可插拔雷达（RadarSource 接口）
- [x] 外部 Agent 集成（OpenClaw 等）
- [x] 题材自定义 + 单本书规则（genre CLI + book_rules.md）
- [x] 32 维度连续性审计（含 AI 痕迹检测 + 番外维度）
- [x] 去 AI 味铁律 + 文风指纹注入
- [x] 多 LLM provider（OpenAI + Anthropic + 兼容接口）
- [x] AIGC 检测 + 反检测改写管线
- [x] Webhook 通知 + 智能调度（质量门控）
- [x] 跨章节连贯性（章节摘要 + 支线/情感/角色矩阵）
- [x] 番外写作（正典导入 + 4 维度审计 + 信息边界管控）
- [x] 文风仿写（统计指纹 + LLM 风格指南 + 写手注入）
- [x] 写后验证器（11 条硬规则 + 自动 spot-fix）
- [x] 审计-修订闭环加固（AI 标记守卫 + 温度锁）
- [ ] `packages/studio` Web UI 审阅编辑界面
- [ ] 多模型路由（不同 agent 用不同模型）
- [ ] 自定义 agent 插件系统
- [ ] 平台格式导出（起点、番茄等）

## 参与贡献

欢迎贡献代码。提 issue 或 PR。

```bash
pnpm install
pnpm dev          # 监听模式
pnpm test         # 运行测试
pnpm typecheck    # 类型检查
```

---

## 🔧 私有升级详细说明

> 本章节详细介绍 v0.4-HTML 私有升级版本的技术实现和使用细节。

### 目录

- [HTML 应用程序架构](#html-应用程序架构)
- [真相文件处理机制](#真相文件处理机制)
- [LLM 扩展实现](#llm 扩展实现)
- [数据持久化方案](#数据持久化方案)
- [常见问题](#常见问题)

---

### HTML 应用程序架构

#### 技术栈
- **纯静态 HTML**：单文件包含所有 CSS/JS，无需构建工具
- **LocalStorage 存储**：浏览器本地持久化，最大 5-10MB
- **原生 JavaScript**：无第三方依赖（除可选的 JSZip 用于导出）

#### 核心模块

```
InkOS-Studio.html
├── 状态管理 (APP_STATE)
│   ├── books: []              # 书籍列表
│   ├── chapters: []           # 章节缓存
│   ├── truthFiles: {}         # 真相文件集合
│   └── config: {}             # LLM 配置
├── 页面系统
│   ├── dashboard              # 工作台
│   ├── books                  # 书籍管理
│   ├── write                  # 智能写作
│   ├── review                 # 章节审阅
│   ├── detect                 # AIGC 检测
│   ├── style                  # 文风仿写
│   ├── truth-files            # 真相文件
│   ├── config                 # 配置管理
│   └── help                   # 使用帮助
└── 工具函数
    ├── localStorage 读写
    ├── 文件导入导出
    └── API 调用封装
```

#### 与原 CLI 的映射关系

| CLI 命令 | HTML 功能 | 说明 |
|---------|----------|------|
| `inkos book create` | 书籍管理 → 创建新书 | 相同逻辑，图形界面 |
| `inkos book list` | 书籍管理 → 书籍列表 | 卡片式展示 |
| `inkos write next` | 智能写作 → 开始写作 | 管线步骤可视化 |
| `inkos draft` | 智能写作 → 草稿生成 | 相同 |
| `inkos audit` | 章节审阅 → 审计报告 | 32 维度展示 |
| `inkos revise` | 章节审阅 → 修订本章 | spot-fix 模式 |
| `inkos detect` | AIGC 检测 | 书籍检测 + 文本检测 |
| `inkos style analyze` | 文风仿写 → 分析 | 统计指纹提取 |
| `inkos style import` | 文风仿写 → 导入 | 应用到书籍 |
| `inkos config` | 配置管理 | 图形化配置 |
| `inkos export` | 书籍管理 → 导出 | MD/TXT格式 |

---

### 真相文件处理机制

#### 原 CLI 项目 vs HTML 应用

```
【CLI 项目 - 真实文件系统】
books/
└── 吞天魔帝/
    └── state/
        ├── current_state.md       ← 真实 MD 文件
        ├── particle_ledger.md     ← 真实 MD 文件
        └── ...                    ← 7 个文件

【HTML 应用 - LocalStorage】
localStorage {
  "inkos_studio_state": "{
    \"truthFiles\": {
      \"book_xxx\": {
        \"current_state.md\": \"# 内容...\",
        \"particle_ledger.md\": \"# 内容...\",
        ...
      }
    }
  }"
}
```

#### 真相文件同步策略

**当前实现**（只读模式）：
- ✅ HTML 应用初始化时从模板创建 7 个真相文件
- ✅ 每次写作后自动更新 `chapter_summaries.md`
- ✅ 支持在界面查看和编辑所有内容
- ⚠️ 不会自动同步到磁盘 MD 文件

**导出功能**（手动触发）：
```javascript
// 一键导出某本书的全部真相文件
function exportBookWithTruthFiles(bookId) {
  const book = APP_STATE.books.find(b => b.id === bookId);
  const truthFiles = APP_STATE.truthFiles[bookId];
  
  // 创建 ZIP 包
  const zip = new JSZip();
  zip.folder(`${book.title}/state`);
  
  // 添加 7 个真相文件
  Object.entries(truthFiles).forEach(([name, content]) => {
    zip.file(`state/${name}`, content);
  });
  
  // 添加章节内容
  book.chapters.forEach(ch => {
    zip.file(`story/chapter_${ch.number}.txt`, ch.content);
  });
  
  // 下载 ZIP
  downloadFile(`${book.title}_complete.zip`, blob);
}
```

#### 真相文件结构

每个真相文件的初始模板：

```markdown
# current_state.md
## 角色位置
## 关系网络
## 已知信息
## 情感弧线

# particle_ledger.md
## 物品
## 金钱
## 物资

# pending_hooks.md
## 铺垫
## 承诺
## 未解决冲突

# chapter_summaries.md
## 第 X 章
- 出场人物：
- 关键事件：
- 状态变化：
- 伏笔动态：

# subplot_board.md
## A 线
## B 线
## C 线

# emotional_arcs.md
## 角色名 - 情绪轨迹

# character_matrix.md
## 角色交互记录
```

---

### LLM 扩展实现

#### Provider 类型扩展

**原项目支持**：
```typescript
type LLMProvider = "openai" | "anthropic";
```

**升级后**：
```typescript
type LLMProvider = "openai" | "anthropic" | "aliyun" | "custom";
```

#### 通义千问配置

```typescript
// provider.ts
if (config.provider === "aliyun") {
  return {
    provider: "aliyun",
    apiFormat: "chat",
    _openai: new OpenAI({ 
      apiKey: config.apiKey, 
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" 
    }),
    defaults: { temperature: 0.7, maxTokens: 8192 }
  };
}
```

通义千问使用 OpenAI SDK 的原因：
- 阿里云百炼提供 OpenAI 兼容接口
- 无需修改现有调用逻辑
- 统一处理方式

#### 自定义模型配置

```typescript
// 任何符合以下格式的 service 都可接入
POST /v1/chat/completions
{
  "model": "your-model",
  "messages": [...],
  "temperature": 0.7
}

Response:
{
  "choices": [{
    "message": { "content": "..." }
  }]
}
```

#### 配置向导实现

```bash
$ inkos wizard

╔════════════════════════════════════════╗
║   InkOS LLM 配置向导                   ║
╚════════════════════════════════════════╝

请选择 AI 服务提供商:
  1. OpenAI (GPT-4o/GPT-3.5)
  2. Anthropic (Claude 系列)
  3. 阿里云通义千问 (Qwen) ⭐ 推荐国内用户
  4. 自定义大模型 (OpenAI 兼容)

请选择 (输入数字): 3

API Base URL [默认：https://dashscope.aliyuncs.com/compatible-mode/v1]: 
API Key: sk-xxx
选择模型:
  1. qwen-plus (推荐)
  2. qwen-max
  3. qwen-turbo

✅ 配置完成！保存到 ~/.inkos/.env
```

---

### 数据持久化方案

#### LocalStorage 限制与对策

**限制**：
- 容量：5-10MB（因浏览器而异）
- 数据类型：仅支持字符串
- 作用域：同源策略（协议 + 域名 + 端口）

**对策**：
```javascript
// 1. 序列化前压缩
function saveToStorage() {
  const jsonStr = JSON.stringify(APP_STATE);
  // 简单压缩：移除多余空格
  const compressed = jsonStr.replace(/\s+/g, ' ');
  localStorage.setItem('inkos_studio_state', compressed);
}

// 2. 定期备份提醒
function checkStorageUsage() {
  const usage = new Blob([localStorage.getItem('inkos_studio_state')]).size;
  if (usage > 4 * 1024 * 1024) { // 4MB 告警
    showToast('warning', '存储空间即将用满，建议导出数据');
  }
}

// 3. 导出功能
function exportAllData() {
  const dataStr = JSON.stringify(APP_STATE, null, 2);
  downloadFile(`inkos_backup_${Date.now()}.json`, dataStr);
}
```

#### 数据恢复流程

```javascript
// 导入备份文件
function handleImportFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      
      // 合并数据（保留现有配置）
      APP_STATE = {
        ...imported,
        config: APP_STATE.config // 保留当前 API 配置
      };
      
      saveToStorage();
      showToast('success', '数据导入成功');
    } catch (err) {
      showToast('error', '导入失败：文件格式不正确');
    }
  };
  
  reader.readAsText(file);
}
```

---

### 常见问题

#### Q1: HTML 版和 CLI 版能同时使用吗？

**答**：可以，但数据不互通。
- CLI 版：数据存储在 `books/` 目录
- HTML 版：数据存储在浏览器 LocalStorage

如需迁移：
```bash
# CLI → HTML：导出为 ZIP，在 HTML 中导入
# HTML → CLI：目前不支持反向导入
```

#### Q2: 真相文件能否直接用外部编辑器修改？

**答**：不能直接修改。
- CLI 版：可以直接编辑 `.md` 文件
- HTML 版：需通过界面编辑，或导出修改后再导入

#### Q3: 通义千问和 GPT-4o 能混用吗？

**答**：同一时间只能用一种，但可快速切换。
- 全局配置：`~/.inkos/.env`
- 项目配置：项目根目录 `.env`（优先级更高）

```bash
# 切换到通义千问
INKOS_LLM_PROVIDER=aliyun

# 切换回 GPT-4o
INKOS_LLM_PROVIDER=openai
```

#### Q4: LocalStorage 数据会丢失吗？

**答**：以下情况会丢失：
- 清除浏览器缓存
- 卸载浏览器
- 更换设备/浏览器

**建议**：定期导出备份（每周一次）

#### Q5: 自定义模型支持流式输出吗？

**答**：取决于你的服务实现。
- HTML 版：当前为非流式（简化实现）
- CLI 版：支持流式（`inkos write next --stream`）

---

### 升级路线图

#### v0.5 计划（2026 Q2）
- [ ] 支持 IndexedDB 存储（突破 LocalStorage 限制）
- [ ] 离线 PWA 支持（Service Worker）
- [ ] 实时协作编辑（WebSocket）
- [ ] 插件系统（自定义 Agent）

#### v0.6 计划（2026 Q3）
- [ ] 与 CLI 版双向同步
- [ ] Git 版本控制集成
- [ ] 云端备份（可选）
- [ ] 多语言界面（i18n）

---

> **相关文档**：
> - [LLM 配置指南.md](LLM 配置指南.md) - 详细的 LLM 配置说明
> - [更新说明.md](更新说明.md) - 完整的更新日志
> - [InkOS-Studio.html](InkOS-Studio.html) - HTML 应用程序

---

## 许可证

[MIT](LICENSE)
