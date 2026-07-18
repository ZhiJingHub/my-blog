import { siteConfig } from '@/lib/config/site';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

const ConvertClient = dynamic(() => import('./ConvertClient'), {
  loading: () => <div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>,
});

export const metadata: Metadata = {
  title: `图片格式转换 - ${siteConfig.title}`,
  description: '在线图片格式转换工具，支持 PNG、JPG、WebP、AVIF、BMP、GIF、SVG 格式相互转换，支持批量转换、旋转翻转、压缩预设'
};

export default function ConvertPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <ConvertClient />
      </div>
    </div>
  );
}
