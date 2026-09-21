import type {DeviceMode} from '@/data/projects';
export type DeviceState='idle'|'hovered'|'transitioning'|'selected'|'leaving';
export function deviceTargets({device,main,slot,time,hovered,inspection,reduced,pointer,scroll,transition,entrance,tablet}:{device:DeviceMode;main:boolean;slot:number;time:number;hovered:boolean;inspection:boolean;reduced:boolean;pointer:[number,number];scroll:number;transition:number;entrance:number;tablet:boolean}){
 const state:DeviceState=transition<.98?'transitioning':main&&inspection?'selected':hovered?'hovered':'idle';
 const idle=!reduced&&state==='idle',selected=state==='selected',hover=state==='hovered',depth=tablet?.65:1;
 const float=idle?Math.sin(time*Math.PI*2/5.8+slot)* (main?.026:.012):0;
 return {state,x:slot*(inspection?2.48:2.3)-(1-transition)*.12,y:(main?0:device==='mobile'?.12:.28)+float-(1-entrance)*.32-(1-transition)*.14,
 z:(main?(selected?.26:hover?.13:0):inspection?-.75:-.42)*depth-(1-transition)*.25-(1-entrance)*.4,
 rx:reduced||selected?0:(idle?Math.sin(time*.9)*.009:0)+(hover?-pointer[1]*.043:0)+scroll*.04,
 ry:reduced||selected?0:(idle?Math.sin(time*.7)*.016:0)+(hover?pointer[0]*.069:0)+(1-transition)*.14,
 scale:(main?(selected?1.12:hover?1.04:1):device==='mobile'?.43:.60)*(1-(1-transition)*.09),
 rail:selected?.027:hover?.018:idle?.005+Math.sin(time*1.1)*.004:0,
 lid:!reduced&&idle?Math.sin(time*.8)*.008:0,
 brightness:(main?(hover?1:.98):.88)*(.7+.3*transition),
 led:(selected?3.4:hover?3:2.1)+(reduced?0:Math.sin(time*Math.PI*2/3.2)*.25),
 opacity:Math.min(transition,entrance)};
}
