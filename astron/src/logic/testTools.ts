export async function confirmProgressErasure(confirm: () => boolean, erase: () => Promise<void>): Promise<boolean> {
  if (!confirm()) return false;
  await erase();
  return true;
}
