'use client'

import { useId } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import Icon from './Icon'

/**
 * The search field of Figma node 1:4314.
 *
 * Fully controlled: the query lives in `useAppStore` because three surfaces read it (the header
 * field, the suggestion dropdown and the results state). A component with its own copy would let
 * the dropdown show results for a string the field no longer contains.
 */

export interface SearchInputProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  /** Accessible name. The design shows no visible label, so one is required here. */
  label?: string
  onFocus?: () => void
  onBlur?: () => void
  /** Enter / ArrowDown, supplied by whichever surface owns the results below the field. */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLInputElement>) => void
  /** Called by the clear control. Defaults to emptying the field. */
  onClear?: () => void
  autoFocus?: boolean
  className?: string
}

export default function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search games...',
  label = 'Search games',
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
  autoFocus = false,
  className,
}: SearchInputProps) {
  const inputId = useId()

  const clear = () => {
    onValueChange('')
    onClear?.()
  }

  return (
    <div
      className={[
        'flex h-12 items-center gap-3 rounded-3xl border border-solid border-separator',
        // Node 1:4314 fills the field with #1A1D2E, a shade off the card it sits on; `bg-field`
        // did not exist when this was first built and `bg-card` was the stand-in.
        'bg-field pl-4 pr-3',
        'focus-within:border-blue',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name="search" width={20} height={20} className="shrink-0" />

      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        autoComplete="off"
        className={[
          'min-w-0 flex-1 bg-transparent text-sm font-medium text-primary',
          'placeholder:text-caption focus:outline-none',
          // Safari and Chrome draw their own clear affordance on type=search; the design has its
          // own button, and two of them side by side is the sort of detail that reads as a bug.
          '[&::-webkit-search-cancel-button]:appearance-none',
        ].join(' ')}
      />

      {value.length > 0 ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className={[
            'flex size-7 shrink-0 items-center justify-center rounded-[14px]',
            'border border-solid border-separator bg-card',
            // The glyph is a flat exported asset, so hover moves the chrome rather than the ink.
            'transition-colors hover:bg-elevated',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue',
          ].join(' ')}
        >
          <Icon name="close" width={16} height={16} className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
