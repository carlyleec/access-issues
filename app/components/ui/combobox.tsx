import { useCombobox } from 'downshift'
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { alphabetizeOptions } from '~/lib/sort'

import { Button } from './button'
import { Input } from './input'
import { cn } from '~/lib/utils'

function getDefaultFilterFunction(searchTerm: string) {
  const lowerCasedInputValue = searchTerm.toLowerCase()

  return function defaultFilter(option: { value: string; label: string }) {
    return (
      !searchTerm || option.label.toLowerCase().includes(lowerCasedInputValue)
    )
  }
}

function ComboBox({
  value,
  options,
  placeholder,
  notFoundText = 'No items found',
  filterFunction = getDefaultFilterFunction,
  onChangeValue,
  disabled = false,
}: {
  value: string
  options: { value: string; label: string }[]
  placeholder: string
  notFoundText?: string
  filterFunction?: (
    searchTerm: string,
  ) => (option: { value: string; label: string }) => boolean
  onChangeValue: (value: string) => void
  disabled?: boolean
}) {
  const [items, setItems] = useState(options)
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    selectedItem: value ? options.find((o) => o.value === value) : null,
    onInputValueChange({ inputValue }) {
      setItems(options.filter(filterFunction(inputValue)))
    },
    onSelectedItemChange: ({ selectedItem }) =>
      onChangeValue(selectedItem?.value ?? ''),
    items,
    itemToString(item) {
      return item ? item.label : ''
    },
  })

  return (
    <div className="relative">
      <div className="relative flex w-full flex-col gap-1">
        <div className="relative flex w-full items-center space-x-1">
          <Input
            placeholder={placeholder}
            className=""
            {...getInputProps({ disabled })}
          />
          <Button
            variant="ghost"
            aria-label="toggle menu"
            type="button"
            className="absolute right-0 rounded-l-none"
            data-active={isOpen}
            {...getToggleButtonProps({ disabled })}
          >
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </div>
      <ul
        className={`absolute z-100 mt-1 max-h-80 w-full overflow-scroll rounded-b-md bg-background p-0 shadow-md ${
          !(isOpen && items.length) && 'hidden'
        }`}
        {...getMenuProps()}
      >
        {isOpen && items.length === 0 && (
          <p className="py-6 text-center text-sm">{notFoundText}</p>
        )}
        {isOpen &&
          alphabetizeOptions(items).map((item, index) => (
            <li
              className={cn(
                highlightedIndex === index && 'bg-accent',
                selectedItem === item && 'bg-accent',
                'flex cursor-pointer flex-col px-3 py-2 shadow-sm',
              )}
              key={item.value}
              {...getItemProps({ item, index })}
            >
              <span className="text-sm text-gray-700">{item.label}</span>
            </li>
          ))}
        <li className="h-[300px]"></li>
      </ul>
    </div>
  )
}

export default ComboBox
