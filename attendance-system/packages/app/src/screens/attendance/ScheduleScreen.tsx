import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Surface, useTheme, Card, Avatar } from 'react-native-paper';
import { getSchedules, ScheduleVo } from '../../services/attendance';
import { authService } from '../../services/auth';
import { getUser, setUser } from '../../utils/auth';
import { logger } from '../../utils/logger';

const ScheduleScreen = () => {
  const theme = useTheme();
  const [schedules, setSchedules] = useState<{date: string, shift?: any}[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let user = await getUser();
      
      const meRes = await authService.getMe();
      if (meRes) {
        user = { ...user, ...meRes };
        await setUser(user);
      }

      if (!user || !user.employeeId) {
        logger.warn('No employeeId found for user');
        setLoading(false);
        return; 
      }

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      
      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const startDate = formatDate(start);
      const endDate = formatDate(end);

      const res = await getSchedules({
        employeeId: user.employeeId, 
        startDate,
        endDate
      });
      
      const expandedSchedules: {date: string, shift?: any}[] = [];
      const current = new Date(start);
      const last = new Date(end);
      
      while (current <= last) {
        const dateStr = formatDate(current);
        const match = (res || []).find(s => 
          dateStr >= s.startDate && dateStr <= s.endDate
        );
        
        expandedSchedules.push({
          date: dateStr,
          shift: match?.shift
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      setSchedules(expandedSchedules);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: {date: string, shift?: any} }) => {
    const isRest = !item.shift;
    const dateObj = new Date(item.date);
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
    
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.dateInfo}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.date.split('-')[2]}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>周{dayOfWeek}</Text>
          </View>
          
          <View style={styles.shiftInfo}>
            <Text variant="titleMedium" style={{ 
              color: isRest ? theme.colors.secondary : theme.colors.primary,
              fontWeight: 'bold'
            }}>
              {item.shift?.name || '休息'}
            </Text>
            {item.shift && (
              <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                {item.shift.startTime} - {item.shift.endTime}
              </Text>
            )}
          </View>

          <Avatar.Icon 
            size={40} 
            icon={isRest ? "coffee" : "briefcase-clock"} 
            style={{ backgroundColor: isRest ? theme.colors.surfaceVariant : theme.colors.secondaryContainer }}
            color={isRest ? theme.colors.secondary : theme.colors.onSecondaryContainer}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <ActivityIndicator style={{ margin: 20 }} />
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderItem}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInfo: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  shiftInfo: {
    flex: 1,
  },
});

export default ScheduleScreen;
