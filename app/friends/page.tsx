import { siteConfig } from '@/lib/config/site';
import { getAllFriends } from '@/lib/utils/friends';
import FriendsClient from './FriendsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `友链 - ${siteConfig.title}`,
  description: '友情链接页面，展示我的朋友们和他们的博客站点',
  openGraph: {
    title: `友链 - ${siteConfig.title}`,
    description: '友情链接页面，展示我的朋友们和他们的博客站点'
  }
};

export default function FriendsPage() {
  const friends = getAllFriends();

  return <FriendsClient friends={friends} />;
}
