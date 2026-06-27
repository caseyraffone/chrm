import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';

// A GitHub-style activity heatmap: each square is a day, shaded by how many
// drills were completed that day. Encourages a daily practice habit.

const WEEKS = 14; // ~3 months of history
const EMPTY = colors.surfaceElevated;
const L1 = 'rgba(23,71,212,0.28)';
const L2 = 'rgba(23,71,212,0.55)';
const L3 = colors.accent;

function dayKey(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC) — matches storage's daily key
}
function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
function intensity(count) {
  if (!count) return EMPTY;
  if (count >= 4) return L3;
  if (count >= 2) return L2;
  return L1;
}

export default function ActivityCalendar({ drills }) {
  // Count drills per day.
  const counts = {};
  for (const dr of drills || []) {
    if (!dr.date) continue;
    const k = dr.date.slice(0, 10);
    counts[k] = (counts[k] || 0) + 1;
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = today.getUTCDay(); // 0 = Sunday
  const startSunday = addDays(today, -dow - (WEEKS - 1) * 7);

  // Build columns (weeks) of 7 days each.
  const columns = [];
  for (let w = 0; w < WEEKS; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(startSunday, w * 7 + d);
      col.push({ future: date > today, count: counts[dayKey(date)] || 0 });
    }
    columns.push(col);
  }

  // Current streak: consecutive days with activity, counting back from today
  // (or yesterday, so the streak isn't "broken" before today's session).
  let streak = 0;
  let cursor = (counts[dayKey(today)] || 0) > 0 ? today : addDays(today, -1);
  while ((counts[dayKey(cursor)] || 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>ACTIVITY</Text>
        <Text style={[styles.streak, streak > 0 && styles.streakActive]}>
          {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} streak` : 'Start a streak today'}
        </Text>
      </View>

      <View style={styles.grid}>
        {columns.map((col, ci) => (
          <View key={ci} style={styles.col}>
            {col.map((cell, ri) => (
              <View
                key={ri}
                style={[
                  styles.cell,
                  cell.future
                    ? styles.cellFuture
                    : { backgroundColor: intensity(cell.count), borderColor: cell.count ? 'transparent' : colors.border },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Less</Text>
        {[EMPTY, L1, L2, L3].map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c, borderColor: c === EMPTY ? colors.border : 'transparent' }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const CELL = 13;
const GAP = 3;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2.5 },
  streak: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted },
  streakActive: { color: colors.accent },
  grid: { flexDirection: 'row', gap: GAP, justifyContent: 'center' },
  col: { gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: 3, borderWidth: 1 },
  cellFuture: { backgroundColor: 'transparent', borderColor: 'transparent' },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: GAP, marginTop: spacing.sm },
  legendText: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, marginHorizontal: spacing.xs },
  legendCell: { width: CELL, height: CELL, borderRadius: 3, borderWidth: 1 },
});
