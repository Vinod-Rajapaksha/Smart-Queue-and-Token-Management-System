import { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { Star, CheckCircle2 } from "lucide-react-native";
import Button from "../../src/components/Button";

type EmojiKey = "angry" | "sad" | "neutral" | "happy" | "love";

const EMOJIS: { key: EmojiKey; label: string; emoji: string; rating: number }[] =
  [
    { key: "angry", label: "Bad", emoji: "😡", rating: 1 },
    { key: "sad", label: "Poor", emoji: "😞", rating: 2 },
    { key: "neutral", label: "Ok", emoji: "😐", rating: 3 },
    { key: "happy", label: "Good", emoji: "😊", rating: 4 },
    { key: "love", label: "Great", emoji: "😍", rating: 5 },
  ];

interface RatingModalProps {
  visible: boolean;
  token: any | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment?: string; emoji?: EmojiKey }) => void;
}

export default function RatingModal({
  visible,
  token,
  submitting = false,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [emoji, setEmoji] = useState<EmojiKey | undefined>(undefined);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(
    () => rating >= 1 && rating <= 5 && !submitting,
    [rating, submitting]
  );

  const reset = () => {
    setRating(0);
    setEmoji(undefined);
    setComment("");
    setSuccess(false);
  };

  useEffect(() => {
    if (visible) setSuccess(false);
  }, [visible]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      reset();
      onClose();
    }, 2800);
    return () => clearTimeout(t);
  }, [success]);

  if (!token) return null;

  const handleSubmit = async () => {
    try {
      await onSubmit({
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
        emoji,
      });
      setSuccess(true);
    } catch (e) {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        reset();
        onClose();
      }}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-5">
        <View className="w-full bg-white rounded-3xl p-5 border border-gray-200">
          {success ? (
            <View className="items-center py-6">
              <View className="w-14 h-14 rounded-2xl bg-violet-50 items-center justify-center border border-violet-200">
                <CheckCircle2 size={28} color="#7c3aed" />
              </View>

              <Text className="text-lg font-extrabold text-gray-900 mt-4">
                Thanks for your feedback!
              </Text>

              <Text className="text-sm text-gray-500 mt-2 text-center">
                Your rating for Token #{token?.tokenNumber ?? "-"} was submitted.
              </Text>

              <View className="mt-5 w-full">
                <Button
                  title="Done"
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                />
              </View>
            </View>
          ) : (
            <>
              <Text className="text-lg font-extrabold text-gray-900">
                Rate your experience
              </Text>

              <Text className="text-sm text-gray-500 mt-2">
                Token #{token?.tokenNumber ?? "-"} is completed.
              </Text>

              <Text className="text-xs text-gray-500 mt-4 mb-2">Quick</Text>
              <View className="flex-row justify-between">
                {EMOJIS.map((e) => {
                  const active = emoji === e.key;
                  return (
                    <Pressable
                      key={e.key}
                      onPress={() => {
                        setEmoji(e.key);
                        setRating(e.rating);
                      }}
                      className={`w-14 h-14 rounded-2xl items-center justify-center border ${
                        active
                          ? "bg-violet-50 border-violet-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className="text-2xl">{e.emoji}</Text>
                      <Text
                        className={`text-[10px] mt-1 ${
                          active ? "text-violet-700" : "text-gray-500"
                        }`}
                      >
                        {e.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-xs text-gray-500 mt-5 mb-2">Stars</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((v) => {
                  const filled = v <= rating;
                  return (
                    <Pressable
                      key={v}
                      onPress={() => {
                        setRating(v);
                        setEmoji(undefined);
                      }}
                      className="mr-2 p-2 rounded-2xl bg-gray-50 border border-gray-200"
                    >
                      <Star
                        size={22}
                        color={filled ? "#7c3aed" : "#9ca3af"}
                        fill={filled ? "#7c3aed" : "transparent"}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-xs text-gray-500 mt-5 mb-2">
                Comment (optional)
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Tell us what happened..."
                placeholderTextColor="#9ca3af"
                multiline
                className="min-h-[90px] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
              />

              <View className="mt-5" style={{ gap: 10 }}>
                <Button
                  title={submitting ? "Submitting..." : "Submit Rating"}
                  disabled={!canSubmit}
                  onPress={handleSubmit}
                />
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
