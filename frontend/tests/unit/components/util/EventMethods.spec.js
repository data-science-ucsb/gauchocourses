import { anyEventsConflict, allCombinationsOfLecturesConflict } from '@/components/util/event-methods.js';

describe('EventMethods: eventsConflict()', () => {
   const mon_wed_930_to_1045 = {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: "M W    ",
            beginTime: "09:30:00",
            endTime: "10:45:00",
            fullDays: [
               "MONDAY",
               "WEDNESDAY"
            ]
         }
      ]
   };

   const mon_930_to_10 = {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: "M      ",
            beginTime: "09:30:00",
            endTime: "10:00:00",
            fullDays: [
               "MONDAY"
            ]
         }
      ]
   };

   const mon_1400_to_1500 = {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: "M      ",
            beginTime: "14:00:00",
            endTime: "15:00:00",
            fullDays: [
               "MONDAY"
            ]
         }
      ]
   }

   const tues_1400_to_1500 = {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: " T     ",
            beginTime: "14:00:00",
            endTime: "15:00:00",
            fullDays: [
               "TUESDAY"
            ]
         }
      ]
   };

   const tues_thurs_1400_to_1430 = {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: " T R    ",
            beginTime: "14:00:00",
            endTime: "14:30:00",
            fullDays: [
               "TUESDAY",
               "THURSDAY"
            ]
         }
      ]
   };

   const mon_900_to_10_tues_1400_to_1500 =  {
      /* other properties removed for brevity */
      timeLocations: [
         {
            days: "M      ",
            beginTime: "09:30:00",
            endTime: "10:00:00",
            fullDays: [
               "MONDAY"
            ]
         }, {
            days: " T     ",
            beginTime: "14:00:00",
            endTime: "15:00:00",
            fullDays: [
               "TUESDAY"
            ]
         }
      ]
   }

   describe('allCombinationsOfLecturesConflict(): ', () => {
      const lectureA = [mon_930_to_10, mon_1400_to_1500].map(obj => ({...obj, isLecture: true, courseId: 'A'}));
      const lectureB = [mon_1400_to_1500, tues_1400_to_1500].map(obj => ({...obj, isLecture: true, courseId: 'B'}));
      
      it('when the list has at least one non-conflicting combination of lectures it returns false', () => {
         const nonConflictingLectures = [lectureA[0], lectureB[0]];
         expect(allCombinationsOfLecturesConflict(nonConflictingLectures)).toBe(false);
      });
      
      it('when the list does not have at least one non-conflicting combination of lectures it returns true', () => {
         const conflictingLectures = [lectureA[1], lectureB[0]];
         expect(allCombinationsOfLecturesConflict(conflictingLectures)).toBe(true);
      });
   })

   describe('eventsConflict(): when the list has conflicting events', () => {
      const onlyConflictingEvents = [mon_wed_930_to_1045, mon_930_to_10];
      const conflictingAndNonConflictingEvents = onlyConflictingEvents.concat(tues_1400_to_1500);
      const multipleConflictingEvents = conflictingAndNonConflictingEvents.concat(tues_thurs_1400_to_1430);
      const multiple_timelocations = [mon_930_to_10, mon_900_to_10_tues_1400_to_1500]

      it('returns true', () => {
         expect(anyEventsConflict(onlyConflictingEvents)).toBe(true);
         expect(anyEventsConflict(conflictingAndNonConflictingEvents)).toBe(true);
         expect(anyEventsConflict(multipleConflictingEvents)).toBe(true);
         expect(anyEventsConflict(multiple_timelocations)).toBe(true);
      });
   });

   describe('eventsConflict(): when the list does not have conflicting events', () => {
      const no_conflicting_events = [mon_930_to_10, tues_1400_to_1500];
      const no_conflicting_events2 = [mon_wed_930_to_1045, tues_1400_to_1500];
      const no_conflicting_events3 = [mon_wed_930_to_1045, tues_thurs_1400_to_1430];
      const different_days_same_time = [mon_1400_to_1500, tues_1400_to_1500];
      const multiple_timelocations = [mon_1400_to_1500, mon_900_to_10_tues_1400_to_1500];

      it('returns false', () => {
         expect(anyEventsConflict(no_conflicting_events)).toBe(false);
         expect(anyEventsConflict(no_conflicting_events2)).toBe(false);
         expect(anyEventsConflict(no_conflicting_events3)).toBe(false);
         expect(anyEventsConflict(different_days_same_time)).toBe(false);
         expect(anyEventsConflict(multiple_timelocations)).toBe(false);
      });
   });

   describe('eventsConflict(): when the list has one event', () => {
      const single_event = [mon_930_to_10];
   
      it('returns false', () => {
         expect(anyEventsConflict(single_event)).toBe(false);
      });
   });

   describe('when the list is empty', () => {
      const no_events = [];
      
      it('returns false', () => {
         expect(anyEventsConflict(no_events)).toBe(false);
      });
   });
});