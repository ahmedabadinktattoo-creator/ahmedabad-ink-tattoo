"use client";

export function PrivacySettingsButton() {
  return (
    <button
      className="footer-privacy-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event("ait:open-privacy-settings"))}
    >
      Privacy settings
    </button>
  );
}
