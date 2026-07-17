# 博客重构迁移项目规范 (SvelteKit -> Next.js)

**注意：在进行任何代码修改前，你必须优先阅读项目根目录下的 `AGENTS.md` 文件，并绝对遵守其中的工作流和行为准则。**

## 1. 极致性能与前沿架构 (Next.js 基准)
- **核心框架**: Next.js 最新版 (严格使用 App Router)。
- **渲染架构**: 全面拥抱 React Server Components (RSC)。默认全为 Server Component，实现客户端 JS 零打包体积。仅在极致末端的叶子节点组件才使用 `"use client"`。
- **动静结合**: 启用 Partial Prerendering (PPR) 和 Streaming 规范，通过 `<Suspense>` 隔离动态组件，确保 TTFB 极小化。
- **数据与内容层**: 弃用 mdsvex，采用强类型内容架构（如 `Velite` / `next-mdx-remote`），在构建时完成 AST 转换与元数据提取。
- **边缘计算**: 废弃 Cloudflare Views Worker，全面迁移至 Next.js Edge Runtime / Server Actions。

## 2. Karpathy 编码心法 (代码质量与风格)
- **极简主义 (KISS)**: 避免过度工程、过早抽象和无意义的 boilerplate。写直白、可读、简单的代码，而不是“聪明”的代码。
- **精准干预 (Surgical Edits)**: 只修改实现当前需求所必须的代码。**严禁**重构、格式化或调整与当前任务无关的正常代码。
- **高价值注释 (High-Value Comments)**: 让代码本身解释“What”，注释只用来解释“Why”（为什么要这么做、绕过了什么坑、特殊的业务逻辑）。
- **拥抱原生 (No Inventing)**: 极限压榨 Next.js 内置组件（`next/image`, `next/link`, `next/font`, Metadata API），绝对不要重复造轮子。

## 3. Git 提交规范 (Strict Conventional Commits)
- `feat: ` - 新增业务功能
- `fix: ` - 修复 Bug、逻辑异常
- `refactor: ` - 代码重构，无新增功能
- `style: ` - 代码格式调整，不影响业务逻辑
- `perf: ` - 性能优化
- `chore: ` - 构建配置、依赖项更新
- `test: ` - 单元测试
- `docs: ` - 文档、说明变更
- `friend-link: ` - 新增 / 更新好友链接

## 4. 常用命令 (供 AI 执行)
- 运行开发环境: `npm run dev` / `pnpm dev`
- 构建生产包: `npm run build` / `pnpm build`
- 运行检查: `npm run lint` / `pnpm lint`