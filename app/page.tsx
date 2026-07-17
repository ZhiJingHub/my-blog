import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/theme-provider";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <img
        src={siteConfig.bio.avatar}
        alt={`${siteConfig.bio.name}的头像`}
        className="avatar-img h-32 w-32 rounded-full"
      />

      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">{siteConfig.bio.name}</h1>
        <p className="text-lg text-muted-foreground">{siteConfig.bio.bio}</p>
      </div>

      {/* 社交链接 */}
      <div className="w-full max-w-2xl mx-auto">
        <Card className="relative overflow-hidden">
          <CardHeader className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <CardTitle className="text-center text-5xl font-black tracking-widest text-foreground/[0.06] dark:text-foreground/[0.08] select-none">
              社交
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-wrap gap-3 justify-center">
              {siteConfig.bio.links.map((link) => {
                const isLocalImage = link.icon.startsWith("/");
                return (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      {isLocalImage ? (
                        <img src={link.icon} alt={link.name} className="h-5 w-5" />
                      ) : (
                        <Icon
                          icon={link.icon}
                          className="h-5 w-5"
                          style={link.color ? { color: link.color } : undefined}
                        />
                      )}
                      <span className="text-sm font-medium">{link.name}</span>
                    </Button>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 导航按钮 */}
      <div className="w-full max-w-2xl mx-auto">
        <Card className="relative overflow-hidden">
          <CardHeader className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <CardTitle className="text-center text-5xl font-black tracking-widest text-foreground/[0.06] dark:text-foreground/[0.08] select-none">
              导航
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-wrap gap-3 justify-center">
              {siteConfig.navLinks.map((link) => {
                const isExternal = link.href.startsWith("http");
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon icon={link.icon} className="h-5 w-5" />
                      {link.label}
                      {isExternal && <Icon icon="mdi:open-in-new" className="h-3.5 w-3.5 opacity-50" />}
                    </Button>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
