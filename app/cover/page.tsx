import { siteConfig } from '@/lib/config/site';
import CoverGenerator from './components/CoverGenerator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `封面制作 - ${siteConfig.title}`,
  description: '在线封面图制作工具，支持自定义文本、图标、背景和多种导出格式',
  openGraph: {
    title: `封面制作 - ${siteConfig.title}`,
    description: '在线封面图制作工具，支持自定义文本、图标、背景和多种导出格式'
  }
};

export default function CoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            ← 返回首页
          </a>
        </div>
        <CoverGenerator />
      </div>
    </div>
  );
}
