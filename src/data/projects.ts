import type { Project } from '@/services/api';
import { isCloudinaryImage, validImageSource } from '@/lib/image-loader';
export type VaultProject = Project;
export function projectScreenshot(src: string, mobile: boolean) {
  if (!validImageSource(src)) return '';
  return isCloudinaryImage(src) ? src.replace('/image/upload/', `/image/upload/f_webp,q_82,c_pad,w_${mobile?640:1280},h_${mobile?360:720},b_rgb:101820/`) : src;
}
/** Three visible instances at most, with identity preserved when positions swap. */
export function projectWindow(count: number, active: number, mobile: boolean) {
  if (!count) return [];
  if (mobile || count===1) return [{index:active,slot:0}];
  const previous=(active+count-1)%count, next=(active+1)%count;
  return [{index:active,slot:0},{index:previous,slot:-1},...(next===previous?[]:[{index:next,slot:1}])];
}
