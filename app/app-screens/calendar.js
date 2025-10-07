import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserData } from './contexts/UserDataContext';
import ApiService from './services/api';
import BottomNavigation from './components/BottomNavigation';

const Calendar = () => {
  const router = useRouter();
  const { userData } = useUserData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledDays, setScheduledDays] = useState([]); // Days with meal schedules
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState(null);
  
  // Swap Meals Modal States
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState(0); // 0-3 for weeks 1-4
  const [activeDayTab, setActiveDayTab] = useState(0); // 0-6 for Mon-Sun
  const [allWeeksMeals, setAllWeeksMeals] = useState({});
  const [selectedMealToSwap, setSelectedMealToSwap] = useState(null);
  const [swapMode, setSwapMode] = useState(null); // 'selecting' or null

  // Get user's selected meal types count
  const userMealTypes = userData?.mealtypes || [];
  const mealCount = userMealTypes.length;

  // Fallback images for meals
  const fallbackImages = [
    require('../assets/burger.jpg'),
    require('../assets/caesar.jpg'),
    require('../assets/fish.png'),
    require('../assets/women-eating-food.jpg'),
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get the number of days in the month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get the number of days in the previous month
  const getDaysInPrevMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Check if a date is today
  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const daysInPrevMonth = getDaysInPrevMonth(currentDate);
    
    const days = [];
    
    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i)
      });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }
    
    // Next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handle date selection
  const handleDatePress = (dateObj) => {
    setSelectedDate(dateObj.date);
  };

  // Fetch meals for the selected date
  const fetchMealsForDate = async (date) => {
    try {
      setMealsLoading(true);
      setMealsError(null);

      const userId = userData?.userId || userData?.id;
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Get meal schedule
      const result = await ApiService.getMealSchedule(userId);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch meal schedule');
      }

      const schedule = result.data;
      const currentWeek = schedule.weeks[0];
      
      if (!currentWeek) {
        throw new Error('No meals found in schedule');
      }

      // Map date to day of week
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayKey = dayNames[dayOfWeek];

      const dayData = currentWeek.days[dayKey];
      
      if (!dayData) {
        setMeals([]);
        return;
      }

      // Extract all meals for this day
      const dayMeals = [];
      Object.keys(dayData).forEach(mealKey => {
        const meal = dayData[mealKey];
        if (meal) {
          dayMeals.push({
            id: meal.id,
            title: meal.name || 'Delicious Meal',
            subtitle: meal.description || 'A nutritious meal',
            source: meal.image_url ? { uri: meal.image_url } : fallbackImages[dayMeals.length % fallbackImages.length],
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fat || meal.fats,
            fiber: meal.fiber,
            category: meal.category,
          });
        }
      });

      setMeals(dayMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setMealsError(error.message);
      setMeals([]);
    } finally {
      setMealsLoading(false);
    }
  };

  // Fetch all weeks' meals for swap modal
  const fetchAllWeeksMeals = async () => {
    try {
      const userId = userData?.userId || userData?.id;
      if (!userId) return;

      const result = await ApiService.getMealSchedule(userId);
      if (!result.success || !result.data) return;

      const schedule = result.data;
      const weeksData = {};

      // Get all days for all 4 weeks
      schedule.weeks.forEach((week, weekIndex) => {
        const weekMeals = [];
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayDisplayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        dayNames.forEach((dayKey, dayIndex) => {
          const dayData = week.days[dayKey];
          if (dayData) {
            // Get all meals for this day
            Object.keys(dayData).forEach((mealKey, mealIndex) => {
              const meal = dayData[mealKey];
              if (meal) {
                weekMeals.push({
                  id: meal.id,
                  title: meal.name || 'Delicious Meal',
                  source: meal.image_url ? { uri: meal.image_url } : fallbackImages[mealIndex % fallbackImages.length],
                  calories: meal.calories,
                  protein: meal.protein,
                  category: meal.category,
                  mealKey: mealKey,
                  weekIndex: weekIndex,
                  dayKey: dayKey,
                  dayName: dayDisplayNames[dayIndex],
                  dayIndex: dayIndex,
                });
              }
            });
          }
        });
        
        weeksData[weekIndex] = weekMeals;
      });

      setAllWeeksMeals(weeksData);
    } catch (error) {
      console.error('Error fetching all weeks meals:', error);
    }
  };

  // Handle swap meals
  const handleSwapMeals = async (targetMeal) => {
    if (!selectedMealToSwap) return;

    try {
      const userId = userData?.userId || userData?.id;
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      console.log('Swapping meals:');
      console.log('From (source):', selectedMealToSwap);
      console.log('To (target):', targetMeal);

      // Get the day of week for today
      const dayOfWeek = selectedDate.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayKey = dayNames[dayOfWeek];

      // Prepare source meal data (today's meal)
      const sourceMeal = {
        weekIndex: 0, // Current week is always 0
        dayKey: dayKey,
        mealKey: selectedMealToSwap.category?.toLowerCase() || 'lunch', // Use category or default to lunch
        mealId: selectedMealToSwap.id
      };

      // Prepare target meal data (meal from selected week)
      const targetMealData = {
        weekIndex: targetMeal.weekIndex,
        dayKey: targetMeal.dayKey,
        mealKey: targetMeal.mealKey,
        mealId: targetMeal.id
      };

      console.log('Calling API with:', { sourceMeal, targetMealData });

      // Call the API to swap meals
      const result = await ApiService.swapMeals(userId, sourceMeal, targetMealData);

      if (result.success) {
        Alert.alert('Success', 'Meals swapped successfully!');
        
        // Close modal and reset
        setShowSwapModal(false);
        setSelectedMealToSwap(null);
        setSwapMode(null);
        setActiveWeekTab(0);
        
        // Refresh meals
        await fetchMealsForDate(selectedDate);
      } else {
        Alert.alert('Error', result.message || 'Failed to swap meals');
      }
    } catch (error) {
      console.error('Error swapping meals:', error);
      Alert.alert('Error', error.message || 'Failed to swap meals');
    }
  };

  // Fetch meals when selected date changes
  useEffect(() => {
    if (userData?.isRegistered) {
      fetchMealsForDate(selectedDate);
    }
  }, [selectedDate, userData?.userId]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Calendar</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Month/Year Selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color="#07da63" />
            </TouchableOpacity>
            
            <View style={styles.monthYearContainer}>
              <Text style={styles.monthText}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
            </View>
            
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color="#07da63" />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((dateObj, index) => {
              const isSelected = isSameDay(dateObj.date, selectedDate);
              const isTodayDate = isToday(dateObj.date);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !dateObj.isCurrentMonth && styles.dayCellInactive,
                    isSelected && styles.dayCellSelected,
                    isTodayDate && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => handleDatePress(dateObj)}
                  disabled={!dateObj.isCurrentMonth}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !dateObj.isCurrentMonth && styles.dayTextInactive,
                      isSelected && styles.dayTextSelected,
                      isTodayDate && !isSelected && styles.dayTextToday,
                    ]}
                  >
                    {dateObj.day}
                  </Text>
                  {/* Dot indicator for scheduled meals */}
                  {dateObj.isCurrentMonth && (
                    <View style={styles.mealIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Meal Cards */}
          <View style={styles.mealsSection}>
            <Text style={styles.mealsSectionTitle}>Your Meals for This Day</Text>
            
            {mealsLoading ? (
              <View style={styles.mealsLoadingContainer}>
                <ActivityIndicator size="large" color="#07da63" />
                <Text style={styles.mealsLoadingText}>Loading meals...</Text>
              </View>
            ) : mealsError ? (
              <View style={styles.mealsErrorContainer}>
                <Text style={styles.mealsErrorText}>{mealsError}</Text>
              </View>
            ) : meals.length === 0 ? (
              <View style={styles.mealsEmptyContainer}>
                <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                <Text style={styles.mealsEmptyText}>No meals scheduled for this day</Text>
              </View>
            ) : (
              <>
                <View style={styles.mealsGrid}>
                  {meals.map((meal, index) => (
                    <View key={`${meal.id}-${index}`} style={styles.mealCardShadow}>
                      <TouchableOpacity>
                        <ImageBackground source={meal.source} style={styles.mealCard} imageStyle={styles.mealImage}>
                          <TouchableOpacity style={styles.heartBadge}>
                            <Ionicons name="heart" size={14} color="#fff" />
                          </TouchableOpacity>

                          <View style={styles.mealLabel}>
                            <Text style={styles.mealTitle}>{meal.title}</Text>
                            {meal.subtitle && (
                              <Text style={styles.mealDescription} numberOfLines={2}>
                                {meal.subtitle}
                              </Text>
                            )}
                            <Text style={styles.mealSubtitle} numberOfLines={1}>
                              {[
                                meal.calories ? `${meal.calories} kcal` : null,
                                meal.protein ? `${meal.protein}g Protein` : null,
                                meal.carbs ? `${meal.carbs}g Carbs` : null,
                                meal.fats ? `${meal.fats}g Fats` : null,
                              ].filter(Boolean).join(' • ') || 'Nutritional info not available'}
                            </Text>
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                
                {/* Swap Meals Button - Only show for today's date */}
                {isToday(selectedDate) && meals.length > 0 && (
                  <TouchableOpacity 
                    style={styles.swapMealsButton}
                    onPress={() => {
                      setShowSwapModal(true);
                      fetchAllWeeksMeals();
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="#fff" />
                    <Text style={styles.swapMealsButtonText}>Swap Meals</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Swap Meals Modal */}
      <Modal
        visible={showSwapModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          setShowSwapModal(false);
          setSelectedMealToSwap(null);
          setSwapMode(null);
          setActiveWeekTab(0);
          setActiveDayTab(0);
        }}
      >
        <TouchableOpacity
          style={styles.swapModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowSwapModal(false);
            setSelectedMealToSwap(null);
            setSwapMode(null);
            setActiveWeekTab(0);
            setActiveDayTab(0);
          }}
        >
          <TouchableOpacity
            style={styles.swapModalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.swapModalHeader}>
              <Text style={styles.swapModalTitle}>Swap Meals</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSwapModal(false);
                  setSelectedMealToSwap(null);
                  setSwapMode(null);
                  setActiveWeekTab(0);
                  setActiveDayTab(0);
                }}
              >
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Week Tabs */}
            <View style={styles.weekTabsContainer}>
              {[0, 1, 2, 3].map((weekIndex) => (
                <TouchableOpacity
                  key={weekIndex}
                  style={[
                    styles.weekTab,
                    activeWeekTab === weekIndex && styles.weekTabActive
                  ]}
                  onPress={() => setActiveWeekTab(weekIndex)}
                >
                  <Text 
                    style={[
                      styles.weekTabText,
                      activeWeekTab === weekIndex && styles.weekTabTextActive
                    ]}
                    numberOfLines={1}
                  >
                    Week {weekIndex + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Day Tabs - Only show when a meal is selected */}
            {selectedMealToSwap && (
              <View style={styles.dayTabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayTab,
                        activeDayTab === index && styles.dayTabActive
                      ]}
                      onPress={() => setActiveDayTab(index)}
                    >
                      <Text style={[
                        styles.dayTabText,
                        activeDayTab === index && styles.dayTabTextActive
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Week Meals */}
            <ScrollView style={styles.swapMealsScroll} contentContainerStyle={styles.swapMealsContent}>
              {!selectedMealToSwap ? (
                // Step 1: Show today's meals to select which one to swap
                <>
                  <Text style={styles.swapInstructions}>
                    Select which meal from today you want to swap:
                  </Text>
                  {meals && meals.length > 0 ? meals.map((meal, index) => (
                    <TouchableOpacity
                      key={`today-${meal.id}-${index}`}
                      style={styles.swapMealCard}
                      onPress={() => {
                        setSelectedMealToSwap({
                          ...meal,
                          weekIndex: 0, // Current week
                          mealIndex: index,
                        });
                        setSwapMode('selecting');
                      }}
                    >
                      <ImageBackground 
                        source={meal.source} 
                        style={styles.swapMealImage}
                        imageStyle={{ borderRadius: 12 }}
                      >
                        <View style={styles.swapMealOverlay}>
                          <Text style={styles.swapMealTitle}>{meal.title}</Text>
                          <Text style={styles.swapMealInfo}>
                            {meal.calories ? `${meal.calories} kcal` : ''} {meal.protein ? `• ${meal.protein}g Protein` : ''}
                          </Text>
                          <Text style={styles.swapMealCategory}>{meal.category || 'Meal'}</Text>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  )) : (
                    <View style={styles.swapNoMeals}>
                      <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                      <Text style={styles.swapNoMealsText}>No meals available for today</Text>
                    </View>
                  )}
                </>
              ) : allWeeksMeals[activeWeekTab]?.length > 0 ? (
                // Step 2: Show meals for selected week and day
                <>
                  <View style={styles.swapSelectedInfo}>
                    <Ionicons name="swap-horizontal" size={20} color="#07da63" />
                    <Text style={styles.swapSelectedText}>
                      Swapping: <Text style={styles.swapSelectedMeal}>{selectedMealToSwap.title}</Text>
                    </Text>
                  </View>
                  
                  {(() => {
                    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const selectedDayName = dayNames[activeDayTab];
                    
                    // Filter meals for the selected day
                    const mealsForDay = allWeeksMeals[activeWeekTab].filter(
                      meal => meal.dayIndex === activeDayTab
                    );
                    
                    if (mealsForDay.length === 0) {
                      return (
                        <View style={styles.swapNoMeals}>
                          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                          <Text style={styles.swapNoMealsText}>
                            No meals available for {selectedDayName}
                          </Text>
                        </View>
                      );
                    }
                    
                    return (
                      <>
                        <Text style={styles.swapInstructions}>
                          Select a meal from Week {activeWeekTab + 1} - {selectedDayName}:
                        </Text>
                        {mealsForDay.map((meal, index) => (
                          <TouchableOpacity
                            key={`week-${meal.id}-${index}`}
                            style={styles.swapMealCard}
                            onPress={() => {
                              handleSwapMeals(meal);
                            }}
                          >
                            <ImageBackground 
                              source={meal.source} 
                              style={styles.swapMealImage}
                              imageStyle={{ borderRadius: 12 }}
                            >
                              <View style={styles.swapMealOverlay}>
                                <Text style={styles.swapMealTitle}>{meal.title}</Text>
                                <Text style={styles.swapMealInfo}>
                                  {meal.calories ? `${meal.calories} kcal` : ''} {meal.protein ? `• ${meal.protein}g Protein` : ''}
                                </Text>
                                <Text style={styles.swapMealCategory}>{meal.category || 'Meal'}</Text>
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                        ))}
                      </>
                    );
                  })()}
                </>
              ) : (
                <View style={styles.swapNoMeals}>
                  <Ionicons name="restaurant-outline" size={48} color="#ccc" />
                  <Text style={styles.swapNoMealsText}>No meals available for Week {activeWeekTab + 1}</Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            {selectedMealToSwap && (
              <View style={styles.swapModalFooter}>
                <TouchableOpacity
                  style={styles.swapCancelButton}
                  onPress={() => {
                    setSelectedMealToSwap(null);
                    setSwapMode(null);
                    setActiveDayTab(0);
                  }}
                >
                  <Text style={styles.swapCancelText}>Cancel Selection</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="calendar" />
    </SafeAreaView>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 56,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },

  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9f8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  // Week Days
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },

  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: '#07da63',
    borderRadius: 12,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#07da63',
    borderRadius: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dayTextInactive: {
    color: '#ccc',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#07da63',
    fontWeight: '700',
  },
  mealIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#07da63',
  },

  // Selected Date Card
  selectedDateCard: {
    backgroundColor: '#f7fbf9',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  selectedDateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  mealInfoContainer: {
    marginBottom: 16,
  },
  mealInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  mealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mealPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#07da63',
  },
  
  // Meals Section
  mealsSection: {
    marginTop: 24,
  },
  mealsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  mealsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  mealsLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  mealsErrorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  mealsErrorText: {
    fontSize: 14,
    color: '#e96250',
    textAlign: 'center',
  },
  mealsEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  mealsEmptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealCardShadow: {
    width: '100%',
    marginBottom: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  mealCard: {
    height: 280,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  mealImage: { 
    borderRadius: 14 
  },
  heartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealLabel: {
    backgroundColor: 'rgba(7,218,99,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  mealTitle: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  mealDescription: { 
    color: '#f0fff0', 
    fontSize: 13, 
    marginTop: 4, 
    lineHeight: 18 
  },
  mealSubtitle: { 
    color: '#e8ffe5', 
    fontSize: 12, 
    marginTop: 4 
  },

  // Swap Meals Button
  swapMealsButton: {
    backgroundColor: '#07da63',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  swapMealsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Swap Modal Styles
  swapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  swapModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '95%',
    paddingBottom: 20,
  },
  swapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  swapModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: '#fafafa',
  },
  weekTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minHeight: 44,
  },
  weekTabActive: {
    backgroundColor: '#07da63',
    borderColor: '#07da63',
  },
  weekTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
  weekTabTextActive: {
    color: '#fff',
  },
  dayTabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginRight: 10,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  dayTabActive: {
    backgroundColor: '#07da63',
    borderColor: '#07da63',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  dayTabTextActive: {
    color: '#fff',
  },
  swapMealsScroll: {
    flexGrow: 1,
    maxHeight: '100%',
  },
  swapMealsContent: {
    padding: 20,
    paddingBottom: 60,
  },
  swapInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  swapMealCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  swapMealCardSelected: {
    borderColor: '#07da63',
  },
  swapMealImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  swapMealOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  swapMealTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  swapMealInfo: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  swapMealCategory: {
    color: '#e0e0e0',
    fontSize: 13,
    marginTop: 6,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  swapMealCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  swapSelectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f8f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: '#07da63',
  },
  swapSelectedText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  swapSelectedMeal: {
    fontWeight: '700',
    color: '#07da63',
    fontSize: 16,
  },
  swapNoMeals: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  swapNoMealsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  swapModalFooter: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  swapCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  swapCancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
});

