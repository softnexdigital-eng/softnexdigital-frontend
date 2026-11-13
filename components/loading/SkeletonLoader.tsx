'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  h?: string;
  w?: string;
  rounded?: string;
}

export function Skeleton({ className, h = '1em', w = '100%', rounded = 'md', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-rose-100/50 rounded-' + rounded + ' overflow-hidden',
        className
      )}
      style={{ height: h, width: w }}
      {...props}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: string;
  className?: string;
}

export function SkeletonText({ lines = 3, lineHeight = '1.25rem', className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          h={lineHeight}
          w={i === lines - 1 ? '60%' : '100%'}
          className="mb-1"
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-4 animate-pulse', className)}>
      <Skeleton h="24px" w="48px" className="mb-3" />
      <SkeletonText lines={3} className="mb-2" />
      <Skeleton h="12px" w="80%" />
    </div>
  );
}

interface SkeletonAvatarProps {
  className?: string;
  size?: string;
}

export function SkeletonAvatar({ className, size = 'w-12 h-12' }: SkeletonAvatarProps) {
  return (
    <div className={cn('animate-pulse bg-rose-100/50 rounded-full', className)} style={{ width: size, height: size }} />
  );
}

interface SkeletonButtonProps {
  className?: string;
}

export function SkeletonButton({ className }: SkeletonButtonProps) {
  return (
    <div className={cn('animate-pulse bg-rose-100/50 rounded-xl', className)} style={{ height: '40px', width: '200px' }} />
  );
}

interface SkeletonImageProps {
  className?: string;
  h?: string;
  w?: string;
}

export function SkeletonImage({ className, h = '200px', w = '100%' }: SkeletonImageProps) {
  return (
    <div className={cn('animate-pulse bg-rose-100/50 rounded-lg overflow-hidden', className)} style={{ height: h, width: w }} />
  );
}

interface SkeletonTableRowProps {
  className?: string;
}

export function SkeletonTableRow({ className }: SkeletonTableRowProps) {
  return (
    <div className={cn('flex items-center gap-4 px-6 py-4 border-b border-gray-100 animate-pulse bg-white', className)}>
      <Skeleton h="8px" w="20%" className="mb-1" />
      <Skeleton h="8px" w="40%" className="mb-1" />
      <Skeleton h="8px" w="15%" />
    </div>
  );
}

interface SkeletonFormProps {
  className?: string;
}

export function SkeletonForm({ className }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton h="48px" w="100%" className="mb-2" />
      <Skeleton h="48px" w="100%" className="mb-2" />
      <Skeleton h="48px" w="100%" className="mb-4" />
      <LoadingButtonSkeleton />
    </div>
  );
}

function LoadingButtonSkeleton() {
  return (
    <div className="animate-pulse bg-rose-100/50 rounded-xl" style={{ height: '48px', width: '160px' }} />
  );
}