"use client";

import type { CollectionItem } from "@chakra-ui/react";
import { Box, Center, Select as ChakraSelect, createListCollection, Input, Portal, Tag, Text } from "@chakra-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { CloseButton } from "./close-button";

interface SelectTriggerProps extends ChakraSelect.ControlProps {
  disableClear?: boolean;
  hideArrow?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const SelectTrigger = function SelectTrigger({ ref, ...props }: SelectTriggerProps) {
  const { children, disableClear, hideArrow, ...rest } = props;
  return (
    <ChakraSelect.Control {...rest}>
      <ChakraSelect.Trigger ref={ref}>{children}</ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        {!disableClear && <SelectClearTrigger />}
        {!hideArrow && <ChakraSelect.Indicator />}
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
  );
};

interface SelectClearTriggerProps extends ChakraSelect.ClearTriggerProps {
  ref?: React.Ref<HTMLButtonElement>;
}

const SelectClearTrigger = function SelectClearTrigger({ ref, ...props }: SelectClearTriggerProps) {
  return (
    <ChakraSelect.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton size="xs" variant="plain" focusVisibleRing="inside" focusRingWidth="2px" pointerEvents="auto" />
    </ChakraSelect.ClearTrigger>
  );
};

interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  ref?: React.Ref<HTMLDivElement>;
}

const SelectContent = function SelectContent({ ref, ...props }: SelectContentProps) {
  const { portalled = true, portalRef, ...rest } = props;
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content {...rest} ref={ref} />
      </ChakraSelect.Positioner>
    </Portal>
  );
};

interface SelectItemProps extends ChakraSelect.ItemProps {
  ref?: React.Ref<HTMLDivElement>;
}

const SelectItem = function ({ ref, ...props }: SelectItemProps) {
  const { item, children, ...rest } = props;

  return (
    <ChakraSelect.Item key={item.value} item={item} {...rest} ref={ref}>
      {children}
      <ChakraSelect.ItemIndicator />
    </ChakraSelect.Item>
  );
};

interface SelectValueTextProps extends Omit<ChakraSelect.ValueTextProps, "children"> {
  children?(items: CollectionItem[]): React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

const SelectValueText = function ({ ref, ...props }: SelectValueTextProps) {
  const { children, ...rest } = props;
  return (
    <ChakraSelect.ValueText {...rest} ref={ref}>
      <ChakraSelect.Context>
        {(select) => {
          const items = select.selectedItems;
          const selectedItems = items.map((item) => select.collection.stringifyItem(item));
          const isMulti = select.multiple;

          if (items.length === 0) return props.placeholder;
          if (children) return children(items);
          if (items.length === 1 && !isMulti) return select.collection.stringifyItem(items[0]);

          return (
            <Center>
              {selectedItems.slice(0, 3).map((item, index) => (
                <Tag.Root key={index} size="sm" variant="subtle" colorScheme="gray" mr={1}>
                  <Tag.Label>{item}</Tag.Label>
                </Tag.Root>
              ))}
              {selectedItems.length > 3 && (
                <Text fontSize="sm" ml={1}>
                  +{selectedItems.length - 3}
                </Text>
              )}
            </Center>
          );
        }}
      </ChakraSelect.Context>
    </ChakraSelect.ValueText>
  );
};

interface SelectRootProps extends ChakraSelect.RootProps {
  ref?: React.Ref<HTMLDivElement>;
}

const SelectRoot = function ({ ref, ...props }: SelectRootProps) {
  return (
    <ChakraSelect.Root {...props} ref={ref} positioning={{ sameWidth: true, ...props.positioning }}>
      {props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraSelect.HiddenSelect />
          {props.children}
        </>
      )}
    </ChakraSelect.Root>
  );
} as ChakraSelect.RootComponent;

