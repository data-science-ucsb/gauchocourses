package org.gaucho.courses.controller.service;

import org.assertj.core.util.Lists;
import org.assertj.core.util.Sets;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.scheduling.CourseAndClassIds;
import org.gaucho.courses.domain.scheduling.Schedule;
import org.junit.Assert;
import org.junit.jupiter.api.Test;
import org.gaucho.courses.TestObjects;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

class LazyCartesianProductSchedulerTest {

    private TestObjects testObjects = new TestObjects();
    private LazyCartesianProductScheduler scheduler;

    @Test
    void testMinimalSchedule() {
        List<ClassSection> classSections = Collections.unmodifiableList(Lists.list(
                testObjects.getLectureA1(),
                testObjects.getSectionA1_1(),
                testObjects.getSectionA1_2(),
                testObjects.getSectionA1_3(),
                testObjects.getStandAloneLectureC()
        ));

        scheduler = new LazyCartesianProductScheduler(classSections, null);

        scheduler.setClassSections(classSections);

        List<Schedule> schedules = scheduler.getSchedules(0, Integer.MAX_VALUE);

        // Assert schedules are unique
        Set<Schedule> uniqueSchedules = Sets.newHashSet(schedules);
        Assert.assertEquals(uniqueSchedules.size(), schedules.size());

        // Assert lecture A1 is in all schedules
        schedules.forEach((Schedule schedule) -> {
            CourseAndClassIds ids = schedule
                .getClasses()
                .stream()
                .filter((CourseAndClassIds id) -> id.getCourseId().equals(testObjects.getLectureA1().getCourseId()))
                .collect(Collectors.toList())
                .get(0);

            Assert.assertTrue(ids.getScheduledEnrollCodes().contains(testObjects.getLectureA1().getEnrollCode()));
        });

        // Assert one sectionA1_* is in all schedules
        List<String> sectionEnrollCodes = classSections
            .stream()
            .filter(classSection -> !classSection.isLecture())
            .map(ClassSection::getEnrollCode)
            .collect(Collectors.toList());

        List<String> courseAEnrollCodes = Lists.list(
            testObjects.getSectionA1_1().getEnrollCode(),
            testObjects.getSectionA1_2().getEnrollCode(),
            testObjects.getSectionA1_3().getEnrollCode());

        schedules.forEach((Schedule schedule) -> {
            List<String> scheduledEnrollCodes = schedule
                .getClasses()
                .stream()
                .map(CourseAndClassIds::getScheduledEnrollCodes)
                .flatMap(List::stream)
                .collect(Collectors.toList());

        Assert.assertFalse(Collections.disjoint(scheduledEnrollCodes, courseAEnrollCodes));
        });

        // Assert standalone lecture C is in all schedules
        schedules.forEach((Schedule schedule) -> {
            int occurancesOfC = schedule
                .getClasses()
                .stream()
                .filter(ids -> ids.getCourseId().equals(testObjects.getStandAloneLectureC().getCourseId()))
                .collect(Collectors.toList())
                .size();

            Assert.assertEquals(occurancesOfC, 1);
        });
    }

    @Test
    void testGettingBatchesOfSchedules() {
        List<ClassSection> classSections = Collections.unmodifiableList(Lists.list(
                testObjects.getLectureA1(),
                testObjects.getSectionA1_1(),
                testObjects.getSectionA1_2(),
                testObjects.getSectionA1_3(),
                testObjects.getLectureB(),
                testObjects.getSectionB_1(),
                testObjects.getSectionB_2()
        ));

        scheduler = new LazyCartesianProductScheduler(classSections, null);

        List<Schedule> allSchedules = scheduler.getSchedules(0, Integer.MAX_VALUE);
        List<Schedule> schedules1 = scheduler.getSchedules(0, 3);
        List<Schedule> schedules2 = scheduler.getSchedules(scheduler.getLastIndex(), Integer.MAX_VALUE);

        Assert.assertEquals(3, schedules1.size());

        // schedules2.size should be the difference between the other sizes
        Assert.assertEquals(allSchedules.size()-schedules1.size(), schedules2.size());

        // Check reproducibility
        List<Schedule> schedules3 = scheduler.getSchedules(3, 2);
        List<Schedule> schedules4 = scheduler.getSchedules(3, 2);

        // TODO: Look into implementing equals and hashcode for Schedule manually. The comparison for sortingAttributes
        // throws off the comparison of two Schedules
        Assert.assertEquals(schedules3.size(), schedules4.size());
        for (int i = 0; i < schedules3.size(); i++) {
            Assert.assertEquals(
                schedules3.get(i).getClasses(),
                schedules4.get(i).getClasses());
        }
    }
}