import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function MockInterviewTranscriptScreen({ route, navigation }) {
  const { conversation } = route.params;

  let questionNumber = 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FULL TRANSCRIPT</Text>
          <View style={{ width: 52 }} />
        </View>

        <Text style={styles.subtitle}>AI's internal notes are shown in italic below each answer.</Text>

        {/* Turns */}
        {conversation.map((turn, i) => {
          if (turn.type === 'ai') {
            return (
              <View key={i} style={styles.aiTurn}>
                <View style={styles.aiHeader}>
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>AI</Text>
                  </View>
                  <Text style={styles.aiLabel}>INTERVIEWER</Text>
                </View>
                <Text style={styles.aiText}>{turn.line}</Text>
              </View>
            );
          } else {
            questionNumber += 1;
            const duration = formatDuration(turn.duration);
            return (
              <View key={i} style={styles.userTurn}>
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>YOU</Text>
                  </View>
                  <Text style={styles.userLabel}>ANSWER {questionNumber}</Text>
                  {duration && <Text style={styles.durationLabel}>{duration}</Text>}
                </View>
                <Text style={styles.userText}>{turn.transcript}</Text>

                {/* Internal note: lives on the next AI turn's assessment of this answer */}
                {(() => {
                  const nextAiTurn = conversation[i + 1];
                  if (nextAiTurn?.type === 'ai' && nextAiTurn.note) {
                    return (
                      <View style={styles.noteBlock}>
                        <Text style={styles.noteLabel}>AI PRIVATE NOTE</Text>
                        <Text style={styles.noteText}>{nextAiTurn.note}</Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            );
          }
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: { paddingVertical: spacing.xs, width: 52 },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: fonts.header,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  aiTurn: {
    marginBottom: spacing.lg,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aiAvatar: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  aiAvatarText: {
    fontFamily: fonts.header,
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 1,
  },
  aiLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
  },
  aiText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
    paddingLeft: 36,
  },
  userTurn: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  userAvatar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatarText: {
    fontFamily: fonts.header,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  userLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    flex: 1,
  },
  durationLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  userText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  noteBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
