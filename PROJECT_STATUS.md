# 博客迁移项目阶段性报告

## 项目概述
本项目是从 SvelteKit 迁移到 Next.js 的博客系统重构项目。目前已完成大部分功能迁移，博客核心功能待后续实现。

## 技术栈
- **框架**: Next.js 16.2.10 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **图标**: Iconify
- **分析**: Umami (自托管)
- **部署**: 准备部署到 Vercel/GitHub Pages

## 已完成功能

### 1. 基础架构
- ✅ Next.js App Router 项目结构
- ✅ 主题系统（亮色/暗色/跟随系统）
- ✅ Umami 网站分析集成
- ✅ 圆形头像 favicon
- ✅ 面包屑导航组件

### 2. 主页
- ✅ 头像展示
- ✅ 社交链接卡片（GitHub、Telegram、邮箱）
- ✅ 导航按钮卡片
- ✅ 响应式设计

### 3. 工具页面
- ✅ 封面制作 (/cover) - 完整功能
- ✅ 格式转换 (/convert) - 完整功能
- ✅ 水印 (/watermark) - 完整功能
- ✅ 友链 (/friends) - 完整功能，支持 GitHub 自动申请

### 4. SEO
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ rss.xml
- ✅ Open Graph 元数据

### 5. GitHub 集成
- ✅ 自动友链申请工作流
- ✅ Issue 模板

### 6. 路由结构
- ✅ /blog - 博客列表页（占位）
- ✅ /blog/posts/[slug] - 博客文章详情页（占位）

## 项目结构
```
my-blog/
├── app/
│   ├── layout.tsx          # 根布局，包含 Umami 和面包屑
│   ├── page.tsx            # 主页
│   ├── blog/
│   │   ├── page.tsx        # 博客列表（待实现）
│   │   └── posts/[slug]/
│   │       └── page.tsx    # 文章详情（待实现）
│   ├── cover/              # 封面制作
│   ├── convert/            # 格式转换
│   ├── watermark/          # 水印
│   ├── friends/            # 友链
│   └── [sitemap.xml|rss.xml|robots.txt]
├── components/
│   ├── theme-provider.tsx  # 主题提供者
│   ├── Breadcrumb.tsx      # 面包屑导航
│   └── ui/                 # shadcn UI 组件
├── lib/
│   ├── config/site.ts      # 站点配置
│   ├── utils/              # 工具函数
│   └── types/              # TypeScript 类型
├── public/
│   └── favicon.svg         # 圆形头像 favicon
├── data/friends/           # 友链 JSON 数据
└── .github/
    └── workflows/auto-friend-link.yml
```

## 配置文件说明

### lib/config/site.ts
包含所有站点配置：
- 基本信息（标题、描述、URL）
- Umami 分析配置
- 社交链接
- 导航链接
- 友链申请链接

### components/Breadcrumb.tsx
面包屑导航组件，自动根据路由生成导航路径：
- 首页不显示面包屑
- 使用博客头像作为第一个元素
- 支持动态路由（如 /blog/posts/[slug]）

## 待实现功能

### 博客系统（优先级高）
路由已创建，需要实现核心功能：
1. **文章列表页** (`/blog`)
   - 从 `content/posts/` 读取 Markdown 文件
   - 支持标签、日期、封面图
   - 卡片式布局

2. **文章详情页** (`/blog/posts/[slug]`)
   - Markdown 渲染（使用 next-mdx-remote）
   - 代码高亮
   - 目录生成
   - 阅读时间统计

3. **内容管理**
   - 使用 frontmatter 存储元数据
   - 支持草稿模式
   - 支持置顶文章

### 可能的后续优化
- 搜索功能
- 文章分页
- 评论区集成（Giscus）
- 暗色模式优化
- 性能优化（ISR/SSG）

## 开发规范

### Git 提交规范
- `feat:` - 新增功能
- `fix:` - 修复 Bug
- `refactor:` - 重构代码
- `style:` - 样式调整
- `chore:` - 配置/依赖更新
- `docs:` - 文档更新

### 代码风格
- 使用 TypeScript
- 使用 Server Components 优先
- 客户端组件使用 `"use client"` 指令
- 遵循 Next.js 最佳实践

## 注意事项

1. **博客核心代码未实现**
   - 路由结构已创建
   - 需要自行实现 Markdown 解析和渲染
   - 建议使用 `gray-matter` 和 `next-mdx-remote`

2. **Umami 配置**
   - 地址: u.iwexe.top
   - 网站 ID: 6eda9065-3954-4f1f-8dee-5729460f3e92

3. **友链系统**
   - 数据存储在 `data/friends/*.json`
   - 支持 GitHub Issue 自动申请
   - 需要配置 GitHub Actions

4. **favicon**
   - 使用 SVG 格式
   - 圆形头像设计
   - 通过 Next.js metadata API 配置

## 命令参考

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 生产运行
pnpm start

# 代码检查
pnpm lint
```

## 部署

项目准备部署到 Vercel 或 GitHub Pages，所有页面都已优化为静态生成。

---

**报告生成时间**: 2026-07-17
**项目状态**: 阶段性完成，博客核心待实现
