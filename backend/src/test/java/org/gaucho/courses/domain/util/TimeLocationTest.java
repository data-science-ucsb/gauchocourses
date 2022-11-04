package org.gaucho.courses.domain.util;

import org.gaucho.courses.domain.remote.TimeLocation;
import org.junit.Before;
import org.junit.Test;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class TimeLocationTest {

    private List<DayOfWeek> MonAndFri = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> MonAndWed = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Tues = new ArrayList<DayOfWeek>();

    private LocalTime twoPM = LocalTime.of(2,0);
    private LocalTime threePM = LocalTime.of(3,0);
    private LocalTime fourPM =
            LocalTime.of(4,0);

    private TimeLocation MonFri2to3;
    private TimeLocation MonFri2to4;
    private TimeLocation MonFri3to4;
    private TimeLocation Tues3to4;

    @Before
    public void setUp() {
        MonAndFri.add(DayOfWeek.MONDAY);
        MonAndFri.add(DayOfWeek.FRIDAY);
        MonAndWed.add(DayOfWeek.MONDAY);
        MonAndWed.add(DayOfWeek.WEDNESDAY);
        Tues.add(DayOfWeek.TUESDAY);

        MonFri2to3 = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        MonFri2to4 = new TimeLocation(MonAndFri, twoPM, fourPM, "CHEM", "1");
        MonFri3to4 = new TimeLocation(MonAndFri, threePM, fourPM, "CHEM", "1");
        Tues3to4 = new TimeLocation(Tues, threePM, fourPM, "", "");
    }

    @Test
    public void conflictsWith() {
        // Directly conflicting times
        assertTrue(MonFri2to3.conflictsWith(MonFri2to4));
        assertTrue(MonFri2to4.conflictsWith(MonFri2to3));

        // Adjacent times
        assertFalse(MonFri2to3.conflictsWith(MonFri3to4));
        assertFalse(MonFri3to4.conflictsWith(MonFri2to3));

        // Conflicts with itself
        assertTrue(MonFri2to3.conflictsWith(MonFri2to3));

        // Different days
        assertFalse(MonFri2to3.conflictsWith(Tues3to4));
    }

    @Test
    public void setDays() {
        // Dummy object to change the times
        TimeLocation t1  = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");

        t1.setFullDays("M");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.MONDAY));

        t1.setFullDays("T");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.TUESDAY));

        t1.setFullDays("W");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.WEDNESDAY));

        t1.setFullDays("R");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.THURSDAY));

        t1.setFullDays("F");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.FRIDAY));

        t1.setFullDays("MW");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY));

        t1.setFullDays("MF");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.MONDAY,  DayOfWeek.FRIDAY));

        t1.setFullDays("TR");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.TUESDAY, DayOfWeek.THURSDAY));

        t1.setFullDays("MTWRF");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY));

        // Test whitespace

        t1.setFullDays("M  W ");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY));

        t1.setFullDays(" T R ");
        assertEquals(t1.getFullDays(), Arrays.asList(DayOfWeek.TUESDAY, DayOfWeek.THURSDAY));

    }

    @Test
    public void getAndSetBeginTime() {
        // Dummy object to change the times
        TimeLocation t1  = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setBeginTime(threePM);
        assertEquals(threePM, t1.getBeginTime());
    }

    @Test
    public void getAndSetEndTime() {
        TimeLocation t1  = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setEndTime(threePM);
        assertEquals(threePM, t1.getEndTime());
    }

    @Test
    public void getAndSetEndTimeWithString() {
        TimeLocation t1 = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setEndTime("11:50");
        assertEquals(LocalTime.of(11, 50), t1.getEndTime());

        t1.setEndTime("14:50");
        assertEquals(LocalTime.of(14, 50), t1.getEndTime());

        t1.setEndTime("20:00");
        assertEquals(LocalTime.of(20, 0), t1.getEndTime());
    }

    @Test
    public void getAndSetBeginTimeWithString() {
        TimeLocation t1 = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setBeginTime("11:50");
        assertEquals(LocalTime.of(11, 50), t1.getBeginTime());

        t1.setBeginTime("14:50");
        assertEquals(LocalTime.of(14, 50), t1.getBeginTime());

        t1.setBeginTime("20:00");
        assertEquals(LocalTime.of(20, 0), t1.getBeginTime());
    }

    @Test
    public void getAndSetRoom() {
        TimeLocation t1 = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setRoom("new room");
        assertEquals("new room", t1.getRoom());
    }

    @Test
    public void getAndSetBuilding() {
        TimeLocation t1 = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        t1.setBuilding("new building");
        assertEquals("new building", t1.getBuilding());
    }

    @Test
    public void equals() {
        assertTrue(MonFri3to4.equals(MonFri3to4));
        assertEquals(MonFri3to4, MonFri3to4);

        assertFalse(Tues3to4.equals(MonFri2to4));
        assertNotEquals(Tues3to4, MonFri2to4);

    }
}