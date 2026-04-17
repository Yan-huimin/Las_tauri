# LAS 点云可视化工具

一个基于 Tauri 开发的桌面应用程序，用于可视化、处理和分析 LAS 格式的点云数据。提供完整的点云处理流程，包括加载、可视化、预处理、分析和测量功能。

![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)

## ✨ 功能特性

### 核心功能
- **LAS 文件加载** - 支持标准的 LAS 点云文件格式，自动解析点云属性和元数据
- **点云可视化** - 3D 点云实时渲染和交互，支持旋转、缩放、平移操作
- **数据预处理** - 自动体素下采样和噪声滤波，保持数据质量
- **空间分析** - 点云边界框、统计信息计算，高程分布可视化

### 高级处理算法
- **体素下采样 (Voxel Downsampling)** - 使用体素网格均匀采样，保持点云空间分布
- **统计离群点移除 (SOR Filter)** - 基于 K 近邻统计的噪声点检测和移除，支持可调参数
- **并行处理** - 利用 Rayon 并行库加速大规模点云处理，支持多线程计算
- **K-d 树索引** - 使用 Kiddo 库构建空间索引，加速邻居搜索

### 测量与分析工具
- **点云测量** - 三维距离测量工具，支持欧几里得距离、水平距离和高程差计算
- **数据对比** - 原始数据与处理后数据的实时对比，显示点减少百分比
- **高程分析** - Z 轴分布可视化，颜色编码的高程直方图
- **坐标转换** - 原始坐标与显示坐标的实时转换

### 用户界面
- **响应式布局** - 自适应窗口大小的仪表板布局，多面板协同工作
- **深色/浅色主题** - 支持系统主题和手动切换，护眼模式
- **实时日志系统** - 处理进度和状态实时显示，操作历史追踪
- **文件历史记录** - 最近打开文件快速访问，支持文件管理
- **测量面板** - 独立的测量工具界面，清晰的测量结果显示

## 🛠 技术栈

### 前端 (UI)
- **React 19** - 用户界面框架，支持最新特性
- **TypeScript 5.9** - 类型安全的 JavaScript 超集
- **Tailwind CSS 4** - 实用优先的 CSS 框架，原子化样式
- **Zustand** - 轻量级状态管理库
- **Three.js** - 3D 图形渲染库，点云可视化核心
- **Recharts** - 数据可视化图表库，用于高程分布显示
- **Lucide React** - 图标库，提供现代化图标

### 后端 (核心)
- **Rust 1.77+** - 系统级编程语言，高性能计算
- **Tauri 2.10** - 跨平台桌面应用框架，安全的本地应用
- **LAS 库 0.9.11** - LAS 文件解析和操作，支持标准格式
- **Kiddo 5.3** - K-d 树空间索引库，加速空间查询
- **Rayon 1.10** - 数据并行处理库，多线程计算
- **Chrono** - 日期和时间处理库
- **Indicatif** - 进度条和进度显示

### 开发工具
- **Vite 7.3** - 快速构建工具，开发服务器
- **ESLint** - 代码质量检查
- **Tauri CLI** - Tauri 应用开发命令行工具

## 📦 安装与运行

### 环境要求
- **Node.js 18+** 和 npm/yarn/pnpm
- **Rust 1.77+** 和 Cargo (需要正确配置 Rust 工具链)
- **Tauri CLI**: `npm install -g @tauri-apps/cli`
- **平台相关工具链**: Windows 需要 Visual Studio Build Tools, macOS 需要 Xcode Command Line Tools, Linux 需要基础开发工具

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
   - Tauri 桌面应用程序 (带开发工具)

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

### 快速开始
```bash
# 1. 安装依赖
npm install

# 2. 启动开发模式
npm run dev

# 3. 加载 LAS 文件开始使用
```

## 🚀 使用方法

### 基本工作流程
1. **启动应用程序** - 运行 `npm run dev` 或打开构建好的可执行文件
2. **加载 LAS 文件** - 点击 "New File" 按钮选择 LAS 文件
3. **查看点云信息** - 应用程序自动显示点云的边界框、点数量和高程分布
4. **可视化点云** - 切换到 "View" 页面查看 3D 点云渲染
5. **处理数据** - 使用降采样和去噪功能处理点云数据
6. **分析结果** - 查看处理前后的数据对比和测量结果

