// server.js - InkOS Studio 本地 HTTP 服务（完整版）
// 集成 CLI 核心功能：写作、审阅、检测、文风分析等

const express = require('express');
const fs = require('fs');
const path = require('path');

// 导入 CLI 核心模块
const { 
    PipelineRunner, 
    StateManager, 
    detectAIContent, 
    analyzeStyle,
    createLLMClient,
    loadConfig: loadCoreConfig
} = require('./packages/core/dist/index.js');

const app = express();
const PORT = 3000;
let projectPath = null;
let activeClients = 0;
let shutdownTimer = null;
let llmConfig = null;

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// ==================== 静态文件服务 ====================
// 允许直接访问 HTML 文件（无需启动器也能用）
app.get('/', (req, res) => {
    const htmlFile = path.join(__dirname, 'InkOS-Studio.html');
    res.sendFile(htmlFile);
});

app.get('/InkOS-Studio.html', (req, res) => {
    const htmlFile = path.join(__dirname, 'InkOS-Studio.html');
    res.sendFile(htmlFile);
});

// ==================== 基础 API（原有功能）====================

// 客户端连接计数
app.get('/connect', (req, res) => {
  activeClients++;
  console.log(`👥 活跃客户端：${activeClients}`);
  
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }
  
  res.json({ ok: true, clients: activeClients });
});

// 客户端断开
app.get('/disconnect', (req, res) => {
  activeClients--;
  console.log(`👋 活跃客户端：${activeClients}`);
  
  if (activeClients <= 0) {
    console.log('⏰ 无客户端，2 秒后关闭服务...');
    shutdownTimer = setTimeout(() => {
      console.log('🛑 服务已关闭');
      process.exit(0);
    }, 2000);
  }
  
  res.json({ ok: true, clients: activeClients });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    clients: activeClients,
    projectPath: projectPath || null
  });
});

// 设置项目路径
app.post('/set-project', (req, res) => {
  const { path: newProjectPath } = req.body;
  
  if (!newProjectPath) {
    return res.status(400).json({ error: '项目路径不能为空' });
  }
  
  if (!fs.existsSync(newProjectPath)) {
    return res.status(404).json({ error: '项目路径不存在' });
  }
  
  // 加载 LLM 配置
  try {
    const envPath = path.join(newProjectPath, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      llmConfig = parseEnvFile(envContent);
      console.log('✅ LLM 配置已加载');
    }
  } catch (e) {
    console.log('⚠️ 未找到 .env 文件，将在 HTML 中配置');
  }
  
  projectPath = newProjectPath;
  console.log(`📁 项目路径：${projectPath}`);
  
  res.json({ success: true });
});

// 读取真相文件
app.get('/read-file', (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, fileName } = req.query;
  
  if (!bookId || !fileName) {
    return res.status(400).json({ error: '缺少参数 bookId 或 fileName' });
  }
  
  const filePath = path.join(projectPath, 'books', bookId, 'state', fileName);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `文件不存在：${fileName}` });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`📖 已读取：${fileName}`);
    res.json({ content, fileName, bookId });
    
  } catch (error) {
    console.error('读取失败:', error.message);
    res.status(500).json({ error: `读取失败：${error.message}` });
  }
});

// 写入真相文件
app.post('/write-file', (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, fileName, content } = req.body;
  
  if (!bookId || !fileName) {
    return res.status(400).json({ error: '缺少参数 bookId 或 fileName' });
  }
  
  if (content === undefined) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  
  const filePath = path.join(projectPath, 'books', bookId, 'state', fileName);
  
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录：${dir}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`💾 已保存：${fileName}`);
    
    res.json({ 
      success: true, 
      fileName, 
      bookId,
      bytesWritten: Buffer.byteLength(content, 'utf-8')
    });
    
  } catch (error) {
    console.error('写入失败:', error.message);
    res.status(500).json({ error: `写入失败：${error.message}` });
  }
});

// 列出所有书籍
app.get('/list-books', (req, res) => {
  if (!projectPath) {
    return res.json({ books: [], projectPath: null });
  }
  
  const booksDir = path.join(projectPath, 'books');
  
  if (!fs.existsSync(booksDir)) {
    return res.json({ books: [], message: 'books 目录不存在' });
  }
  
  try {
    const books = fs.readdirSync(booksDir)
      .filter(name => !name.startsWith('.') && fs.statSync(path.join(booksDir, name)).isDirectory())
      .map(name => {
        const bookJsonPath = path.join(booksDir, name, 'book.json');
        let bookInfo = { id: name, name };
        
        if (fs.existsSync(bookJsonPath)) {
          try {
            const bookJson = JSON.parse(fs.readFileSync(bookJsonPath, 'utf-8'));
            bookInfo = {
              ...bookInfo,
              title: bookJson.title || name,
              genre: bookJson.genre,
              protagonist: bookJson.protagonist
            };
          } catch (e) {}
        }
        
        return bookInfo;
      });
    
    console.log(`📚 找到 ${books.length} 本书`);
    res.json({ books });
    
  } catch (error) {
    console.error('列出书籍失败:', error.message);
    res.status(500).json({ error: `列出失败：${error.message}`, books: [] });
  }
});

