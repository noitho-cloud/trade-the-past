"use client";

import { useState } from "react";
import type { EventType } from "@/lib/types";
import { EventImagePlaceholder } from "./EventImagePlaceholder";

export function EventHeroImage({
  url,
  type,
}: {
  url: string | null;
  type: EventType;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <EventImagePlaceholder
        type={type}
        className="w-full h-48 rounded-xl"
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      width={672}
      height={192}
      className="w-full h-48 object-cover rounded-xl"
      onError={() => setFailed(true)}
    />
  );
}
