import { Link, type LinkProps } from 'react-router-dom';

// Navigation remains a link, with the same clear shape as an action button.
export function ActionLink({ variant = 'secondary', className = '', ...props }: LinkProps & {
  variant?: 'primary' | 'secondary';
}) {
  return <Link {...props} className={`atlas-button atlas-button--${variant} atlas-action-link ${className}`.trim()} />;
}
