/**
 * Shared Component Type Definitions
 * 
 * Common prop interfaces and types used across components
 */

import React from 'react';

/**
 * Base component props that all components can extend
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

/**
 * Props for components with loading states
 */
export interface LoadableComponentProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Props for components with error states
 */
export interface ErrorComponentProps {
  error?: string | Error;
  onRetry?: () => void;
}

/**
 * Props for components with validation
 */
export interface ValidatableComponentProps {
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Props for interactive components
 */
export interface InteractiveComponentProps {
  disabled?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Size variants used across components
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Variant types used across components
 */
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger';

/**
 * Status types for status indicators
 */
export type StatusType = 'confirmed' | 'rumored' | 'speculative' | 'expired' | 'active' | 'inactive' | 'pending';

/**
 * Alignment options
 */
export type AlignmentType = 'left' | 'center' | 'right' | 'between';

/**
 * Orientation options
 */
export type OrientationType = 'horizontal' | 'vertical';

/**
 * Props for components with size variants
 */
export interface SizedComponentProps {
  size?: ComponentSize;
}

/**
 * Props for components with visual variants
 */
export interface VariantComponentProps {
  variant?: ComponentVariant;
}

/**
 * Combined props for most UI components
 */
export interface StandardComponentProps 
  extends BaseComponentProps,
    SizedComponentProps,
    VariantComponentProps,
    InteractiveComponentProps {}

