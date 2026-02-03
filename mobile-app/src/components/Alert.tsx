import React from "react";
import { View } from "react-native";
import { Portal, Dialog, Button, Text } from "react-native-paper";

type AlertProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
};

export default function AppAlert({
  visible,
  title = "Coming Soon",
  message = "🚀 This feature will be available in the next update.",
  onClose,
  confirmText = "OK",
  onConfirm,
}: AlertProps) {
  const isConfirm = !!onConfirm;
  
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose}>
        <Dialog.Title>{title}</Dialog.Title>

        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>

        <Dialog.Actions>
          {isConfirm ? (
            <View style={{ flexDirection: "row" }}>
              <Button onPress={onClose}>Cancel</Button>
              <Button
                onPress={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                {confirmText}
              </Button>
            </View>
          ) : (
            <Button onPress={onClose}>{confirmText}</Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
