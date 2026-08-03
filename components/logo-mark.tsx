import Image from "next/image";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/amalcrew-avatar.png"
      alt=""
      width={36}
      height={36}
      className={`size-9 shrink-0 rounded-[11px] object-cover shadow-sm ${className}`}
    />
  );
}
