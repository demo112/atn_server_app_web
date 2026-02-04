import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TimeSegment } from '../../types/shift';
import Toggle from '../common/Toggle';

interface SegmentCardProps {
  segment: TimeSegment;
  index: number;
  onUpdate: (updated: TimeSegment) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, index, onUpdate }) => {
  if (!segment) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>第{index + 1}次</Text>

      {/* 上班部分 */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.timeRow}
          onPress={() => console.log('Edit start time')}
        >
          <Text style={styles.label}>
            <Text style={styles.required}>*</Text>上班时间
          </Text>
          <View style={styles.valueContainer}>
            <Text style={styles.timeValue}>{segment.startTime}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        <View style={styles.subCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.subLabel}>必须签到</Text>
            <Toggle 
              checked={segment.mustSignIn} 
              onChange={(val) => onUpdate({ ...segment, mustSignIn: val })} 
            />
          </View>

          {segment.mustSignIn && (
            <TouchableOpacity 
              style={styles.rangeRow}
              onPress={() => console.log('Edit sign in range')}
            >
              <Text style={styles.subLabel}>
                <Text style={styles.required}>*</Text>签到时间段
              </Text>
              <View style={styles.valueContainer}>
                <Text style={styles.rangeValue}>{segment.signInRange}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 下班部分 */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <TouchableOpacity 
          style={styles.timeRow}
          onPress={() => console.log('Edit end time')}
        >
          <Text style={styles.label}>
            <Text style={styles.required}>*</Text>下班时间
          </Text>
          <View style={styles.valueContainer}>
            <Text style={styles.timeValue}>{segment.endTime}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        <View style={styles.subCard}>
          <View style={styles.toggleRow}>
            <Text style={styles.subLabel}>必须签退</Text>
            <Toggle 
              checked={segment.mustSignOut} 
              onChange={(val) => onUpdate({ ...segment, mustSignOut: val })} 
            />
          </View>

          {segment.mustSignOut && (
            <TouchableOpacity 
              style={styles.rangeRow}
              onPress={() => console.log('Edit sign out range')}
            >
              <Text style={styles.subLabel}>
                <Text style={styles.required}>*</Text>签退时间段
              </Text>
              <View style={styles.valueContainer}>
                <Text style={styles.rangeValue}>{segment.signOutRange}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  section: {
    // Section spacing
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#334155',
  },
  required: {
    color: '#EF4444',
    marginRight: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 4,
  },
  subCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  rangeValue: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
});

export default SegmentCard;
