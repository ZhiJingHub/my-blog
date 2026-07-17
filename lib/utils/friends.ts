import fs from 'fs';
import path from 'path';
import type { FriendLink } from '@/lib/types/friend';

export function getAllFriends(): FriendLink[] {
  const friendsDir = path.join(process.cwd(), 'data', 'friends');

  if (!fs.existsSync(friendsDir)) {
    return [];
  }

  const files = fs.readdirSync(friendsDir).filter((file) => file.endsWith('.json'));

  const friends: FriendLink[] = files.map((file) => {
    const filePath = path.join(friendsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as FriendLink;
  });

  return friends.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}
