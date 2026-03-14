#!/usr/bin/env node

/**
 * InkOS Studio - 智能启动器
 * 
 * 功能：
 * 1. 检测系统是否有 Node.js
 * 2. 没有则下载便携版到项目文件夹
 * 3. 启动 HTTP 服务
 * 4. 自动打开浏览器
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// 配置
const PORTABLE_NODE_URL = 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip';
const PORTABLE_NODE_DIR = path.join(__dirname, 'node-portable');
const NODE_EXE = path.join(PORTABLE_NODE_DIR, 'node-v20.11.0-win-x64', 'node.exe');
const SERVER_JS = path.join(__dirname, 'server.js');
const HTML_FILE = path.join(__dirname, 'InkOS-Studio.html');
const PORT = 3000;

console.log('\n╔════════════════════════════════════════╗');
console.log('║     InkOS Studio - 智能启动器          ║');
console.log('╚════════════════════════════════════════╝\n');

// 主流程
async function main() {
  try {
    // 步骤 1: 检测 Node.js
    const nodePath = await detectNodeJS();
    console.log(`✅ Node.js 路径：${nodePath}\n`);
    
    // 步骤 2: 安装依赖
    await installDependencies(nodePath);
    
    // 步骤 3: 检查服务是否已在运行
    const serviceRunning = await checkServiceRunning();
    if (serviceRunning) {
      console.log('ℹ️  服务已在运行\n');
    } else {
      console.log('🚀 启动本地服务...');
      await startService(nodePath);
    }
    
    // 步骤 4: 打开浏览器
    console.log('🌐 打开浏览器...');
    openBrowser();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 就绪！请使用图形界面操作');
    console.log('💡 提示：关闭浏览器后服务会自动停止');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    showFallbackInstructions();
    process.exit(1);
  }
}

// 检测 Node.js
async function detectNodeJS() {
  console.log('📦 检测 Node.js...');
  
  // 1. 先检查系统 PATH 中是否有 node
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    console.log(`  ✓ 系统已安装 Node.js: ${version}`);
    
    // 验证版本（需要 >= 18）
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
      console.log(`  ⚠️  版本过低 (${version})，需要 v18+`);
      console.log('  📥 将下载便携版 Node.js v20...\n');
      return await downloadPortableNode();
    }
    
    return 'node'; // 使用系统的 node
    
  } catch (error) {
    console.log('  ✗ 系统未安装 Node.js');
    console.log('  📥 将下载便携版 Node.js v20...\n');
    return await downloadPortableNode();
  }
}

// 安装依赖
async function installDependencies(nodePath) {
  console.log('📦 检查依赖...');
  
  // 检查 node_modules 是否存在
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const expressPath = path.join(nodeModulesPath, 'express');
  
  if (fs.existsSync(expressPath)) {
    console.log('  ✓ 依赖已安装\n');
    return;
  }
  
  console.log('  📥 正在安装依赖到 node_modules/...');
  console.log('     这只需要执行一次，请稍候...\n');
  
  return new Promise((resolve, reject) => {
    const npmCommand = nodePath === 'node' ? 'npm' : `"${path.join(path.dirname(nodePath), 'npm.cmd')}"`;
    
    const installProcess = spawn(npmCommand, ['install'], {
      stdio: 'inherit',
      shell: true
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('  ✓ 依赖安装完成\n');
        resolve();
      } else {
        reject(new Error(`依赖安装失败 (退出码：${code})`));
      }
    });
    
    installProcess.on('error', reject);
  });
}

// 下载便携版 Node.js
async function downloadPortableNode() {
  // 检查是否已下载
  if (fs.existsSync(NODE_EXE)) {
    console.log('  ✓ 便携版 Node.js 已存在');
    return NODE_EXE;
  }
  
  // 创建目录
  if (!fs.existsSync(PORTABLE_NODE_DIR)) {
    fs.mkdirSync(PORTABLE_NODE_DIR, { recursive: true });
  }
  
  // 下载 ZIP
  const zipPath = path.join(PORTABLE_NODE_DIR, 'node.zip');
  
  return new Promise((resolve, reject) => {
    console.log('  📥 正在下载便携版 Node.js...');
    console.log(`     位置：${PORTABLE_NODE_DIR}`);
    console.log('     大小：约 85 MB');
    console.log('     这只需要执行一次，请稍候...\n');
    
    const file = fs.createWriteStream(zipPath);
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastProgress = 0;
    
    https.get(PORTABLE_NODE_URL, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        https.get(response.headers.location, handleResponse).on('error', reject);
        return;
      }
      handleResponse(response);
    }).on('error', reject);
    
    function handleResponse(response) {
      totalBytes = parseInt(response.headers['content-length'], 10);
      
      response.pipe(file);
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const percent = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : 0;
        
        // 每 10% 显示一次进度
        const progressBucket = Math.floor(parseFloat(percent) / 10);
        if (progressBucket > lastProgress) {
          process.stdout.write(`\r     下载进度：${percent}% (${formatBytes(downloadedBytes)}/${formatBytes(totalBytes)})   `);
          lastProgress = progressBucket;
        }
      });
      
      file.on('finish', () => {
        file.close();
        console.log('\n     ✓ 下载完成');
        
        // 解压 ZIP
        console.log('     📦 正在解压...');
        extractZip(zipPath, PORTABLE_NODE_DIR, () => {
          // 删除 ZIP
          try {
            fs.unlinkSync(zipPath);
          } catch (e) {
            // 忽略删除失败
          }
          console.log('     ✓ 解压完成');
          resolve(NODE_EXE);
        });
      });
    }
  });
}

// 解压 ZIP 文件
function extractZip(zipPath, destDir, callback) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows: 使用 PowerShell
    const command = `powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`;
    exec(command, (error) => {
      if (error) {
        console.error('     ⚠️  解压失败:', error.message);
        callback();
      } else {
        callback();
      }
    });
  } else {
    // macOS/Linux: 使用 unzip
    const command = `unzip -o '${zipPath}' -d '${destDir}'`;
    exec(command, (error) => {
      if (error) {
        console.error('     ⚠️  解压失败:', error.message);
        callback();
      } else {
        callback();
      }
    });
  }
}

// 检查服务是否运行
async function checkServiceRunning() {
  try {
    const response = await fetch(`http://localhost:${PORT}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// 启动服务
function startService(nodePath) {
  return new Promise((resolve, reject) => {
    console.log('     启动命令:', nodePath, SERVER_JS);
    
    const serverProcess = spawn(nodePath, [SERVER_JS], {
      detached: false,
      stdio: 'inherit'
    });
    
    serverProcess.on('close', (code) => {
      console.log(`\n服务已退出 (代码：${code})`);
      process.exit(code);
    });
    
    serverProcess.on('error', (err) => {
      reject(err);
    });
    
    // 等待服务启动
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

// 打开浏览器
function openBrowser() {
  const platform = os.platform();
  let command;
  
  if (platform === 'win32') {
    command = `start "" "${HTML_FILE}"`;
  } else if (platform === 'darwin') {
    command = `open "${HTML_FILE}"`;
  } else {
    command = `xdg-open "${HTML_FILE}"`;
  }
  
  exec(command, (err) => {
    if (err) console.error('打开浏览器失败:', err);
  });
}

// 显示备用说明
function showFallbackInstructions() {
  console.log('\n请尝试以下解决方案:\n');
  console.log('方案 1: 手动安装 Node.js');
  console.log('  访问：https://nodejs.org/');
  console.log('  下载并安装 LTS 版本\n');
  
  console.log('方案 2: 检查网络连接');
  console.log('  便携版 Node.js 需要下载，请确保网络畅通\n');
  
  console.log('方案 3: 手动启动');
  console.log('  1. 安装 Node.js 后');
  console.log('  2. 在项目文件夹运行：npm install');
  console.log('  3. 运行：node server.js');
  console.log('  4. 双击打开：InkOS-Studio.html\n');
}

// 辅助函数
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 运行主程序
main().catch(err => {
  console.error('\n❌ 致命错误:', err.message);
  console.error(err.stack);
  process.exit(1);
});
