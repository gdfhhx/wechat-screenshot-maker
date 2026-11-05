# 微信聊天截图生成器

一个基于 Electron 的桌面工具，用于生成自定义的微信风格聊天记录截图。

## 功能

- **私聊 / 群聊** 两种会话模式
- **对方 + 自己** 的左右聊天气泡
- **群聊** 支持多成员昵称显示（气泡上方）+ 标题栏人数
- **顶部细节**：状态栏（信号 / 时间 / 电量）、标题栏（昵称 / 返回 / 更多菜单）
- **自定义**：每条消息的昵称、头像颜色、文字内容，可增删
- **导出**：保存为 PNG / JPG，或复制到剪贴板

## 使用方法

### 直接运行（需 Node.js 环境）

```bash
npm install
npm start
```

### 打包成 Windows EXE

在 Windows 机器上执行：

```bash
npm install
npm run dist:win
```

生成的安装包在 `dist/` 目录下（`微信聊天截图生成器 Setup 1.0.0.exe`）。

### 通过 GitHub Actions 自动打包

推送到仓库或手动触发 `Build Windows EXE` 工作流，产物会作为 Artifact 下载（`wechat-screenshot-win64`）。

## 项目结构

```
wechat-screenshot/
├── main.js              # Electron 主进程（窗口 + 保存/复制 IPC）
├── preload.js           # 安全桥接（contextBridge）
├── renderer/
│   ├── index.html       # 界面结构（左控制面板 + 右手机预览）
│   ├── style.css        # 微信风格样式
│   ├── renderer.js      # 交互逻辑（消息编辑 + 导出）
│   └── html-to-image.js # 截图渲染库（UMD，本地化）
├── package.json
└── .github/workflows/build.yml  # Windows 打包流水线
```
