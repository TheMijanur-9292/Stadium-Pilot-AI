'use client';

import React from 'react';
import { Avatar as HeroUIAvatar } from '@heroui/react';

interface CustomAvatarProps extends Omit<React.ComponentPropsWithRef<typeof HeroUIAvatar>, 'color'> {
  color?: 'primary' | 'secondary' | 'accent' | 'danger' | 'default' | 'success' | 'warning';
  name?: string;
  src?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, CustomAvatarProps>(({
  children,
  name,
  src,
  color,
  size,
  ...props
}, ref) => {
  let initials = '';
  if (name && !children) {
    initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  let resolvedColor: any = color;
  if (color === 'primary') {
    resolvedColor = 'accent';
  } else if (color === 'secondary') {
    resolvedColor = 'default';
  }

  return (
    <HeroUIAvatar ref={ref} color={resolvedColor} size={size} {...props}>
      {src ? (
        <HeroUIAvatar.Image src={src} alt={name || 'User Avatar'} />
      ) : null}
      {initials ? (
        <HeroUIAvatar.Fallback>{initials}</HeroUIAvatar.Fallback>
      ) : null}
      {children}
    </HeroUIAvatar>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
