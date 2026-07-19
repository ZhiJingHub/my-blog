import { friends } from "@/.velite"

export type FriendLink = (typeof friends)[number]

// velite 在构建时将 JSON 文件打包为类型安全的数据集合
export function getAllFriends(): FriendLink[] {
  return [...friends].sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
}
