import Image from "next/image";
import React from "react";

interface BackgroundProps {
  isLoading: boolean;
}

export function Background({ isLoading }: BackgroundProps) {
  return (
    <div
      id="background-image-overlay"
      className="fixed h-full w-full left-0 top-0"
    >
      <Image
        className={`opacity-0 ${!isLoading && "fade-in-fast"}`}
        alt="Background image"
        src="/background-image.jpg"
        fill
        sizes="(min-width: 808px) 50vw, 100vw"
        style={{
          objectFit: "cover",
        }}
      />
    </div>
  );
}
