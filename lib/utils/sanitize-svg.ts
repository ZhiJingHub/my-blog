// SVG 消毒：移除可能执行脚本的危险元素和属性
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    .replace(/\s(?:on\w+)\s*=\s*"[^"]*"/gi, '')
    .replace(/\s(?:on\w+)\s*=\s*'[^']*'/gi, '')
    .replace(/<use\b[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '');
}
