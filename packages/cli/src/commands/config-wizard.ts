#!/usr/bin/env node

/**
 * InkOS LLM 配置向导
 * 
 * 交互式命令行工具，帮助用户快速配置 LLM 提供商
 * 支持：OpenAI, Anthropic, 阿里云通义千问，自定义模型
 */

import { Command } from "commander";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

export const configWizardCommand = new Command("wizard")
  .description("Interactive LLM configuration wizard (互动式配置向导)")
  .action(async () => {
    await runWizard();
  });

const PROVIDERS = [
  {
    value: "openai",
    name: "OpenAI (GPT-4o/GPT-3.5)",
    defaultUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    guide: "在 https://platform.openai.com/api-keys 获取 API Key"
  },
  {
    value: "anthropic",
    name: "Anthropic (Claude 系列)",
    defaultUrl: "https://api.anthropic.com",
    defaultModel: "claude-3-5-sonnet-20241022",
    guide: "在 https://console.anthropic.com/ 获取 API Key"
  },
  {
    value: "aliyun",
    name: "阿里云通义千问 (Qwen) ⭐ 推荐国内用户",
    defaultUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    models: ["qwen-plus", "qwen-max", "qwen-turbo"],
    guide: "在 https://bailian.console.aliyun.com/ 获取 API Key\n支持支付宝/微信支付，国内可直接访问"
  },
  {
    value: "custom",
    name: "自定义大模型 (OpenAI 兼容)",
    defaultUrl: "",
    defaultModel: "",
    guide: "适用于 Ollama、DeepSeek、Moonshot、智谱 AI 等兼容 OpenAI 接口的服务"
  }
];

async function prompt(message: string): Promise<string> {
  return new Promise((resolve) => {
    import("node:readline").then((rl) => {
      const readline = rl.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question(message, (answer) => {
        readline.close();
        resolve(answer.trim());
      });
    });
  });
}

async function select(message: string, options: string[]): Promise<number> {
  console.log(`\n${message}`);
  options.forEach((opt, idx) => {
    console.log(`  ${idx + 1}. ${opt}`);
  });
  
  while (true) {
    const input = await prompt("\n请选择 (输入数字): ");
    const num = parseInt(input);
    if (num >= 1 && num <= options.length) {
      return num - 1;
    }
    console.log("无效选择，请重新输入");
  }
}

async function runWizard() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   InkOS LLM 配置向导                   ║");
  console.log("╚════════════════════════════════════════╝\n");

  // 选择提供商
  const providerIndex = await select(
    "请选择 AI 服务提供商:",
    PROVIDERS.map(p => p.name)
  );
  
  const provider = PROVIDERS[providerIndex];
  console.log(`\n✓ 已选择：${provider.name}`);
  console.log(`📖 ${provider.guide}`);

  // 配置 Base URL
  let baseUrl = await prompt(`\nAPI Base URL [默认：${provider.defaultUrl}]: `);
  if (!baseUrl) baseUrl = provider.defaultUrl;

  // 配置 API Key
  let apiKey = await prompt("API Key: ");
  while (!apiKey) {
    console.log("❌ API Key 不能为空");
    apiKey = await prompt("API Key: ");
  }

  // 配置模型名称
  let model: string;
  if (provider.models) {
    const modelIndex = await select(
      "选择模型:",
      provider.models.map(m => `${m}${m === provider.defaultModel ? ' (推荐)' : ''}`)
    );
    model = provider.models[modelIndex];
  } else {
    const defaultModel = provider.defaultModel || "your-model-name";
    model = await prompt(`模型名称 [默认：${defaultModel}]: `);
    if (!model) model = defaultModel;
  }

  // 配置 Temperature
  const tempInput = await prompt("\nTemperature (0-2, 越高越随机) [默认：0.7]: ");
  const temperature = tempInput ? parseFloat(tempInput) : 0.7;

  // 配置 Max Tokens
  const tokensInput = await prompt("Max Tokens (单次最大输出) [默认：8192]: ");
  const maxTokens = tokensInput ? parseInt(tokensInput) : 8192;

  // 生成配置
  const configLines = [
    "# InkOS LLM Configuration",
    `INKOS_LLM_PROVIDER=${provider.value}`,
    `INKOS_LLM_BASE_URL=${baseUrl}`,
    `INKOS_LLM_API_KEY=${apiKey}`,
    `INKOS_LLM_MODEL=${model}`,
    `INKOS_LLM_TEMPERATURE=${temperature}`,
    `INKOS_LLM_MAX_TOKENS=${maxTokens}`
  ];

  // 保存配置
  const globalConfigDir = join(homedir(), ".inkos");
  const globalEnvPath = join(globalConfigDir, ".env");
  
  await mkdir(globalConfigDir, { recursive: true });
  await writeFile(globalEnvPath, configLines.join("\n") + "\n", "utf-8");

  console.log("\n✅ 配置完成！");
  console.log(`\n📄 配置文件已保存到：${globalEnvPath}`);
  console.log("\n配置摘要:");
  console.log(`  提供商：${provider.value}`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  模型：${model}`);
  console.log(`  Temperature: ${temperature}`);
  console.log(`  Max Tokens: ${maxTokens}`);
  
  console.log("\n💡 提示:");
  console.log("  - 使用 'inkos doctor' 测试 API 连通性");
  console.log("  - 使用 'inkos config show-global' 查看配置");
  console.log("  - 在项目目录创建 .env 可覆盖全局配置");
  
  // 询问是否测试连接
  const testInput = await prompt("\n是否立即测试 API 连通性？(y/n): ");
  if (testInput.toLowerCase() === 'y') {
    console.log("\n🔌 正在测试连接...");
    console.log("请使用 'inkos doctor' 命令进行完整测试");
  }
}

main().catch(console.error);
