import type { LogoKey } from "../tokens";

interface IconProps {
  size?: number;
}

export function EthIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16 4v9.87l8.5 3.8L16 4z" fill="#fff" fillOpacity="0.6" />
      <path d="M16 4L7.5 17.67l8.5-3.8V4z" fill="#fff" />
      <path d="M16 22.43V28l8.5-11.76L16 22.43z" fill="#fff" fillOpacity="0.6" />
      <path d="M16 28l-8.5-11.76L16 22.43V28z" fill="#fff" />
      <path d="M16 20.97l8.5-4.97L16 13.8v7.17z" fill="#fff" fillOpacity="0.2" />
      <path d="M7.5 16l8.5 4.97V13.8L7.5 16z" fill="#fff" fillOpacity="0.6" />
    </svg>
  );
}

export function WethIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wethBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC68A1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#wethBg)" />
      <path d="M16 5l7 12-7 4-7-4 7-12z" fill="#fff" fillOpacity="0.95" />
      <path d="M16 22.5l7-4-7 8.5-7-8.5 7 4z" fill="#fff" fillOpacity="0.7" />
    </svg>
  );
}

export function UsdcIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <circle cx="16" cy="16" r="13" fill="none" stroke="#fff" strokeWidth="0.9" strokeOpacity="0.4" />
      <path
        d="M20.5 13.2c0-1.6-1-2.6-3.1-3V8.4h-1.7v1.8c-.5 0-1 .1-1.5.1V8.4h-1.7v1.8H8.7v1.9h.7c.6 0 .9.3.9.8v6.2c0 .5-.3.8-.9.8h-.7v1.7h3.8v1.9h1.7v-1.9c.5 0 1-.1 1.5-.1v2h1.7v-2c2.6-.3 4-1.4 4-3.3 0-1.5-.9-2.3-2.6-2.6 1-.3 1.4-1.1 1.4-2.4zm-3.1 4.9v2.5c-.4.1-.9.1-1.4.1s-1-.1-1.4-.1v-2.5c.4 0 .9-.1 1.4-.1s1 .1 1.4.1zm0-3.9v2.4c-.4 0-.9 0-1.4 0s-1 0-1.4 0v-2.4c.4 0 .9 0 1.4 0s1 0 1.4 0z"
        fill="#fff"
      />
    </svg>
  );
}

export function LinkIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2A5ADA" />
      <path
        d="M16 5l9.5 5.5v11L16 27l-9.5-5.5v-11L16 5z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <path
        d="M13.5 16.5l3-3a2.1 2.1 0 013 3l-1 1M18.5 15.5l-3 3a2.1 2.1 0 01-3-3l1-1"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DaiIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F5AC37" />
      <path d="M16 6l7 10-7 10-7-10 7-10z" fill="#fff" fillOpacity="0.95" />
      <path d="M16 11v10" stroke="#F5AC37" strokeWidth="1.6" />
      <path d="M12 14.5h6.5M12 17h6.5" stroke="#F5AC37" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function UsdtIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        d="M9 10h14v3h-5.5v12h-3V13H9v-3z"
        fill="#fff"
      />
      <path d="M13 8.5h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DefaultIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2a3a2f" />
      <circle cx="16" cy="16" r="7" fill="#00ff88" fillOpacity="0.5" />
    </svg>
  );
}

export function TokenIcon({ logoKey, size = 28 }: { logoKey: LogoKey; size?: number }) {
  switch (logoKey) {
    case "eth":
      return <EthIcon size={size} />;
    case "weth":
      return <WethIcon size={size} />;
    case "usdc":
      return <UsdcIcon size={size} />;
    case "link":
      return <LinkIcon size={size} />;
    case "dai":
      return <DaiIcon size={size} />;
    case "usdt":
      return <UsdtIcon size={size} />;
    default:
      return <DefaultIcon size={size} />;
  }
}