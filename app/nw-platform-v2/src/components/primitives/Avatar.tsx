/**
 * Avatar — Primitive P9 (design_system_spec.md §2.1)
 *
 * Persona avatar, small/medium. Decorative unless interactive; when
 * interactive it exposes the persona's full name as the accessible name
 * (spec a11y baseline) — that full name is required whenever
 * `interactive` is true, distinct from the (possibly abbreviated)
 * `initials` used as the visual fallback.
 */
import type { CSSProperties, KeyboardEvent } from 'react';

export type AvatarSize = 'small' | 'medium';

interface AvatarBaseProps {
  size?: AvatarSize;
  initials?: string | undefined;
  image?: string | undefined;
}

interface AvatarStaticProps extends AvatarBaseProps {
  interactive?: false;
  name?: string;
  onPress?: never;
}

interface AvatarInteractiveProps extends AvatarBaseProps {
  interactive: true;
  /** Full persona name — required, becomes the accessible name (spec P9 a11y baseline). */
  name: string;
  onPress: () => void;
}

export type AvatarProps = AvatarStaticProps | AvatarInteractiveProps;

const dimensions: Record<AvatarSize, number> = {
  small: 28,
  medium: 40,
};

function circleStyle(size: AvatarSize): CSSProperties {
  const d = dimensions[size];
  return {
    width: d,
    height: d,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    fontSize: size === 'small' ? '0.6875rem' : '0.8125rem',
    fontWeight: 600,
    overflow: 'hidden',
    flexShrink: 0,
  };
}

function AvatarVisual({ size = 'medium', initials, image }: AvatarBaseProps) {
  if (image) {
    return (
      <span style={circleStyle(size)}>
        <img
          src={image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </span>
    );
  }
  return <span style={circleStyle(size)}>{initials}</span>;
}

export function Avatar(props: AvatarProps) {
  const { size = 'medium', initials, image } = props;

  if (props.interactive) {
    const { name, onPress } = props;
    return (
      <button
        type="button"
        aria-label={name}
        data-lf-primitive="avatar"
        onClick={onPress}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onPress();
          }
        }}
        onFocus={(event) => {
          event.currentTarget.style.boxShadow = 'var(--focus-ring)';
        }}
        onBlur={(event) => {
          event.currentTarget.style.boxShadow = 'none';
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.opacity = '0.85';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = '1';
        }}
        style={{
          padding: 0,
          border: 'none',
          background: 'transparent',
          borderRadius: '50%',
          cursor: 'pointer',
          minWidth: 44,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="lf-avatar-interactive"
      >
        <AvatarVisual size={size} initials={initials} image={image} />
      </button>
    );
  }

  return (
    <span aria-hidden="true" data-lf-primitive="avatar">
      <AvatarVisual size={size} initials={initials} image={image} />
    </span>
  );
}