### 数据处理功能
1. **原始点云加载** - 读取 LAS 文件的所有点，显示基本信息
2. **高程分析** - 自动生成 Z 轴分布直方图，颜色编码显示
3. **体素下采样** - 减少点密度，提高处理效率，保持空间分布
4. **统计滤波 (SOR)** - 移除离群噪声点，基于 K 近邻统计
5. **数据对比** - 实时对比原始和处理后数据，显示点减少百分比

### 测量工具使用
1. **启动测量模式** - 在 View 页面点击"开始测量"按钮
2. **选择测量点** - 在点云上点击选择两个测量点
3. **查看测量结果** - 自动计算并显示：
   - 三维欧几里得距离
   - 水平距离 (XY 平面)
   - 高程差 (Z 轴)
   - 原始坐标和显示坐标

### 高级功能
- **坐标转换** - 自动处理原始坐标和显示坐标的转换
- **实时日志** - 查看处理进度和状态信息
- **主题切换** - 深色/浅色模式切换
- **文件历史** - 快速访问最近打开的文件

### 快捷键
- `F12` / `Ctrl+Shift+I` - 打开开发者工具 (开发模式)
- 右键菜单 - 已禁用以防止干扰点云操作

## 📁 项目结构

```
demo_las/
├── src/                          # 前端 React 代码
│   ├── components/              # React 组件
│   │   ├── base/               # 基础 UI 组件 (容器、导航栏等)
│   │   ├── home/               # 主页相关组件
│   │   │   ├── file/          # 文件操作组件
│   │   │   ├── history/       # 历史记录组件
│   │   │   ├── show/          # 数据显示组件
│   │   │   └── lasdata/       # LAS 数据分析组件 (Z 轴图表等)
│   │   ├── settings/           # 设置相关组件
│   │   └── viewer/             # 3D 查看器组件 (测量面板、工具栏等)
│   ├── hooks/                  # 自定义 React Hooks
│   │   ├── base/              # 基础 hooks
│   │   ├── home/              # 主页相关 hooks
│   │   ├── settings/          # 设置相关 hooks
│   │   └── viewer/            # 查看器相关 hooks
│   ├── pages/                  # 页面组件
│   │   ├── home.tsx           # 主页
│   │   ├── view.tsx           # 3D 查看页面
│   │   ├── logs.tsx           # 日志页面
│   │   ├── settings.tsx       # 设置页面
│   │   └── layout.tsx         # 应用布局
│   ├── store/                  # Zustand 状态管理
│   │   ├── useFileStore.ts    # 文件状态管理
│   │   └── useLasStore.ts     # LAS 数据状态管理
│   ├── types/                  # TypeScript 类型定义
│   │   └── las.types.ts       # LAS 相关类型
│   ├── utils/                  # 工具函数
│   │   ├── coordinates.ts     # 坐标转换工具
│   │   ├── threeHelper.ts     # Three.js 工具函数
│   │   ├── themeBtn.tsx       # 主题切换组件
│   │   └── info.tsx           # 信息显示组件
│   ├── App.tsx                # 应用根组件
│   └── main.tsx               # 应用入口
├── src-tauri/                  # Rust 后端代码
│   ├── src/                   # Rust 源文件
│   │   ├── main.rs           # 应用程序入口
│   │   ├── lib.rs            # Tauri 命令注册
│   │   ├── logger.rs         # 日志系统实现
│   │   ├── process.rs        # 文件处理逻辑
│   │   ├── data.rs           # 数据结构定义
│   │   └── laslib.rs         # LAS 处理核心逻辑 (下采样、去噪等)
│   ├── Cargo.toml            # Rust 依赖配置
│   └── tauri.conf.json       # Tauri 应用配置
├── public/                    # 静态资源
├── package.json              # Node.js 依赖和脚本
├── vite.config.ts            # Vite 构建配置
├── tailwind.config.ts        # Tailwind CSS 配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明文档
```

## 🔧 开发指南

### 添加新的 Tauri 命令
1. 在 `src-tauri/src/lib.rs` 中导入模块
2. 在 `src-tauri/src/` 下创建新的 Rust 模块
3. 使用 `#[tauri::command]` 宏定义命令
4. 在 `generate_handler![]` 中注册命令
5. 在前端使用 `invoke()` 调用命令

