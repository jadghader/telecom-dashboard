// src/hooks/useDeviceType.ts
import { useState, useEffect } from "react";

export const useDeviceType = (): "mobile" | "tablet" | "desktop" => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType("mobile");
      else if (width < 1200) setDeviceType("tablet");
      else setDeviceType("desktop");
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  return deviceType;
};
