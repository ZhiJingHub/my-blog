import DOMPurify from "isomorphic-dompurify";

// 使用 DOMPurify 消毒 SVG，保留 SVG 元素但移除所有脚本执行向量
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["use", "foreignObject"],
  });
}