// 创建新书籍
app.post('/create-book', (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, title, genre, settingContent } = req.body;
  
  if (!bookId || !title) {
    return res.status(400).json({ error: '缺少参数 bookId 或 title' });
  }
  
  const bookDir = path.join(projectPath, 'books', bookId);
  const stateDir = path.join(bookDir, 'state');
  
  try {
    if (fs.existsSync(bookDir)) {
      return res.status(400).json({ error: '书籍已存在' });
    }
    
    fs.mkdirSync(stateDir, { recursive: true });
    console.log(`📁 创建书籍目录：${bookDir}`);
    
    const bookJson = {
      title,
      genre: genre || 'other',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(
      path.join(bookDir, 'book.json'),
      JSON.stringify(bookJson, null, 2),
      'utf-8'
    );
    
    const truthFiles = {
      'current_state.md': '# 当前世界状态\n\n## 角色位置\n\n## 关系网络\n\n## 已知信息\n\n## 情感弧线\n',
      'particle_ledger.md': '# 资源账本\n\n## 物品\n\n## 金钱\n\n## 物资\n',
      'pending_hooks.md': '# 未闭合伏笔\n\n## 铺垫\n\n## 承诺\n\n## 未解决冲突\n',
      'chapter_summaries.md': '# 章节摘要\n\n',
      'subplot_board.md': '# 支线进度板\n\n## A 线\n\n## B 线\n\n## C 线\n',
      'emotional_arcs.md': '# 情感弧线\n\n',
      'character_matrix.md': '# 角色交互矩阵\n\n'
    };
    
    Object.entries(truthFiles).forEach(([fileName, content]) => {
      fs.writeFileSync(path.join(stateDir, fileName), content, 'utf-8');
    });
    
    // 如果有设定文档
    if (settingContent) {
      fs.writeFileSync(
        path.join(stateDir, 'book_setting.md'),
        `# 书籍设定文档\n\n${settingContent}`,
        'utf-8'
      );
    }
    
    console.log(`📚 创建书籍：${title} (${bookId})`);
    res.json({ success: true, bookId, title });
    
  } catch (error) {
    console.error('创建书籍失败:', error.message);
    res.status(500).json({ error: `创建失败：${error.message}` });
  }
});

// 删除书籍
app.post('/delete-book', (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId } = req.body;
  
  if (!bookId) {
    return res.status(400).json({ error: '缺少参数 bookId' });
  }
  
  const bookDir = path.join(projectPath, 'books', bookId);
  
  try {
    if (!fs.existsSync(bookDir)) {
      return res.status(404).json({ error: '书籍不存在' });
    }
    
    fs.rmSync(bookDir, { recursive: true, force: true });
    console.log(`🗑️ 删除书籍：${bookId}`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('删除书籍失败:', error.message);
    res.status(500).json({ error: `删除失败：${error.message}` });
  }
});

// 列出真相文件
app.get('/list-truth-files', (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId } = req.query;
  
  if (!bookId) {
    return res.status(400).json({ error: '缺少参数 bookId' });
  }
  
  const stateDir = path.join(projectPath, 'books', bookId, 'state');
  
  if (!fs.existsSync(stateDir)) {
    return res.json({ files: [], message: 'state 目录不存在' });
  }
  
  try {
    const files = fs.readdirSync(stateDir)
      .filter(name => name.endsWith('.md'));
    
    console.log(`📄 找到 ${files.length} 个真相文件`);
    res.json({ files });
    
  } catch (error) {
    console.error('列出文件失败:', error.message);
    res.status(500).json({ error: `列出失败：${error.message}`, files: [] });
  }
});

// 关闭服务
app.post('/shutdown', (req, res) => {
  console.log('🛑 收到关闭指令');
  res.json({ success: true, message: '服务将在 1 秒后关闭' });
  
  setTimeout(() => {
    console.log('🛑 服务已关闭');
    process.exit(0);
  }, 1000);
});

// ==================== CLI 核心功能集成 API ====================

/**
 * 智能写作 API
 * 调用完整写作管线：雷达 → 建筑师 → 写手 → 审计 → 修订
 */
