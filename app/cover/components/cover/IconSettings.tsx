'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@iconify/react';

type IconSettingsProps = {
  showIcon: boolean;
  setShowIcon: (v: boolean) => void;
  localIcon: string | null;
  searchQuery: string;
  searchResults: string[];
  iconName: string;
  onLocalIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectIcon: (icon: string) => void;
};

export default function IconSettings({
  showIcon,
  setShowIcon,
  localIcon,
  searchQuery,
  searchResults,
  iconName,
  onLocalIconUpload,
  onSearchInput,
  onSelectIcon
}: IconSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>图标设置</span>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={showIcon} onCheckedChange={setShowIcon} />
            <span className="text-sm font-normal">显示图标</span>
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input type="file" accept="image/*" onChange={onLocalIconUpload} className="hidden" id="icon-upload" />
            <Label
              htmlFor="icon-upload"
              className="flex h-10 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:border-primary"
            >
              <Icon icon="mdi:image" className="mr-2 h-4 w-4" />
              <span className="text-xs">{localIcon ? '更换图片' : '上传图标'}</span>
            </Label>
          </div>
          <Input value={searchQuery} onChange={onSearchInput} placeholder="搜索图标..." className="h-10" />
        </div>
        {searchResults.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg border p-2">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(48px, 1fr))' }}>
              {searchResults.map((icon) => (
                <button
                  key={icon}
                  onClick={() => onSelectIcon(icon)}
                  className={`flex aspect-square items-center justify-center rounded-md border p-1.5 transition-colors hover:bg-accent ${
                    icon === iconName ? 'border-primary bg-primary/10' : 'border-input'
                  }`}
                  title={icon}
                >
                  <img
                    src={`https://api.iconify.design/${icon.split(':')[0]}/${icon.split(':')[1]}.svg`}
                    className="h-full w-full"
                    alt={icon}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground">当前: {iconName}</div>
      </CardContent>
    </Card>
  );
}
