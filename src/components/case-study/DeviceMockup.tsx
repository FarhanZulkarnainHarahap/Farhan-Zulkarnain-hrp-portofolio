/**
 * Static device mockup (Fase 10, DeviceMockup): a Blender render of a generic laptop with a
 * transparent screen, light/dark variants following the site theme, and the project screenshot
 * placed exactly in the screen area with plain CSS. No 3D at runtime.
 *  - The screenshot is the content image: priority, alt from the project title, object-fit cover /
 *    object-position top, broken images fall back to "Image unavailable".
 *  - The laptop render is decorative (alt=""), drawn on top so its bezel frames the screenshot.
 *  - The container's aspect ratio is the render's (8:5), so nothing shifts while images load.
 */
import { ProjectImage } from "@/components/projects/ProjectImage";
import { ThemedPicture } from "@/components/media/ThemedPicture";
import { DEVICE_BOUNDS, DEVICE_RENDER, screenBox } from "./device-screen";

const WIDTHS = [640, 960, 1280, 1600] as const;

export function DeviceMockup({ src, title }: { src: string | null | undefined; title: string }) {
  return (
    <div className="relative mx-auto aspect-[8/5] w-full max-w-wide" data-device-mockup>
      <span
        aria-hidden="true"
        className="device-shadow absolute"
        style={{
          left: `${DEVICE_BOUNDS.left + 2}%`,
          right: `${100 - DEVICE_BOUNDS.right + 2}%`,
          top: `${DEVICE_BOUNDS.bottom - 3}%`,
          height: "7%",
        }}
      />
      <div className="absolute overflow-hidden" style={screenBox} data-device-screen>
        <ProjectImage
          src={src}
          alt={`${title} screenshot`}
          priority
          sizes="(min-width: 1280px) 640px, 50vw"
          className="aspect-auto h-full w-full rounded-none bg-surface [&_img]:object-top"
        />
      </div>
      <ThemedPicture
        base="/3d/device"
        widths={WIDTHS}
        width={DEVICE_RENDER.width}
        height={DEVICE_RENDER.height}
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="pointer-events-none absolute inset-0"
      />
    </div>
  );
}
