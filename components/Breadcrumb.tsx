'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { siteConfig } from '@/lib/config/site';

type BreadcrumbItem = {
  label: string;
  href: string;
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // 首页不显示面包屑
  if (pathname === '/') {
    return null;
  }

  const items: BreadcrumbItem[] = [];

  // 解析路径
  const segments = pathname.split('/').filter(Boolean);

  // 构建面包屑
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // 处理特殊路由
    if (segment === 'blog') {
      items.push({ label: '博客', href: currentPath });
    } else if (segment === 'posts') {
      items.push({ label: '文章', href: currentPath });
    } else if (segment === 'cover') {
      items.push({ label: '封面制作', href: currentPath });
    } else if (segment === 'convert') {
      items.push({ label: '格式转换', href: currentPath });
    } else if (segment === 'watermark') {
      items.push({ label: '水印', href: currentPath });
    } else if (segment === 'friends') {
      items.push({ label: '友链', href: currentPath });
    } else if (index === segments.length - 1 && segments[index - 1] === 'posts') {
      // 文章详情页 - 使用slug作为标签
      items.push({ label: segment, href: currentPath });
    }
  });

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <nav className="flex items-center gap-2 text-sm">
          {/* 头像/首页链接 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <img
              src={siteConfig.bio.avatar}
              alt="头像"
              className="h-6 w-6 rounded-full object-cover"
            />
          </Link>

          {/* 面包屑项 */}
          {items.map((item, index) => (
            <div key={item.href} className="flex items-center gap-2">
              <Icon icon="mdi:chevron-right" className="size-4 text-muted-foreground" />
              <Link
                href={item.href}
                className={`transition-colors hover:text-foreground ${
                  index === items.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
