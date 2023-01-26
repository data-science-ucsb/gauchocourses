package org.gaucho.courses.domain.core;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.gaucho.courses.domain.remote.TimeLocation;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core parent class for all schedule-able events. Provides methods for finding conflicting events.
 */
@Data
public abstract class Event implements Serializable {

    /**
     *
     */
    private static final long serialVersionUID = 1L;

    @JsonProperty("timeLocations")
    protected List<TimeLocation> timeLocations = new ArrayList<>();

    /**
     * Returns true if this Event instance conflicts with the given Event. False otherwise.
     * @param event Another event object.
     * @return boolean. True if the two events conflict, false otherwise.
     */
    public boolean conflictsWith(Event event) {
        return this.getTimeLocations()
            .stream()
            .flatMap((TimeLocation a) -> event
                .getTimeLocations()
                .stream()
                .map(a::conflictsWith))
            .anyMatch(a->a);
    }

    /**
     * Adds a time and place to this Event.
     * @param timeLocation a TimeLocation instance.
     */
    public void addTimeAndPlace(TimeLocation timeLocation) {
        this.timeLocations.add(timeLocation);
    }

    // Static Methods

    /**
     * Returns true if this event conflicts with any in the given list
     * @param events List of events to compare to
     * @return true if this conflicts with any in the list, false otherwise.
     */
    public <T extends Event> boolean conflictsWithAny(List<T> events) {
        return events.stream().anyMatch((T event) -> event.conflictsWith(this));
    }

    public <T extends Event> boolean conflictsWithAll(List<T> events) {
        return events.stream().allMatch((T event) -> event.conflictsWith(this));
    }

    /**
     * Returns true if any event in the List conflicts any other Event. (Does not compare events to themselves.)
     * @param events A list of Event instances
     * @return true if any Event in the List conflicts any other Event
     */
    public static <T extends Event> boolean eventsHaveConflicts(List<T> events) {
        // Need to offset by 1 in inner loop so events are not compared to themselves
        for (int j = 0; j < events.size(); j++)
            for (int i = j + 1; i < events.size(); i++) {
                Event event = events.get(i);
                Event event1 = events.get(j);
                if (event.conflictsWith(event1)) return true;
            }
        return false; // No conflicts
    }

    /**
     * Filters optionalEvents to events that do not conflict with all in requiredEvents
     * @param requiredEvents A list of Event instances
     * @param optionalEvents A list of Event instances
     */
    public static <L extends Event, R extends Event> List<L> removeConflicts(final List<R> requiredEvents,
                                                                             final List<L> optionalEvents) {
        return optionalEvents
            .stream()
            .filter(a -> !a.conflictsWithAny(requiredEvents))
            .collect(Collectors.toList());
    }

}
