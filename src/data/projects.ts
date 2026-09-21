import type {Project} from '@/services/api';
import {isCloudinaryImage,validImageSource} from '@/lib/image-loader';
export type DeviceMode='desktop'|'laptop'|'mobile';
export const deviceModes:DeviceMode[]=['desktop','laptop','mobile'];
export type VaultProject=Project & {screenshots?:Partial<Record<DeviceMode,string>>};
/** Optional real device screenshots; keep empty until an authored capture exists. */
export const projectScreenshotOverrides:Record<string,Partial<Record<DeviceMode,string>>>={};
export function projectScreenshot(project:VaultProject,device:DeviceMode,compact:boolean,secondary=false,inspection=false){
 const sources={...project.screenshots,...projectScreenshotOverrides[project.id]};
 const native=sources[device]||(device==='laptop'?sources.desktop:undefined);
 const source=native||sources.desktop||project.imageUrl;
 const width=secondary?960:device==='mobile'?(native?1080:1920):compact?1280:inspection?2560:1920;
 return {url:validImageSource(source)?isCloudinaryImage(source)?source.replace('/image/upload/',`/image/upload/f_webp,q_${inspection?92:90},c_limit,w_${width}/`):source:'',width,fit:device==='mobile'?'cover':'contain',portraitFallback:device==='mobile'&&!native};
}
