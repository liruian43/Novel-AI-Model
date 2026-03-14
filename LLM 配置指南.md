# InkOS LLM 配置指南

本文档介绍如何配置 InkOS 使用不同的大语言模型提供商。

## 支持的模型提供商

InkOS 现已支持以下大语言模型服务：

### 1. OpenAI (GPT 系列)

**适用模型**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo

**配置方式**:
- **提供商**: `openai`
- **Base URL**: `https://api.openai.com/v1`
- **API Key**: 在 [OpenAI 平台](https://platform.openai.com/api-keys) 获取
- **推荐模型**: `gpt-4o` (性能最佳), `gpt-4-turbo`, `gpt-3.5-turbo` (经济实惠)

**优点**:
- 创作质量高，逻辑连贯性好
- 对长篇小说支持良好
- 适合各种题材

**缺点**:
- 需要国际支付方式
- 国内访问可能需要网络代理

---

### 2. Anthropic (Claude 系列)

**适用模型**: Claude 3.5 Sonnet, Claude 3 Opus

**配置方式**:
- **提供商**: `anthropic`
- **Base URL**: `https://api.anthropic.com`
- **API Key**: 在 [Anthropic 控制台](https://console.anthropic.com/) 获取
- **推荐模型**: `claude-3-5-sonnet-20241022` (最新), `claude-3-opus-20240229`

**优点**:
- 文本自然度高，"AI 味"较少
- 擅长文学创作和角色扮演
- 上下文窗口大 (200K)

**缺点**:
- 价格相对较高
- 国内访问困难

---

### 3. 阿里云通义千问 (Qwen) ⭐ 新增

**适用模型**: Qwen-Max, Qwen-Plus, Qwen-Turbo

**配置方式**:
- **提供商**: `aliyun`
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- **API Key**: 在 [阿里云百炼平台](https://bailian.console.aliyun.com/) 获取
- **推荐模型**: 
  - `qwen-plus` - 性价比高，推荐用于日常写作
  - `qwen-max` - 最强性能，适合复杂场景
  - `qwen-turbo` - 速度快，成本低

**开通步骤**:
1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 进入"API-KEY 管理"页面
4. 点击"创建新的 API-KEY"
5. 复制生成的 API Key
6. 确保开通"模型服务"（Qwen-Max/Plus/Turbo）

**计费参考** (2024 年价格，请以官网为准):
- Qwen-Plus: 输入 0.004 元/K tokens, 输出 0.012 元/K tokens
- Qwen-Max: 输入 0.04 元/K tokens, 输出 0.12 元/K tokens
- Qwen-Turbo: 输入 0.002 元/K tokens, 输出 0.006 元/K tokens

**优点**:
- ✅ 国内可直接访问，无需代理
- ✅ 支持支付宝/微信支付
- ✅ 中文创作能力强
- ✅ 性价比高，Qwen-Plus 价格亲民
- ✅ 兼容 OpenAI 接口格式

**缺点**:
- 超长文本处理能力略逊于 Claude
- 部分高级功能需要 Qwen-Max

**使用建议**:
- 日常写作推荐使用 `qwen-plus`，性价比最高
- 复杂剧情和人物关系处理可用 `qwen-max`
- 快速生成草稿可用 `qwen-turbo`

---

### 4. 自定义大模型 (Custom) ⭐ 新增

**适用场景**:
- 本地部署的开源模型 (如 Ollama、vLLM、LocalAI 等)
- 其他第三方 OpenAI 兼容服务 (如 DeepSeek、Moonshot、智谱 AI 等)
- 企业私有化部署的模型

**配置方式**:
- **提供商**: `custom`
- **Base URL**: 您的自定义 API 地址
- **API Key**: 您的 API Key (如无特殊要求可填写任意值)
- **模型名称**: 您的模型名称

**常见兼容服务示例**:

#### Ollama (本地部署)
```
Base URL: http://localhost:11434/v1
API Key: ollama (或留空)
模型：qwen2.5:7b, llama3.1:8b, mistral:7b 等
```

#### DeepSeek (深度求索)
```
Base URL: https://api.deepseek.com/v1
API Key: 在 DeepSeek 官网获取
模型：deepseek-chat
```

#### Moonshot (月之暗面)
```
Base URL: https://api.moonshot.cn/v1
API Key: 在 Moonshot 开放平台获取
模型：moonshot-v1-8k, moonshot-v1-32k
```

#### 智谱 AI
```
Base URL: https://open.bigmodel.cn/api/paas/v4
API Key: 在智谱 AI 开放平台获取
模型：glm-4, glm-3-turbo
```

#### OneAPI / NewAPI (聚合服务)
```
Base URL: 您的聚合服务地址
API Key: 您的 API Key
模型：根据服务商提供的模型列表
```

**优点**:
- 灵活性最高，可接入任何兼容服务
- 本地部署可保护数据隐私
- 可选择性价比最优的服务

**缺点**:
- 需要自行维护服务稳定性
- 不同模型质量参差不齐

---

## 配置方法

### 方法一：通过 HTML 界面配置 (推荐)

1. 双击打开 `InkOS-Studio.html`
2. 点击左侧导航栏的 **"⚙️ 配置管理"**
3. 在 **"LLM 配置"** 区域:
   - 选择 AI 服务提供商
   - Base URL 会自动填充 (可手动修改)
   - 填写 API Key
   - 确认模型名称
4. 点击 **"💾 保存配置"**
5. (可选) 点击 **"🔌 测试连接"** 验证配置

### 方法二：编辑 .env 文件

在项目根目录创建或编辑 `.env` 文件:

```bash
# 提供商选择：openai, anthropic, aliyun, custom
INKOS_LLM_PROVIDER=aliyun

# API Base URL
INKOS_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# API Key
INKOS_LLM_API_KEY=sk-your-qwen-api-key-here

# 模型名称
INKOS_LLM_MODEL=qwen-plus

# 可选：Temperature (0-2)
INKOS_LLM_TEMPERATURE=0.7

# 可选：最大输出 token 数
INKOS_LLM_MAX_TOKENS=8192
```

---

## 模型选择建议

### 按使用场景推荐

| 场景 | 推荐模型 | 理由 |
|------|---------|------|
| **高质量长篇创作** | Claude 3.5 Sonnet / GPT-4o / Qwen-Max | 上下文理解能力强，逻辑严密 |
| **日常连载更新** | Qwen-Plus / GPT-4 Turbo | 性价比高，质量稳定 |
| **快速生成草稿** | Qwen-Turbo / GPT-3.5 Turbo | 速度快，成本低 |
| **中文仙侠/玄幻** | Qwen 系列 / GPT-4o | 中文语境理解好 |
| **西幻/科幻** | Claude 3.5 / GPT-4o | 世界观构建能力强 |
| **悬疑推理** | Claude 3.5 / GPT-4o | 逻辑推理能力强 |
| **都市/言情** | Qwen-Plus / GPT-4 Turbo | 情感描写细腻 |

### 按预算推荐

| 预算 | 推荐方案 | 预估成本 (每万字) |
|------|---------|------------------|
| **零成本** | Ollama 本地部署 | 电费 + 硬件成本 |
| **低成本** | Qwen-Turbo / GPT-3.5 Turbo | ¥0.5 - ¥1 |
| **中等预算** | Qwen-Plus / GPT-4 Turbo | ¥2 - ¥4 |
| **追求品质** | Qwen-Max / GPT-4o / Claude 3.5 | ¥8 - ¥15 |

*注：成本估算基于实际测试数据，具体消耗因内容复杂度而异*

---

## 常见问题 FAQ

### Q: API Key 在哪里获取？

各平台获取地址：
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **阿里云通义千问**: https://bailian.console.aliyun.com/ → API-KEY 管理
- **DeepSeek**: https://platform.deepseek.com/
- **Moonshot**: https://platform.moonshot.cn/
- **智谱 AI**: https://open.bigmodel.cn/

### Q: 如何切换不同的模型？

在 HTML 界面的"配置管理"页面重新选择提供商并保存即可。切换后所有后续请求都会使用新模型。

### Q: 可以混合使用多个模型吗？

目前不支持在同一项目中混合使用多个模型。如需切换，请更改配置后继续使用。

### Q: 通义千问的 API Key 如何充值？

1. 登录阿里云百炼平台
2. 进入"费用中心"
3. 选择充值金额
4. 支持支付宝、微信、银行卡支付

### Q: 自定义模型的兼容性如何？

只要是遵循 OpenAI Chat Completions API 格式的服务都可以兼容。主要特征：
- POST 请求到 `/v1/chat/completions` 端点
- 请求体包含 `model`, `messages`, `temperature` 等字段
- 返回流式或非流式的 JSON 响应

### Q: 使用本地模型有什么注意事项？

1. **性能要求**: 建议使用 7B 以上参数量的模型以获得较好效果
2. **显存需求**: 7B 模型约需 16GB 显存，14B 约需 24GB
3. **速度优化**: 可使用量化版本 (如 Q4_K_M) 降低显存占用
4. **接口工具**: 推荐使用 Ollama 或 vLLM 提供 OpenAI 兼容接口

### Q: 为什么有时返回的内容不符合预期？

可能原因：
1. **模型能力限制**: 较小模型理解复杂指令能力有限
2. **Temperature 过高**: 建议设置在 0.6-0.8 之间
3. **Prompt 不清晰**: 在"本章创作指导"中提供更详细的指示
4. **上下文过长**: 接近模型 token 上限时质量会下降

解决方法：
- 升级到更强的模型
- 降低 Temperature 值
- 优化创作指导的描述
- 适当控制章节长度

---

## 最佳实践

### 1. 配置备份

定期导出配置和数据：
- 在"配置管理"页面点击"📤 导出全部数据"
- 保存 JSON 备份文件到安全位置

### 2. 成本监控

- 阿里云用户可在百炼平台查看用量统计
- OpenAI 用户可在 Usage 页面监控消费
- 建议设置月度预算告警

### 3. 多环境配置

开发环境和生产环境使用不同配置：
- **开发**: 使用低成本模型快速迭代
- **生产**: 使用高质量模型生成正式内容

### 4. 错误处理

遇到 API 错误时的排查顺序：
1. 检查 API Key 是否正确
2. 检查 Base URL 是否可访问
3. 检查账户余额是否充足
4. 使用 `inkos doctor` 命令诊断
5. 尝试更换模型或降低请求频率

---

## 更新日志

### v0.5.x (当前版本)
- ✅ 新增阿里云通义千问 (Qwen) 官方支持
- ✅ 新增自定义大模型配置选项
- ✅ 优化 HTML 界面配置体验
- ✅ 添加详细配置说明和提示

### 未来计划
- 🔄 一键切换多个预设配置
- 🔄 模型使用统计和成本分析
- 🔄 自动推荐最优性价比模型
- 🔄 更多模型提供商原生支持

---

## 技术支持

如有问题可通过以下方式反馈：
- GitHub Issues: https://github.com/Narcooo/inkos/issues
- 项目文档：README.md

---

**祝您创作愉快！** 🎉