app.post('/api/write', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  if (!llmConfig) {
    return res.status(400).json({ error: '请先配置 LLM' });
  }
  
  const { bookId, context, words, count = 1, useRadar = false } = req.body;
  
  try {
    console.log(`✍️ 开始为"${bookId}"写作，目标字数：${words}, 连续：${count}章`);
    
    const state = new StateManager(projectPath);
    const bookConfig = await state.loadBookConfig(bookId);
    
    const pipeline = new PipelineRunner({
      client: createLLMClient(llmConfig),
      model: llmConfig.model,
      projectRoot: projectPath,
      externalContext: context ? { text: context } : null,
    });
    
    const results = [];
    for (let i = 0; i < count; i++) {
      console.log(`[${i + 1}/${count}] 正在写第${i + 1}章...`);
      const result = await pipeline.writeNextChapter(bookId, words);
      results.push(result);
      
      console.log(`✅ 第${result.chapterNumber}章完成：${result.title}`);
    }
    
    res.json({ 
      success: true, 
      results,
      message: `成功创作 ${results.length} 章`
    });
    
  } catch (error) {
    console.error('写作失败:', error.message);
    res.status(500).json({ 
      error: `写作失败：${error.message}`,
      stack: error.stack 
    });
  }
});

/**
 * 审阅列表 API
 * 获取待审阅的章节列表
 */
app.get('/api/review/list', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId } = req.query;
  
  try {
    const state = new StateManager(projectPath);
    const index = await state.loadChapterIndex(bookId);
    
    const pending = index.filter(ch => 
      ch.status === 'ready-for-review' || ch.status === 'audit-failed'
    );
    
    const book = await state.loadBookConfig(bookId);
    
    res.json({ 
      success: true,
      bookTitle: book.title,
      pending 
    });
    
  } catch (error) {
    console.error('获取审阅列表失败:', error.message);
    res.status(500).json({ error: `获取失败：${error.message}` });
  }
});

/**
 * 批准章节 API
 */
app.post('/api/review/approve', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, chapterNumber } = req.body;
  
  try {
    const state = new StateManager(projectPath);
    await state.approveChapter(bookId, chapterNumber);
    
    console.log(`✅ 已批准 ${bookId} 第${chapterNumber}章`);
    res.json({ success: true });
    
  } catch (error) {
    console.error('批准章节失败:', error.message);
    res.status(500).json({ error: `批准失败：${error.message}` });
  }
});

/**
 * AIGC 检测 API
 */
app.post('/api/detect', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, chapterNumber, text } = req.body;
  
  try {
    let detectionResult;
    
    if (text) {
      // 检测指定文本
      detectionResult = await detectAIContent(text);
    } else if (bookId && chapterNumber) {
      // 检测指定章节
      const state = new StateManager(projectPath);
      const chapter = await state.loadChapter(bookId, chapterNumber);
      detectionResult = await detectAIContent(chapter.content);
    } else {
      return res.status(400).json({ error: '请提供 text 或 bookId+chapterNumber' });
    }
    
    res.json({ 
      success: true,
      result: detectionResult 
    });
    
  } catch (error) {
    console.error('AIGC 检测失败:', error.message);
    res.status(500).json({ error: `检测失败：${error.message}` });
  }
});

/**
 * 文风分析 API
 */
app.post('/api/style/analyze', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: '请提供文本' });
  }
  
  try {
    const analysis = await analyzeStyle(text);
    
    res.json({ 
      success: true,
      profile: analysis 
    });
    
  } catch (error) {
    console.error('文风分析失败:', error.message);
    res.status(500).json({ error: `分析失败：${error.message}` });
  }
});

/**
 * 导入文风 API
 */
app.post('/api/style/import', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, styleProfile, styleName } = req.body;
  
  try {
    const state = new StateManager(projectPath);
    const stateDir = path.join(projectPath, 'books', bookId, 'state');
    
    // 生成风格指南 MD
    const styleGuide = generateStyleGuideMarkdown(styleProfile, styleName);
    
    // 保存 style_guide.md
    fs.writeFileSync(
      path.join(stateDir, 'style_guide.md'),
      styleGuide,
      'utf-8'
    );
    
    // 保存 style_profile.json
    fs.writeFileSync(
      path.join(stateDir, 'style_profile.json'),
      JSON.stringify({
        name: styleName || '自定义风格',
        analyzedAt: new Date().toISOString(),
        stats: styleProfile.stats,
        description: styleProfile.description
      }, null, 2),
      'utf-8'
    );
    
    console.log(`✅ 文风"${styleName}"已导入到 ${bookId}`);
    res.json({ success: true });
    
  } catch (error) {
    console.error('导入文风失败:', error.message);
    res.status(500).json({ error: `导入失败：${error.message}` });
  }
});

/**
 * 获取书籍状态 API
 */
