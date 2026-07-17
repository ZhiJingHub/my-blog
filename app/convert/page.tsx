import { siteConfig } from '@/lib/config/site';
import ConvertClient from './ConvertClient';
import type { Metadata } from 'next';

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
