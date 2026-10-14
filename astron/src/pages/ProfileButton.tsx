export function ProfileButton({ className = '' }: { className?: string }) {
  return <button type="button" className={`profile-control ${className}`.trim()} aria-label="Profile">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg>
  </button>;
}
