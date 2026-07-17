import { siteConfig } from '@/lib/config/site';
import WatermarkClient from './WatermarkClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `图片水印 - ${siteConfig.title}`,
  description: '在线图片添加水印工具，支持文字水印和图片水印，支持多种水印方案同时添加'
};

export default function WatermarkPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <WatermarkClient />
      </div>
    </div>
  );
}
