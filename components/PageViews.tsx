'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { siteConfig } from '@/lib/config/site';

type PageViewsProps = {
  pathname: string;
  className?: string;
};

export default function PageViews({ pathname, className = '' }: PageViewsProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!siteConfig.analytics.umami.websiteId || !siteConfig.viewsApi) return;

    const fetchViews = async () => {
      try {
        const response = await fetch(siteConfig.viewsApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: [pathname] })
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setViews(data[0] || 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch page views:', error);
      }
    };

    fetchViews();
  }, [pathname]);

  if (views === null) {
    return null;
  }

  return (
    <span className={className}>
      <Icon icon="mdi:eye-outline" className="size-3.5" />
      {views.toLocaleString()}
    </span>
  );
}
