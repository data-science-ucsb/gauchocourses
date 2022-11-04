package org.gaucho.courses.domain.scheduling;

import org.gaucho.courses.TestObjects;
import org.gaucho.courses.domain.core.Event;
import org.junit.Assert;
import org.junit.jupiter.api.Test;
import org.mockito.internal.util.collections.Sets;

import java.time.DayOfWeek;
import java.util.*;

/**
 * TODO: This test should be refactored to test for these scenarios:
 * - single event, single day
 * - multiple events, all different days
 * - multiple events, all same day
 * - multiple events, some same day, some on different days
 *
 * Each scenario should test *all* the attributes for that scenario
 */
class ScheduleSortingAttributesTest {

    private TestObjects testObjects = new TestObjects();

    private final List<? extends Event> singleEvent = Collections.unmodifiableList(
        Collections.singletonList(testObjects.getSectionA1_1()));

    private final List<? extends Event> twoEvents = Collections.unmodifiableList(
        Arrays.asList(
            testObjects.getSectionA1_1(),
            testObjects.getSectionA1_2())
        );

    private final List<? extends Event> realisticSchedule = Collections.unmodifiableList(
        Arrays.asList(
            testObjects.getLectureA1(),
            testObjects.getSectionA1_1(),
            testObjects.getSectionA1_2(),
            testObjects.getSectionA1_3()
        ));

    final List<? extends Event> conflictingEvents = Collections.unmodifiableList(
        Arrays.asList(
                /* TODO */
        ));

    @Test
    void listOfEventsCannotConflict() {
    }

    @Test
    void getTotalMinutesBetweenEvents_singleEvent() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(singleEvent);
        Assert.assertEquals(0L, attributes.getTotalMinutesBetweenEvents());
    }

    @Test
    void getTotalMinutesBetweenEvents_twoEvents() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(twoEvents);
        Assert.assertEquals(0L, attributes.getTotalMinutesBetweenEvents());
    }

    @Test
    void getTotalMinutesBetweenEvents_realisticSchedule() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(realisticSchedule);
        Assert.assertEquals(360, attributes.getTotalMinutesBetweenEvents());
    }

    ///////////

    @Test
    void getTotalMinutesFromMidnight_singleEvent() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(singleEvent);
        //   Assert.assertEquals(540, attributes.getTotalMinutesFromMidnight());
    }


    @Test
    void getTotalMinutesFromMidnight_twoEvents() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(twoEvents);
        Assert.assertEquals((540+660), attributes.getTotalMinutesFromMidnight());
    }

    @Test
    void getTotalMinutesFromMidnight_realisticSchedule() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(realisticSchedule);
        Assert.assertEquals(3480, attributes.getTotalMinutesFromMidnight());
    }

    ///////////

    @Test
    void getDaysWithEvents_singleEvent() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(singleEvent);
        final Set<DayOfWeek> expected = Sets.newSet(DayOfWeek.FRIDAY);
        Assert.assertEquals(expected, attributes.getDaysWithEvents());
    }

    @Test
    void getDaysWithEvents_twoEvents() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(twoEvents);
        final Set<DayOfWeek> expected = Sets.newSet(DayOfWeek.MONDAY, DayOfWeek.FRIDAY);
        Assert.assertEquals(expected, attributes.getDaysWithEvents());
    }

    @Test
    void getDaysWithEvents_realisticSchedule() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(realisticSchedule);
        final Set<DayOfWeek> expected = Sets.newSet(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY);
        Assert.assertEquals(expected, attributes.getDaysWithEvents());
    }

    ///////////

    @Test
    void getEarliestBeginTime() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(singleEvent);
        ScheduleSortingAttributes attributes2 = new ScheduleSortingAttributes(twoEvents);
        ScheduleSortingAttributes attributes3 = new ScheduleSortingAttributes(realisticSchedule);

        Assert.assertEquals(testObjects.getNineAM(), attributes.getEarliestBeginTime());
        Assert.assertEquals(testObjects.getNineAM(), attributes2.getEarliestBeginTime());
        Assert.assertEquals(testObjects.getNineAM(), attributes3.getEarliestBeginTime());
    }

    @Test
    void getLatestEndTime() {
        ScheduleSortingAttributes attributes = new ScheduleSortingAttributes(singleEvent);
        ScheduleSortingAttributes attributes2 = new ScheduleSortingAttributes(twoEvents);
        ScheduleSortingAttributes attributes3 = new ScheduleSortingAttributes(realisticSchedule);

        Assert.assertEquals(testObjects.getTenAM(), attributes.getLatestEndTime());
        Assert.assertEquals(testObjects.getNoon(), attributes2.getLatestEndTime());
        Assert.assertEquals(testObjects.getThreePM(), attributes3.getLatestEndTime());
    }
}