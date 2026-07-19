'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Icon } from '@iconify/react';
import { siteConfig } from '@/lib/config/site';
import type { FriendLink } from '@/lib/utils/friends';

type FriendsClientProps = {
  friends: FriendLink[];
};

const ITEMS_PER_PAGE = 12;

export default function FriendsClient({ friends }: FriendsClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const totalPages = Math.ceil(friends.length / ITEMS_PER_PAGE);
  const paginatedFriends = friends.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const siteJson = JSON.stringify(
    {
      name: siteConfig.bio.name,
      avatar: siteConfig.bio.avatar,
      description: siteConfig.description,
      url: siteConfig.url
    },
    null,
    2
  );

  function copyText(text: string, key: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => {
        console.error('复制失败');
      });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">友情链接</h1>
          <p className="mt-3 text-base text-muted-foreground">这里是我的朋友们，欢迎互相访问交流</p>
        </div>

        <Card className="mb-10 rounded-xl border border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon icon="mdi:link-variant" className="size-5 text-primary" />
              申请友链
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">欢迎与我交换友链，提交 Issue 即可自动完成。</p>

            <div className="space-y-3">
              <p className="text-sm font-semibold">本站信息</p>
              <div className="relative rounded-lg border border-border/60 bg-muted/30 p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-7 text-xs"
                  onClick={() => copyText(siteJson, 'site')}
                >
                  <Icon icon={copied === 'site' ? 'mdi:check' : 'mdi:content-copy'} className="mr-1 h-3.5 w-3.5" />
                  {copied === 'site' ? '已复制' : '复制'}
                </Button>
                <pre className="overflow-x-auto text-xs leading-relaxed text-foreground">
                  <code>{siteJson}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">申请方式</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  1. 在你的站点添加本站友链（
                  <a
                    href="https://iwexe.top"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    https://iwexe.top
                  </a>
                  ）
                </p>
                <p>2. 点击下方按钮提交友链申请 Issue，填写表单即可</p>
                <p>3. 系统会自动校验并创建友链文件，校验通过后自动合并</p>
                <div className="pt-3">
                  <a
                    href="https://github.com/ZhiJingHub/blog/issues/new?template=friend-link.yml"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <Icon icon="mdi:plus-circle" className="h-4 w-4" />
                      提交友链申请
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-6 text-xl font-bold">友链列表 ({friends.length})</h2>
          {friends.length === 0 ? (
            <Card className="rounded-xl border border-border/60">
              <CardContent className="py-12 text-center text-muted-foreground">暂无友链</CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedFriends.map((friend) => (
                  <a
                    key={friend.url}
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    aria-label={friend.name}
                  >
                    <Card className="h-full rounded-xl border border-border/60 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="relative h-14 w-14 shrink-0">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="h-14 w-14 rounded-full object-cover ring-2 ring-border/40"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const nextElement = target.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.removeAttribute('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground ring-2 ring-border/40"
                            hidden={!!friend.avatar}
                          >
                            {friend.name.charAt(0)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{friend.name}</div>
                          <div
                            className="mt-1 line-clamp-2 text-sm text-muted-foreground"
                            title={friend.description || '暂无描述'}
                          >
                            {friend.description || '暂无描述'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
