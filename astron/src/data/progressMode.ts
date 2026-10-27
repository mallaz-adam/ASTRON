// During development, each full page load begins a fresh practice journey.
// The permanent database stays separate until progress saving is enabled.
export const temporaryProgress = import.meta.env.VITE_PERSIST_PROGRESS !== 'true';
export const previewDatabaseName = 'astron-development-preview';
export const progressDatabaseName = temporaryProgress ? previewDatabaseName : 'astron-progress';
