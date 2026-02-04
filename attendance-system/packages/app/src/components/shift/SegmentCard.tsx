import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimeSegment } from '../../types/shift';

interface SegmentCardProps {
  segment: TimeSegment;
  index: number;
  onUpdate: (updated: TimeSegment) => void;
}

export default function SegmentCard({ segment, index, onUpdate }: SegmentCardProps) {
  if (!segment) {
    console.warn(`[SegmentCard] Segment at index ${index} is null or undefined`);
    return null;
  }

  // Helper to safely split range
  const getRangeParts = (range: string) => {
    const parts = range.split('-');
    return parts.length === 2 ? parts : ['00:00', '00:00'];
  };

  const [signInStart, signInEnd] = getRangeParts(segment.signInRange || '08:00-10:00');
  const [signOutStart, signOutEnd] = getRangeParts(segment.signOutRange || '17:00-19:00');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <Text style={styles.headerText}>上班</Text>
      </View>

      {/* Check-in Row */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.timeInput}>
            <Text style={styles.timeText}>{segment.startTime}</Text>
        </TouchableOpacity>
        
        <View style={styles.rangeContainer}>
            <Text style={styles.rangeLabel}>打卡范围:</Text>
            <TouchableOpacity style={styles.rangeInput}>
                <Text style={styles.rangeText}>{signInStart}</Text>
            </TouchableOpacity>
            <Text style={styles.tilde}>~</Text>
            <TouchableOpacity style={styles.rangeInput}>
                <Text style={styles.rangeText}>{signInEnd}</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Check-out Header */}
      <View style={[styles.headerRow, { marginTop: 16 }]}>
         <Text style={styles.headerText}>下班</Text>
      </View>

      {/* Check-out Row */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.timeInput}>
            <Text style={styles.timeText}>{segment.endTime}</Text>
        </TouchableOpacity>
        
        <View style={styles.rangeContainer}>
            <Text style={styles.rangeLabel}>打卡范围:</Text>
            <TouchableOpacity style={styles.rangeInput}>
                <Text style={styles.rangeText}>{signOutStart}</Text>
            </TouchableOpacity>
            <Text style={styles.tilde}>~</Text>
            <TouchableOpacity style={styles.rangeInput}>
                <Text style={styles.rangeText}>{signOutEnd}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#E2E8F0' 
    },
    headerRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    badge: { 
        width: 20, 
        height: 20, 
        borderRadius: 10, 
        backgroundColor: '#EFF6FF', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: 8 
    },
    badgeText: { 
        color: '#3B82F6', 
        fontSize: 12, 
        fontWeight: 'bold' 
    },
    headerText: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: '#334155' 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12 
    },
    timeInput: { 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        borderRadius: 6, 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        minWidth: 80, 
        alignItems: 'center' 
    },
    timeText: { 
        fontSize: 16, 
        color: '#0F172A' 
    },
    rangeContainer: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    rangeLabel: { 
        fontSize: 14, 
        color: '#64748B' 
    },
    rangeInput: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        borderRadius: 6, 
        paddingVertical: 8, 
        alignItems: 'center',
        backgroundColor: '#F8FAFC'
    },
    rangeText: { 
        fontSize: 14, 
        color: '#334155' 
    },
    tilde: { 
        color: '#94A3B8' 
    }
});