app.get('/api/book/status', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId } = req.query;
  
  try {
    const state = new StateManager(projectPath);
    const book = await state.loadBookConfig(bookId);
    const index = await state.loadChapterIndex(bookId);
    
    const nextChapter = index.length > 0 
      ? Math.max(...index.map(ch => ch.number)) + 1 
      : 1;
    
    const totalWords = index.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    
    res.json({
      success: true,
      book: {
        id: bookId,
        title: book.title,
        genre: book.genre,
        currentChapter: nextChapter - 1,
        totalWords,
        targetChapters: book.targetChapters || 100,
        chapterWordCount: book.chapterWordCount || 5000,
        status: book.status
      }
    });
    
  } catch (error) {
    console.error('获取书籍状态失败:', error.message);
    res.status(500).json({ error: `获取失败：${error.message}` });
  }
});

/**
 * 读取章节内容 API
 */
app.get('/api/chapter/read', async (req, res) => {
  if (!projectPath) {
    return res.status(400).json({ error: '未设置项目路径' });
  }
  
  const { bookId, chapterNumber } = req.query;
  
  try {
    const state = new StateManager(projectPath);
    const chapter = await state.loadChapter(bookId, chapterNumber);
    
    res.json({
      success: true,
      chapter
    });
    
  } catch (error) {
    console.error('读取章节失败:', error.message);
    res.status(500).json({ error: `读取失败：${error.message}` });
  }
});

/**
 * 保存配置 API
 */
app.post('/api/config/save', async (req, res) => {
  const { provider, baseUrl, apiKey, model, temperature, maxTokens } = req.body;
  
  try {
    llmConfig = {
      provider,
      baseUrl,
      apiKey,
      model,
      temperature,
      maxTokens
    };
    
    // 保存到 .env 文件
    const envContent = generateEnvContent(llmConfig);
    const envPath = projectPath 
      ? path.join(projectPath, '.env')
      : path.join(process.cwd(), '.env');
    
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('✅ 配置已保存');
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('保存配置失败:', error.message);
    res.status(500).json({ error: `保存失败：${error.message}` });
  }
});

// ==================== 辅助函数 ====================

function parseEnvFile(content) {
  const config = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      const configKey = key.replace('INKOS_LLM_', '').toLowerCase();
      config[configKey] = value;
    }
  }
  
  return config;
}

function generateEnvContent(config) {
  return `# InkOS LLM Configuration
INKOS_LLM_PROVIDER=${config.provider || 'openai'}
INKOS_LLM_BASE_URL=${config.baseUrl || 'https://api.openai.com/v1'}
INKOS_LLM_API_KEY=${config.apiKey || ''}
INKOS_LLM_MODEL=${config.model || 'gpt-4o'}
INKOS_LLM_TEMPERATURE=${config.temperature || 0.7}
INKOS_LLM_MAX_TOKENS=${config.maxTokens || 8192}
`;
}

function generateStyleGuideMarkdown(profile, styleName) {
  return `# 文风指南 - ${styleName || '自定义风格'}

## 📊 统计特征

- **平均句长**: ${profile.avgSentenceLength?.toFixed(1) || 0} 字
- **词汇多样性 (TTR)**: ${(profile.ttr || 0) * 100}%
- **平均段落长度**: ${profile.avgParagraphLength?.toFixed(0) || 0} 字
- **对话比例**: ${profile.dialogueRatio?.toFixed(1) || 0}%
- **稀有词汇数**: ${profile.rareWordsCount || 0} 个

## 🎨 文风特点

${profile.styleDescription || '暂无详细描述'}

## ✍️ 写作指导

基于以上分析，在创作时应注意：

1. **句式控制**: 保持与参考文本相似的句长节奏
2. **词汇选择**: 维持相当的词汇多样性水平
3. **段落结构**: 遵循参考文本的段落组织方式
4. **对话处理**: 按照分析的对话比例平衡对话与叙述
5. **语言风格**: 体现分析出的整体文风特征

---

*此文风指南由 InkOS Studio 自动生成*
`;
}

// ==================== 启动服务 ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     InkOS Studio - HTTP 服务（完整版） ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n🚀 服务就绪：http://localhost:${PORT}`);
  console.log('💡 提示：关闭所有浏览器标签页后，服务会自动停止');
  console.log('📁 等待设置项目路径...\n');
  console.log('✨ 已集成 CLI 核心功能：');
  console.log('   - POST /api/write         智能写作');
  console.log('   - GET  /api/review/list   审阅列表');
  console.log('   - POST /api/review/approve 批准章节');
  console.log('   - POST /api/detect        AIGC 检测');
  console.log('   - POST /api/style/analyze 文风分析');
  console.log('   - POST /api/style/import  导入文风');
  console.log('   - GET  /api/book/status   书籍状态');
  console.log('   - GET  /api/chapter/read  读取章节');
  console.log('   - POST /api/config/save   保存配置\n');
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，服务已关闭');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，服务已关闭');
  process.exit(0);
});
