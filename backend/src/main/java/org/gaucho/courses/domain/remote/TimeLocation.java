package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import java.io.Serializable;


/**
 * @author Jason Freeberg
 * TODO: Assert that a begintime cannot be after the end time and visa versa. It's fine to add one of the times if the other has not yet been set.
 */
@Data
@Entity
@EqualsAndHashCode
@JsonPropertyOrder({
        "days",
        "beginTime",
        "endTime",
        "room",
        "building",
        "roomCapacity"
})
public class TimeLocation implements Comparable<TimeLocation>, Serializable {

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Long id;

    @JsonProperty("fullDays")
    @ElementCollection(fetch = FetchType.EAGER)
    private List<DayOfWeek> fullDays = new ArrayList<>();

    @JsonProperty
    private String days;

    @JsonSetter("days")
    public void setDays(String days) {
        this.days = days;
        if (days != null) setFullDays(days);
    }

    @JsonProperty("beginTime")
    private LocalTime beginTime;

    @JsonProperty("endTime")
    private LocalTime endTime;

    @JsonProperty("room")
    private String room;

    @JsonProperty("building")
    private String building;

    @JsonProperty("roomCapacity")
    private Integer roomCapacity;

    @JsonIgnore
    @Transient
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    // UCSB's class time format
    @Setter(AccessLevel.NONE)
    @Getter(AccessLevel.NONE)
    @Transient
    transient DateTimeFormatter format = DateTimeFormatter.ofPattern("HH:mm");

    // Internal map of UCSB's character codes to DayOfWeek
    @Setter(AccessLevel.NONE)
    @Getter(AccessLevel.NONE)
    private static final Map<String, DayOfWeek> dayMap = new HashMap<>();
    static {
        dayMap.put("M", DayOfWeek.MONDAY);
        dayMap.put("T", DayOfWeek.TUESDAY);
        dayMap.put("W", DayOfWeek.WEDNESDAY);
        dayMap.put("R", DayOfWeek.THURSDAY);
        dayMap.put("F", DayOfWeek.FRIDAY);
        dayMap.put("MONDAY", DayOfWeek.MONDAY);
        dayMap.put("TUESDAY", DayOfWeek.TUESDAY);
        dayMap.put("WEDNESDAY", DayOfWeek.WEDNESDAY);
        dayMap.put("THURSDAY", DayOfWeek.THURSDAY);
        dayMap.put("FRIDAY", DayOfWeek.FRIDAY);
    }

    // Constructors

    public TimeLocation() {}

    public TimeLocation(final List<DayOfWeek> fullDays, final LocalTime beginTime, final LocalTime endTime,
                        final String building, final String room) {
        this.setDaysOfWeekTemp(fullDays);
        this.setBeginTime(beginTime);
        this.setEndTime(endTime);
        this.setBeginTime(beginTime);
        this.setBuilding(building);
        this.setRoom(room);
    }

    /**
     * Determines if the time of the given timeLocation instance conflicts with this instance's time.
     * @param timeLocation Another timeLocation to compare against
     * @return boolean. True if the two conflict, false otherwise.
     */
    public boolean conflictsWith(final TimeLocation timeLocation) {
        // Calculate if there are fullDays in common
        final boolean eventsHaveDaysInCommon = this
                .getFullDays()
                .stream()
                .anyMatch((final DayOfWeek a) -> timeLocation.getFullDays().contains(a));

        if (eventsHaveDaysInCommon) {
            return isOverlapping(this, timeLocation);
        } else { // No fullDays in common, no overlap, no conflicts
            return false;
        }
    }

    /**
     * Returns true if the times overlap. Note: if the times are adjacent (10:00 to 10:30, and 10:30 to 11:00) then
     * this method will return true.
     * @param a Event instance
     * @param b Event instance
     * @return true if the times conflict.
     */
    private static boolean isOverlapping(final TimeLocation a, final TimeLocation b) {
        return a.getEndTime().isAfter(b.getBeginTime()) &&
                a.getBeginTime().isBefore(b.getEndTime());
    }

    /**
     * Sets the course's meeting fullDays using UCSB API's native syntax for fullDays ('M', 'T', 'W', 'R', 'F')
     * @param daysString String with UCSB API's fullDays ("MF", "TR", etc.)
     * @throws IllegalArgumentException If daysString does not contain one of the following strings: [M,T,W,R,F]
     */
    public void setFullDays(String daysString)  {
        daysString = daysString.replace(" ", "");
        if (!(daysString.contains("M") || daysString.contains("T") ||
                daysString.contains("W")|| daysString.contains("R")||
                daysString.contains("F"))) {
            // No op. Just skip it
            // TODO: This code smells bad. Maybe turn this into a computed property instead of a setter? Less overhead in the constructor that way.
        } else {
            this.getFullDays().clear();
            final String[] stringDays2 = daysString.split("");
            for (final String day: stringDays2) {
                this.getFullDays().add(dayMap.get(day));
            }
        }
    }

    /**
     * Sets the meeting fullDays with a List of LocalDate instances.
     * @param daysOfWeek List of DayOfWeek instances.
     */
    @Deprecated
    public void setDaysOfWeekTemp(final List<DayOfWeek> daysOfWeek) {
        this.fullDays = daysOfWeek;
    }

    /**
     * Used by Jackson to load JSON representation of TimeLocation to instance of this class.
     * @param daysOfWeek A List of strings. Ex: ["MONDAY", "FRIDAY"]
     */
    @JsonSetter
    public void setFullDays(final List<String> daysOfWeek) {
        this.setDaysOfWeekTemp(
            daysOfWeek
                .stream()
                .map(dayMap::get)
                .collect(Collectors.toList()));
    }

    /**
     * Sets the end time.
     * @param beginTime a LocalTime instance.
     */
    @JsonSetter
    public void setBeginTime(final LocalTime beginTime) {
        this.beginTime = beginTime;
    }

    /**
     * Sets the begin time.
     * @param endTime a LocalTime instance
     */
    @JsonSetter
    public void setEndTime(final LocalTime endTime) {
        this.endTime = endTime;
    }

    /**
     * Sets end time using the format in the UCSB API response. (HH:MM)
     * @param endTime Time as string, same format from UCSB's API response (HH:MM)
     */
    public void setEndTime(final String endTime) {
        this.setEndTime(LocalTime.parse(endTime, format));
    }

    /**
     * Sets begin time using the format in the UCSB API response. (HH:MM)
     * @param beginTime Time as string, same format from UCSB's API response (HH:MM)
     */
    public void setBeginTime(final String beginTime) {
        this.setBeginTime(LocalTime.parse(beginTime, format));
    }

    /**
     * Comparison of TimeLocation is determined only by which beginTime comes first.
     * @param other timeAndPlace to compare against
     * @return Negative integer, positive integer, or zero if *this* is begins before, after, or the same time as
     * other (respectively).
     */
    @Override
    public int compareTo(TimeLocation other) {
        // TODO: break ties with endTime?
        return this.getBeginTime().compareTo(other.getBeginTime());
    }
}