### 添加新的点云处理算法
1. 在 `src-tauri/src/laslib.rs` 中添加新的函数
2. 使用 `#[tauri::command]` 宏标注函数
3. 确保正确处理点云数据结构和 offset
4. 使用 Rayon 进行并行处理以提高性能
5. 通过 `window.emit("log-event", ...)` 发送进度信息

### 添加新的 UI 组件
1. 在 `src/components/` 下创建组件目录
2. 使用 TypeScript 和 Tailwind CSS 编写组件
3. 在相关页面中导入和使用组件
4. 使用 Zustand 进行状态管理

### 添加测量功能
1. 坐标处理：使用 `src/utils/coordinates.ts` 中的工具函数
2. 状态管理：在 `useLasStore` 中添加测量相关状态
3. 3D 交互：在 `LasViewer` 组件中处理点击事件
4. 结果显示：创建专门的测量面板组件

### 调试
- **前端日志**: 浏览器开发者工具，查看组件状态和网络请求
- **后端日志**: Tauri 控制台输出，查看 Rust 处理进度
- **Rust 调试**: 使用 `println!` 或日志宏，查看 `cargo run` 输出
- **性能分析**: 使用浏览器 Performance 工具分析 3D 渲染性能

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
- **并行计算**: 使用 Rayon 进行多线程并行处理，加速体素标记和质心计算
- **空间索引**: 使用 K-d 树 (Kiddo) 加速邻居搜索，优化 SOR 滤波性能
- **内存管理**: 分块处理大规模点云，及时释放未使用内存
- **渐进处理**: 大文件分步处理，实时进度反馈，避免界面卡顿
- **算法优化**: 优化的体素下采样算法，减少内存占用和提高速度

### 前端优化
- **Three.js 优化**: 使用 BufferGeometry 和 InstancedMesh 高效渲染点云
- **状态管理**: 使用 Zustand 进行精确的状态更新和订阅，避免不必要的重渲染
- **组件懒加载**: 按需加载页面和组件，减少初始包大小
- **React.memo**: 对纯展示组件使用 memo 优化，避免重复渲染
- **虚拟化**: 大数据列表的虚拟化渲染，提高列表性能

### 测量工具优化
- **坐标缓存**: 缓存转换后的坐标，减少重复计算
- **事件委托**: 使用事件委托处理点云点击，提高交互性能
- **增量更新**: 测量结果增量更新，避免全量重计算

### 内存优化
- **数据分块**: 大规模点云数据分块加载和处理
- **及时清理**: 处理完成后及时清理中间数据
- **引用计数**: 合理管理数据引用，避免内存泄漏

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 开发流程
1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 代码规范
- **TypeScript**: 使用严格类型检查，遵循 ESLint 规则
- **Rust**: 遵循 Rust 代码风格指南，使用 `cargo fmt` 格式化
- **React 组件**: 使用函数组件和 Hooks，避免 Class 组件
- **状态管理**: 使用 Zustand 进行状态管理，保持状态逻辑清晰
- **提交信息**: 使用清晰的英文描述，说明改动内容和原因
- **文档**: 更新相关文档和注释，特别是新增功能的说明

### 测试要求
- **功能测试**: 新增功能需要包含基本的功能测试
- **性能测试**: 涉及性能优化的改动需要提供性能对比数据
- **兼容性测试**: 确保改动不影响现有功能

## 📄 许可证

本项目目前未指定许可证。如需使用，请与项目所有者联系。

## 🙏 致谢

- [Tauri](https://tauri.app/) - 提供优秀的跨平台桌面应用框架
- [LAS 库](https://docs.rs/las/latest/las/) - Rust 的 LAS 文件处理库
- [Three.js](https://threejs.org/) - 3D 图形渲染库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Kiddo](https://crates.io/crates/kiddo) - K-d 树空间索引库
- [Rayon](https://crates.io/crates/rayon) - 数据并行处理库
- [Recharts](https://recharts.org/) - React 图表库
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理库
- [Lucide Icons](https://lucide.dev/) - 图标库

## 📞 联系与支持

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 查看项目文档和代码注释

---

**Happy Point Cloud Processing! 🚀**

