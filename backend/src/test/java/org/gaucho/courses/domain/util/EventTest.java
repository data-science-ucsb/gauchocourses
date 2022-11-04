package org.gaucho.courses.domain.util;

import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.core.Event;
import org.gaucho.courses.domain.remote.TimeLocation;
import org.junit.Before;
import org.junit.Test;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class EventTest {

    // TODO: Event is abstract. What is the best way to test an abstract class? I just used the ClassSection subclass.

    private ClassSection _2to3_Mon_Fri = new ClassSection();
    private ClassSection _2to4_Mon_Fri = new ClassSection();
    private ClassSection _3to4_Mon_Fri = new ClassSection();

    private ClassSection _3to4_Tue = new ClassSection();
    private ClassSection _3to4_Tue_Thu = new ClassSection();
    private ClassSection _8to9_Tue_Thu = new ClassSection();

    private List<DayOfWeek> MonAndFri = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> MonAndWed = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Tues = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> TuesThurs = new ArrayList<DayOfWeek>();

    private LocalTime twoPM   = LocalTime.of(2,0);
    private LocalTime threePM = LocalTime.of(3,0);
    private LocalTime fourPM  = LocalTime.of(4,0);
    private LocalTime eightAM = LocalTime.of(8,0);
    private LocalTime nineAM  = LocalTime.of(9,0);

    @Before
    public void setUp() {
        MonAndFri.add(DayOfWeek.MONDAY);
        MonAndFri.add(DayOfWeek.FRIDAY);
        MonAndWed.add(DayOfWeek.MONDAY);
        MonAndWed.add(DayOfWeek.WEDNESDAY);
        Tues.add(DayOfWeek.TUESDAY);
        TuesThurs.add(DayOfWeek.TUESDAY);
        TuesThurs.add(DayOfWeek.THURSDAY);

        TimeLocation MonFri2to3     = new TimeLocation(MonAndFri, twoPM, threePM, "CHEM", "1");
        TimeLocation MonFri2to4     = new TimeLocation(MonAndFri, twoPM, fourPM, "CHEM", "1");
        TimeLocation MonFri3to4     = new TimeLocation(MonAndFri, threePM, fourPM, "CHEM", "1");
        TimeLocation Tues3to4       = new TimeLocation(Tues,      threePM, fourPM, "", "");
        TimeLocation TuesThurs3to4  = new TimeLocation(TuesThurs, threePM, fourPM, "", "");
        TimeLocation TuesThurs8to9  = new TimeLocation(TuesThurs, eightAM, nineAM, "", "");

        _2to3_Mon_Fri.addTimeAndPlace(MonFri2to3);
        _2to4_Mon_Fri.addTimeAndPlace(MonFri2to4);
        _3to4_Mon_Fri.addTimeAndPlace(MonFri3to4);

        _3to4_Tue.addTimeAndPlace(Tues3to4);
        _3to4_Tue_Thu.addTimeAndPlace(TuesThurs3to4);
        _8to9_Tue_Thu.addTimeAndPlace(TuesThurs8to9);
    }

    @Test
    public void conflictsWith() {
        assertTrue(_2to3_Mon_Fri.conflictsWith(_2to3_Mon_Fri));
        assertTrue(_2to3_Mon_Fri.conflictsWith(_2to4_Mon_Fri));
        assertFalse(_2to3_Mon_Fri.conflictsWith(_3to4_Mon_Fri));
        assertFalse(_2to3_Mon_Fri.conflictsWith(_3to4_Tue));
        assertTrue(_3to4_Tue.conflictsWith(_3to4_Tue_Thu));
        assertFalse(_8to9_Tue_Thu.conflictsWith(_3to4_Tue_Thu));
    }

    @Test
    public void conflictsWithAny() {
        assertTrue(
            _2to4_Mon_Fri.conflictsWithAny(Arrays.asList(_2to4_Mon_Fri))
        );
        assertTrue(
            _2to4_Mon_Fri.conflictsWithAny(Arrays.asList(_2to4_Mon_Fri, _3to4_Tue))
        );
        assertFalse(
            _2to3_Mon_Fri.conflictsWithAny(Arrays.asList(_3to4_Tue_Thu, _3to4_Tue, _8to9_Tue_Thu))
        );
    }

    @Test
    public void eventsHaveConflicts() {
        assertTrue(
            Event.eventsHaveConflicts(Arrays.asList(_2to4_Mon_Fri, _2to3_Mon_Fri))
        );
        assertTrue(
            Event.eventsHaveConflicts(Arrays.asList(_2to4_Mon_Fri, _2to3_Mon_Fri, _3to4_Tue, _3to4_Tue_Thu))
        );
        assertFalse(
            Event.eventsHaveConflicts(Arrays.asList(_2to4_Mon_Fri, _3to4_Tue_Thu))
        );
        assertFalse(
            Event.eventsHaveConflicts(Arrays.asList(_2to4_Mon_Fri, _3to4_Tue_Thu))
        );
        assertTrue(
                Event.eventsHaveConflicts(Arrays.asList(_2to4_Mon_Fri, _3to4_Tue_Thu, _3to4_Tue))
        );
    }

    @Test
    public void removeConflicts() {
        List<ClassSection> required = Arrays.asList(_2to3_Mon_Fri);
        List<ClassSection> optional = Arrays.asList(_2to3_Mon_Fri, _3to4_Tue);

        assertEquals( Arrays.asList( _3to4_Tue), Event.removeConflicts(required, optional));

        required = Arrays.asList(_2to3_Mon_Fri, _8to9_Tue_Thu);
        optional = Arrays.asList(_2to4_Mon_Fri, _3to4_Tue);

        assertEquals(Arrays.asList(_3to4_Tue), Event.removeConflicts(required, optional));
    }

    @Test
    public void getTimeLocations() {
        ClassSection event = new ClassSection();
        TimeLocation time = new TimeLocation(MonAndFri, twoPM, threePM, "","");
        List<TimeLocation> times = Arrays.asList(time);
        event.setTimeLocations(times);

        assertEquals(times, event.getTimeLocations());
    }

    @Test
    public void findConflicts() {
    }

    @Test
    public void getDaysOfWeek() {
    }

    @Test
    public void getBeginTime() {
    }

    @Test
    public void canEqual() {
    }

    @Test
    public void testHashCode() {
    }

    @Test
    public void testToString() {
    }
}