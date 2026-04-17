# LAS 点云可视化工具

一个基于 Tauri 开发的桌面应用程序，用于可视化、处理和分析 LAS 格式的点云数据。

![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ 功能特性

### 核心功能
- **LAS 文件加载** - 支持标准的 LAS 点云文件格式
- **点云可视化** - 3D 点云实时渲染和交互
- **数据预处理** - 自动体素下采样和噪声滤波
- **空间分析** - 点云边界框、统计信息计算

### 处理算法
- **体素下采样 (Voxel Downsampling)** - 使用体素网格均匀采样，保持点云空间分布
- **统计离群点移除 (SOR Filter)** - 基于 K 近邻统计的噪声点检测和移除
- **并行处理** - 利用 Rayon 并行库加速大规模点云处理

### 用户界面
- **响应式布局** - 自适应窗口大小的仪表板布局
- **深色/浅色主题** - 支持系统主题和手动切换
- **实时日志系统** - 处理进度和状态实时显示
- **文件历史记录** - 最近打开文件快速访问

## 🛠 技术栈

### 前端 (UI)
- **React 19** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Zustand** - 状态管理库
- **Three.js** - 3D 图形渲染库
- **Recharts** - 数据可视化图表库

### 后端 (核心)
- **Rust** - 系统级编程语言
- **Tauri 2** - 跨平台桌面应用框架
- **LAS 库** - LAS 文件解析和操作
- **Kiddo** - K-d 树空间索引库
- **Rayon** - 数据并行处理库

## 📦 安装与运行

### 环境要求
- **Node.js** 18+ 和 npm/yarn/pnpm
- **Rust** 1.77+ 和 Cargo
- **Tauri CLI**: `npm install -g @tauri-apps/cli`

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd demo_las
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式运行**
   ```bash
   npm run dev
   ```
   这将同时启动：
   - 前端开发服务器 (http://localhost:5173)
   - Tauri 桌面应用程序

4. **构建应用程序**
   ```bash
   npm run build
   ```

5. **平台特定构建**
   ```bash
   # Windows (x64)
   npm run dist:win
   
   # macOS (Apple Silicon)
   npm run dist:mac
   
   # Linux (x64)
   npm run dist:linux
   ```

## 🚀 使用方法

### 基本工作流程
1. **启动应用程序** - 运行 `npm run dev` 或打开构建好的可执行文件
2. **加载 LAS 文件** - 点击 "New File" 按钮选择 LAS 文件
3. **查看点云信息** - 应用程序自动显示点云的边界框和点数量
4. **可视化点云** - 切换到 "View" 页面查看 3D 点云渲染
5. **处理数据** - 自动执行体素下采样和噪声滤波处理

### 数据处理流程
1. **原始点云加载** - 读取 LAS 文件的所有点
2. **体素下采样** - 减少点密度，提高处理效率
3. **统计滤波** - 移除离群噪声点
4. **结果可视化** - 显示处理后的点云

### 快捷键
- `F12` / `Ctrl+Shift+I` - 打开开发者工具 (开发模式)
- 右键菜单 - 已禁用以防止干扰操作

## 📁 项目结构

```
demo_las/
├── src/                    # 前端 React 代码
│   ├── components/        # React 组件
│   │   ├── base/         # 基础 UI 组件
│   │   ├── home/         # 主页组件
│   │   ├── settings/     # 设置组件
│   │   └── ...
│   ├── hooks/            # 自定义 React Hooks
│   ├── pages/            # 页面组件
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   └── ...
├── src-tauri/            # Rust 后端代码
│   ├── src/             # Rust 源文件
│   │   ├── main.rs      # 应用程序入口
│   │   ├── lib.rs       # Tauri 命令注册
│   │   ├── logger.rs    # 日志系统实现
│   │   └── ylib.rs      # LAS 处理核心逻辑
│   ├── Cargo.toml       # Rust 依赖配置
│   └── tauri.conf.json  # Tauri 应用配置
├── public/              # 静态资源
├── package.json         # Node.js 依赖和脚本
├── vite.config.ts       # Vite 构建配置
├── tailwind.config.ts   # Tailwind CSS 配置
└── ...
```

## 🔧 开发指南

### 添加新的 Tauri 命令
1. 在 `src-tauri/src/lib.rs` 中导入模块
2. 在 `src-tauri/src/` 下创建新的 Rust 模块
3. 使用 `#[tauri::command]` 宏定义命令
4. 在 `generate_handler![]` 中注册命令
5. 在前端使用 `invoke()` 调用命令

### 添加新的 UI 组件
1. 在 `src/components/` 下创建组件目录
2. 使用 TypeScript 和 Tailwind CSS 编写组件
3. 在相关页面中导入和使用组件

### 调试
- **前端日志**: 浏览器开发者工具
- **后端日志**: Tauri 控制台输出
- **Rust 调试**: 使用 `println!` 或日志宏

## 🏗️ 构建与发布

### 开发构建
```bash
npm run build
```

### 生产构建（各平台）
```bash
# Windows
npm run dist:win

# macOS (Apple Silicon)
npm run dist:mac

# Linux
npm run dist:linux
```

### 构建配置
构建配置位于 `src-tauri/tauri.conf.json`:
- **窗口设置**: 1280×800 最小尺寸，可调整大小
- **应用标识**: `com.yhm.dev`
- **图标**: 多分辨率应用图标
- **安全策略**: 自定义 CSP 配置

## 📊 性能优化

### 点云处理优化
- **并行计算**: 使用 Rayon 进行多线程并行处理
- **空间索引**: 使用 K-d 树加速邻居搜索
- **内存管理**: 限制日志条数，防止内存泄漏
- **渐进处理**: 大文件分步处理，实时进度反馈

### 前端优化
- **虚拟滚动**: 大数据列表的虚拟化渲染
- **React.memo**: 组件性能优化
- **懒加载**: 按需加载组件和资源
- **状态管理**: 精确的状态更新和订阅

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 开发流程
1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 代码规范
- TypeScript: 使用严格类型检查
- Rust: 遵循 Rust 代码风格指南
- 提交信息: 使用清晰的英文描述
- 文档: 更新相关文档和注释

## 📄 许可证

本项目目前未指定许可证。如需使用，请与项目所有者联系。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 提供优秀的跨平台桌面应用框架
- [LAS 库](https://docs.rs/las/latest/las/) - Rust 的 LAS 文件处理库
- [Three.js](https://threejs.org/) - 3D 图形渲染库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📞 联系与支持

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 查看项目文档和代码注释

---

**Happy Point Cloud Processing! 🚀**

