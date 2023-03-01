package org.gaucho.courses.domain.scheduling;

import lombok.Data;
import one.util.streamex.StreamEx;
import org.gaucho.courses.domain.core.Event;
import org.gaucho.courses.domain.remote.TimeLocation;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import static java.time.temporal.ChronoUnit.MINUTES;


/**
 * Possible enhancements for later:
 * - Calculate the metrics in a single pass through the list. Currently it passes through for each metric
 *   - Some metrics need to group the
 * - The scoring for totalMinutesFromMidnight should be done by the earliest event for that day. Currently it calculates
 *   based on all events for all days.
 */
@Embeddable
@Data
public class ScheduleSortingAttributes {

    public ScheduleSortingAttributes() { }

    @Column(columnDefinition = "int8 default 0")
    private long totalMinutesBetweenEvents = 0;

    @Column(columnDefinition = "int8 default 0")
    private long totalMinutesFromMidnight = 0;

    @ElementCollection
    private Set<DayOfWeek> daysWithEvents = new HashSet<>();

    // for code refactoring
    @ElementCollection
    private Map<DayOfWeek, List<TimeLocation>> groupedTimes = new HashMap<DayOfWeek, List<TimeLocation>>();

    private LocalTime earliestBeginTime = LocalTime.MAX;

    private LocalTime latestEndTime = LocalTime.MIN;

    /**
     * Calculates metrics about the schedule which can be used to sort or otherwise compare schedules.
     * @param scheduledEvents If Events conflict, the attributes are not calculated.
     */
    public ScheduleSortingAttributes(List<? extends Event> scheduledEvents) {
        if (scheduledEvents.size() != 0 && !Event.eventsHaveConflicts(scheduledEvents)) {
            List<TimeLocation> allTimeLocations = scheduledEvents
                .stream()
                .map(Event::getTimeLocations)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());

            calculateTotalMinutesFromMidnight(allTimeLocations);
            calculateTotalMinutesBetweenEvents(allTimeLocations);
            calculateDaysWithEvents(allTimeLocations);
            calculateMinAndMaxTimes(allTimeLocations);
        }
    }

    private void calculateMinAndMaxTimes(List<TimeLocation> timeLocations) {
        timeLocations.forEach((TimeLocation tl) -> {
            this.setEarliestBeginTime(
                tl.getBeginTime().isBefore(this.getEarliestBeginTime()) ? tl.getBeginTime() : this.getEarliestBeginTime()
            );

            this.setLatestEndTime(
                tl.getEndTime().isAfter(this.getLatestEndTime()) ? tl.getEndTime() : this.getLatestEndTime()
            );
        });
    }

    private Long minutesBetweenTimesAndPlaces(List<TimeLocation> times) {
        return StreamEx.of(times)
            .pairMap((TimeLocation t1, TimeLocation t2) -> MINUTES.between(t1.getEndTime(), t2.getBeginTime()))
            .reduce(0L, (a, b) -> a + b);
    }

    private void calculateTotalMinutesBetweenEvents(List<TimeLocation> allTimesAndPlaces) {
        groupedTimes.clear();
        groupTimeLocationByDay(allTimesAndPlaces);

        // Sort the values. TODO: Replace List<TimeLocation> with SortedSet<TimeLocation>
        groupedTimes
            .values()
            .forEach(list -> list.sort(TimeLocation::compareTo));

        // Reduce the list of lists to a double
        this.totalMinutesBetweenEvents = groupedTimes
            .values()
            .stream()
            .map(this::minutesBetweenTimesAndPlaces)
            .reduce(0L, (a, b) -> a + b);
    }

    private void calculateTotalMinutesFromMidnight(List<TimeLocation> allTimesAndPlaces) {
        groupedTimes.clear();
        groupTimeLocationByDay(allTimesAndPlaces);

        this.totalMinutesFromMidnight = groupedTimes
            .values()
            .stream()
            .mapToLong(this::totalMinutesFromMidnight)
            .reduce(0L, (a,b) -> a + b);
    }

    public Long totalMinutesFromMidnight(List<TimeLocation> times) {
        return times
            .stream()
            .mapToLong(timeAndPlace -> MINUTES.between(LocalTime.MIDNIGHT, timeAndPlace.getBeginTime()))
            .sum();
    }

    private void calculateDaysWithEvents(List<TimeLocation> allTimesAndPlaces) {
        this.daysWithEvents = allTimesAndPlaces
            .stream()
            .map(TimeLocation::getFullDays)
            .flatMap(Collection::stream)
            .collect(Collectors.toSet());
    }

    private void groupTimeLocationByDay(List<TimeLocation> allTimesAndPlaces)
    {
        // Group timeLocations by day in groupedTimes
        allTimesAndPlaces.forEach((TimeLocation timeLocation) ->
            timeLocation.getFullDays().forEach((DayOfWeek dayOfWeek) -> {
                // TODO: clean this up using Map.computeIfAbsent(...)
                if (groupedTimes.containsKey(dayOfWeek)) {
                    groupedTimes.get(dayOfWeek).add(timeLocation);
                } else {
                    groupedTimes.put(dayOfWeek, new ArrayList<>());
                    groupedTimes.get(dayOfWeek).add(timeLocation);
                }
            })
        );
    }

}
