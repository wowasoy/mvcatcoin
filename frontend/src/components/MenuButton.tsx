interface MenuButtonProps {
  onClick: () => void;
}

/**
 * Floating hamburger button, fixed at the top-left corner.
 * Uses liquid-glass styling consistent with the rest of the UI.
 */
export default function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button
      className="menu-button"
      onClick={onClick}
      type="button"
      aria-label="Open menu"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}