import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface ChatbotModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function ChatbotModal({ visible, onClose }: ChatbotModalProps) {
  const { theme, isHighContrast } = useSettings();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Witaj w Asystencie Bezpieczeństwa DEFENSE. Jak mogę Ci dzisiaj pomóc? Zytaj o zasady pierwszej pomocy, procedury ewakuacji lub bezpieczeństwo w terenie.',
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let replyText = 'Dziękuję za wiadomość. W sytuacji zagrożenia życia pamiętaj o natychmiastowym użyciu przycisku SOS lub połączeniu z numerem 112.';
      if (userQuery.includes('pomoc') || userQuery.includes('pierwsza')) {
        replyText = 'Pierwsza pomoc: 1) Upewnij się, że miejsce jest bezpieczne, 2) Sprawdź przytomność i oddech, 3) W razie potrzeby rozpocznij RKO (30 uciśnięć : 2 wdechy) i wezwij pomoc.';
      } else if (userQuery.includes('schron') || userQuery.includes('ewakuacja')) {
        replyText = 'W przypadku ewakuacji zachowaj spokój, weź ze sobą plecak ucieczkowy, dokumenty, wodę oraz latarkę. Śledź komunikaty na mapie taktycznej.';
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.bg }]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>🤖 Asystent AI DEFENSE</Text>
            <Text style={styles.headerStatus}>● Aktywny 24/7</Text>
          </View>
        </View>

        {/* Chat message list */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.msgBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                isHighContrast && styles.highContrastBubble,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  msg.sender === 'user' ? styles.userMsgText : { color: theme.text },
                  isHighContrast && styles.highContrastMsgText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]}
            placeholder="Zadaj pytanie asystentowi..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Wyślij</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: '#30D158',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  highContrastBubble: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFF00',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
  },
  highContrastMsgText: {
    color: '#FFFF00',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
