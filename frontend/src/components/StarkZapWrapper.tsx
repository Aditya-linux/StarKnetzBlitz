"use client";

import StarkZapProvider from "./StarkZapProvider";

export default function StarkZapWrapper({ children }: { children: React.ReactNode }) {
  return <StarkZapProvider>{children}</StarkZapProvider>;
}
