// server.js - InkOS Studio 本地 HTTP 服务
// 直接读写项目文件夹中的 MD 文件

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
let projectPath = null;
let activeClients = 0;
let shutdownTimer = null;

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// 客户端连接计数
app.get('/connect', (req, res) => {
  activeClients++;
  console.log(`👥 活跃客户端：${activeClients}`);
  
  // 清除自动关闭定时器
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
  
  // 如果没有客户端了，2 秒后自动关闭
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
  
  // 验证路径是否存在
  if (!fs.existsSync(newProjectPath)) {
    return res.status(404).json({ error: '项目路径不存在' });
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
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录：${dir}`);
    }
    
    // 写入文件
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
        // 尝试读取 book.json 获取更多信息
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
          } catch (e) {
            // 忽略解析错误
          }
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
  
  const { bookId, title, genre } = req.body;
  
  if (!bookId || !title) {
    return res.status(400).json({ error: '缺少参数 bookId 或 title' });
  }
  
  const bookDir = path.join(projectPath, 'books', bookId);
  const stateDir = path.join(bookDir, 'state');
  
  try {
    // 检查是否已存在
    if (fs.existsSync(bookDir)) {
      return res.status(400).json({ error: '书籍已存在' });
    }
    
    // 创建目录
    fs.mkdirSync(stateDir, { recursive: true });
    console.log(`📁 创建书籍目录：${bookDir}`);
    
    // 创建 book.json
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
    
    // 创建初始真相文件
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
    
    // 递归删除目录
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

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     InkOS Studio - HTTP 服务           ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n🚀 服务就绪：http://localhost:${PORT}`);
  console.log('💡 提示：关闭所有浏览器标签页后，服务会自动停止');
  console.log('📁 等待设置项目路径...\n');
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
