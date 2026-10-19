import { Plus, X } from 'icons/lucide-react'
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Path, useController } from 'react-hook-form'
import { Button } from 'ui/basic/button'
import { getFormContext } from 'ui/form'
import { clsxJoin, DisallowNever } from 'ui/utils'
import { Label } from './label'

const separators = [',', ';']

interface TagInputProps<T> extends UseTagInputProps {
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  addOnBlur?: boolean
  name: Path<T>
}

export function TagInput<T>({
  placeholder = 'Enter value and press Enter',
  label,
  error,
  disabled = false,
  addOnBlur = true,
  ...props
}: TagInputProps<DisallowNever<T>>) {
  const ctx = getFormContext()
  const inputRef = useRef<HTMLInputElement>(null)

  // React Hook Form controller
  const controller = useController({
    control: ctx.hooks.control,
    name: props.name,
    defaultValue: (props.initialTags ?? []) as any
  })

  const { tags, inputValue, setInputValue, addTag, removeTag } = useTagInput({
    ...props,
    initialTags: controller.field.value || props.initialTags,
    onTagsChange: (newTags) => {
      controller.field.onChange(newTags)
      props.onTagsChange?.(newTags)
    }
  })

  // Sync external value changes with internal state
  useEffect(() => {
    if (controller.field.value && Array.isArray(controller.field.value)) {
      // This will be handled by useTagInput's initialTags dependency
    }
  }, [controller.field.value])

  const displayError = error ?? controller.fieldState.error?.message
  const isDisabled = disabled || controller.fieldState.isValidating

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (addTag(inputValue)) setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const lastChar = value[value.length - 1]

    if (separators.includes(lastChar)) {
      const tagValue = value.slice(0, -1)
      if (addTag(tagValue)) setInputValue('')
    } else {
      setInputValue(value)
    }
  }

  function handleBlur() {
    if (addOnBlur && inputValue.trim() && addTag(inputValue)) {
      setInputValue('')
    }
    controller.field.onBlur()
  }

  function handleAddClick() {
    if (addTag(inputValue)) {
      setInputValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div>
      {label && (
        <div className="flex justify-between">
          <Label className="mb-1.5 block" htmlFor={props.name as string}>
            {label}
          </Label>
          {props.maxTags && (
            <p className="text-xs text-gray-500">
              {tags.length}/{props.maxTags} tags
            </p>
          )}
        </div>
      )}

      <div
        style={{ minHeight: '2.38rem' }}
        className={clsxJoin(
          'border-input bg-background flex w-full flex-wrap gap-1 rounded-md border px-3 py-2 text-sm focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-solid',
          displayError ? 'border-red-500 focus-within:outline-red-500' : 'focus-within:outline-primary-600',
          isDisabled && 'cursor-not-allowed opacity-50'
        )}>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Tag key={`${tag}-${index}`} onRemove={() => removeTag(tag)} variant={displayError ? 'error' : 'default'}>
              {tag}
            </Tag>
          ))}
        </div>

        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={isDisabled}
          className="w-12 grow bg-inherit text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleAddClick}
            disabled={isDisabled}
            className="shrink-0 rounded-sm px-2 hover:bg-gray-200">
            <Plus className="size-3 text-gray-950" />
          </button>
        )}
      </div>

      {displayError && <p className="text-sm text-red-600">{displayError}</p>}
    </div>
  )
}

interface TagProps {
  children: React.ReactNode
  onRemove: () => void
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const tagVariants = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200'
}

function Tag({ children, onRemove, variant = 'default' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors ${tagVariants[variant]}`}>
      <span className="max-w-[120px] truncate">{children}</span>
      <Button variant="ghost" size="icon" className="size-4 rounded-full p-0 hover:bg-black/10" onClick={onRemove}>
        <X className="size-3" />
      </Button>
    </span>
  )
}

interface UseTagInputProps {
  initialTags?: string[]
  onTagsChange?: (tags: string[]) => void
  validator?: (tag: string) => boolean
  maxTags?: number
}

function useTagInput({ initialTags = [], onTagsChange, validator, maxTags }: UseTagInputProps = {}) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState('')

  // Update tags when initialTags changes (for React Hook Form integration)
  useEffect(() => {
    if (Array.isArray(initialTags) && JSON.stringify(initialTags) !== JSON.stringify(tags)) {
      setTags(initialTags)
    }
  }, [initialTags])

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()

      if (!trimmedTag) return false
      if (tags.includes(trimmedTag)) return false
      if (validator && !validator(trimmedTag)) return false
      if (maxTags && tags.length >= maxTags) return false

      const newTags = [...tags, trimmedTag]
      setTags(newTags)
      onTagsChange?.(newTags)
      return true
    },
    [tags, validator, maxTags, onTagsChange]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove)
      setTags(newTags)
      onTagsChange?.(newTags)
    },
    [tags, onTagsChange]
  )

  const clearTags = useCallback(() => {
    setTags([])
    onTagsChange?.([])
  }, [onTagsChange])

  return { tags, inputValue, setInputValue, addTag, removeTag, clearTags }
}