interface SelectProps<T, V> {
  multiple?: boolean;
  options: T[];
  getLabel?: keyof T | ((option: T) => string);
  getValue?: keyof T | ((option: T) => V);
  value: V[];
  onChange: (value: V[]) => void;
  onBlur?: () => void;
  filter?: (option: T, index: number, self: T[]) => boolean;
  name?: string;
  isDisabled?: boolean;
  disableClear?: boolean;
  hideArrow?: boolean;

  isSearchable?: boolean;
  closeOnSelect?: boolean;
  placeholder?: string;

  disableOption?: (option: T) => boolean;
  size?: "sm" | "md" | "lg";
}

const getOptionLabel = <T, L>(option: T, getLabel: keyof T | ((option: T) => L)): string => {
  if (typeof getLabel === "function") {
    return `${getLabel(option)}`;
  }
  return `${option[getLabel]}`;
};

const getOptionValue = <T, V>(option: T, getValue: keyof T | ((option: T) => V)): V => {
  if (typeof getValue === "function") {
    return getValue(option);
  }
  return option[getValue] as V;
};

const SELECT_ITEM_HEIGHT = {
  sm: 28,
  md: 32,
  lg: 40,
};

export const Select = <T, V>({
  multiple = false,
  options,
  size = "md",
  name,
  getLabel = (option) => (option as unknown as { label: string })?.label,
  getValue = (option) => (option as unknown as { value: V })?.value,
  value,
  onChange,
  onBlur,
  placeholder = "Seçin",
  isDisabled = false,
  disableClear = false,
  hideArrow = false,
  closeOnSelect = false,
  isSearchable = false,
  filter,
  enableVirtual = false,
}: SelectProps<T, V> & { enableVirtual?: boolean }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const collection = React.useMemo(() => {
    const filtered = filter ? options.filter(filter) : options;
    return createListCollection({
      items: filtered.map((option) => ({
        value: getOptionValue(option, getValue),
        label: getOptionLabel(option, getLabel),
      })),
    });
  }, [getValue, getLabel, options, filter]);

  const filteredItems = React.useMemo(() => {
    return isSearchable && searchTerm
      ? collection.items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : collection.items;
  }, [collection.items, isSearchable, searchTerm]);

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => SELECT_ITEM_HEIGHT[size],
    overscan: 5,
    enabled: enableVirtual,
  });

  const itemsHeight = enableVirtual ? rowVirtualizer.getTotalSize() : filteredItems.length * SELECT_ITEM_HEIGHT[size];
  const maxListHeight = 300;

  return (
    <SelectRoot
      size={size}
      name={name}
      multiple={multiple}
      collection={collection}
      value={value as string[]}
      onValueChange={({ value }) => onChange(value as V[])}
      closeOnSelect={closeOnSelect}
      onInteractOutside={() => onBlur?.()}
      disabled={isDisabled}
    >
      <SelectTrigger disableClear={disableClear} hideArrow={hideArrow}>
        <SelectValueText placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent boxShadow="0px 4px 30px 0px #23283B1A">
        {isSearchable && (
          <Box p={1}>
            <Input
              size={size}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Axtar"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </Box>
        )}

        <Box
          ref={scrollContainerRef}
          style={{
            height: `${Math.min(itemsHeight, maxListHeight)}px`,
            width: "100%",
            overflow: "auto",
            position: "relative",
          }}
        >
          {filteredItems.length > 0 ? (
            enableVirtual ? (
              <Box
                style={{
                  height: `${itemsHeight}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = filteredItems[virtualRow.index];
                  if (!item) return null;

                  return (
                    <SelectItem
                      item={item}
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {item.label}
                    </SelectItem>
                  );
                })}
              </Box>
            ) : (
              <Box>
                {filteredItems.map((item) => (
                  <SelectItem item={item} key={`${item.value}`}>
                    {item.label}
                  </SelectItem>
                ))}
              </Box>
            )
          ) : (
            <Center p={2} fontSize={size}>
              Seçim yoxdur
            </Center>
          )}
        </Box>
      </SelectContent>
    </SelectRoot>
  );
};
