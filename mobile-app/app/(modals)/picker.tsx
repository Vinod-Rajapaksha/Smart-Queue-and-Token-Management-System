import React, { useMemo, useState, useEffect } from "react";
import { Modal, View, Text, Pressable, FlatList, TextInput, Keyboard } from "react-native";
import { X, Search, SlidersHorizontal } from "lucide-react-native";

type PickerModalProps<T> = {
  visible: boolean;
  title: string;

  items: T[];
  selectedId?: string;

  onClose: () => void;
  onSelect: (item: T) => void;

  getId: (item: T) => string;
  getTitle: (item: T) => string;

  getSubtitle?: (item: T) => string | undefined | null;
  searchPlaceholder?: string;
  searchKeys?: (item: T) => string;
  onOpenFilters?: () => void;

  emptyTitle?: string;
  emptySubtitle?: string;

  resetSearchOnOpen?: boolean;
};

export default function PickerModal<T>({
  visible,
  title,
  items,
  selectedId,
  onClose,
  onSelect,
  getId,
  getTitle,
  getSubtitle,
  searchPlaceholder = "Search...",
  searchKeys,
  onOpenFilters,
  emptyTitle = "No items found",
  emptySubtitle = "Try a different search.",
  resetSearchOnOpen = true,
}: PickerModalProps<T>) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!resetSearchOnOpen) return;
    if (visible) setQ("");
  }, [visible, resetSearchOnOpen]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const title = (getTitle(item) || "").toLowerCase();
      const subtitle = (getSubtitle?.(item) || "").toLowerCase();
      const haystack = searchKeys
        ? searchKeys(item).toLowerCase()
        : `${title} ${subtitle}`.trim();

      return haystack.includes(query);
    });
  }, [items, q, getTitle, getSubtitle, searchKeys]);

  const renderItem = ({ item }: { item: T }) => {
    const id = getId(item);
    const active = id === selectedId;
    const subtitle = getSubtitle?.(item);

    return (
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          onSelect(item);
          onClose();
        }}
        className={`px-4 py-3 border-b border-gray-100 ${
          active ? "bg-violet-50" : "bg-white"
        }`}
      >
        <Text
          className={`text-base font-extrabold ${
            active ? "text-violet-700" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {getTitle(item)}
        </Text>

        {!!subtitle && (
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-100">
            <Text className="text-lg font-extrabold text-gray-900">{title}</Text>

            <View className="flex-row items-center" style={{ gap: 10 }}>
              {!!onOpenFilters && (
                <Pressable
                  onPress={onOpenFilters}
                  className="p-2 rounded-xl bg-gray-100"
                >
                  <SlidersHorizontal size={18} color="#111827" />
                </Pressable>
              )}

              <Pressable onPress={onClose} className="p-2 rounded-xl bg-gray-100">
                <X size={18} color="#111827" />
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-3 py-2">
              <Search size={18} color="#6b7280" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-2 text-base text-gray-900"
                returnKeyType="search"
              />
              {!!q && (
                <Pressable onPress={() => setQ("")}>
                  <Text className="text-violet-700 font-semibold">Clear</Text>
                </Pressable>
              )}
            </View>

            <Text className="text-xs text-gray-500 mt-2">
              Showing {filtered.length} / {items.length}
            </Text>
          </View>

          {/* List */}
          <View style={{ maxHeight: 520 }}>
            {filtered.length === 0 ? (
              <View className="px-4 py-8 items-center">
                <Text className="text-base font-extrabold text-gray-900">
                  {emptyTitle}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">{emptySubtitle}</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => getId(item)}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>

          {/* Footer */}
          <View className="px-4 py-3 border-t border-gray-100">
            <Pressable onPress={onClose} className="py-3 rounded-2xl bg-gray-100">
              <Text className="text-center font-bold text-gray-900">Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
