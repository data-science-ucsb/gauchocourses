package org.gaucho.courses.controller.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.scheduling.CustomEvent;
import org.gaucho.courses.domain.scheduling.Schedule;
import org.gaucho.courses.domain.scheduling.ScheduleSortingAttributes;

import java.util.*;
import java.util.stream.Collectors;

/**
 * An implementation of the lazy cartesian product algorithm.
 * http://phrogz.net/lazy-cartesian-product
 */
@Data
@Slf4j
public class LazyCartesianProductScheduler {

    private String quarter;
    private String userEmail;
    private List<ClassSection> classSections;
    private List<CustomEvent> customEvents;
    private Map<String, ClassSection> lectures; // Map to lookup Lectures based on ClassSection.LectureSectionGroup
    private List<List<ClassSection>> groupedSections;

    private int numTotalCombinations;
    private List<Integer> dividends = new ArrayList<>();
    private List<Integer> moduli = new ArrayList<>();
    private int lastIndex;

    public LazyCartesianProductScheduler(List<ClassSection> classSections, List<CustomEvent> customEvents) {
        setClassSections(classSections);
        setCustomEvents(customEvents);

        // Setup the internals
        groupSections();
        initDividendsAndModuli();
    }

    public List<Schedule> getSchedules(int startIndex, int numSchedules) {
        List<Schedule> schedules = new ArrayList<>();
        while (schedules.size() < numSchedules) {
            if (startIndex >= this.getNumTotalCombinations()) {
                log.debug("Reached maximum number of section combinations.");
                break;
            }

            log.debug("Getting section combination for index "+startIndex);
            List<ClassSection> scheduledClassSections = getSectionCombination(startIndex);
            scheduledClassSections
                .stream()
                .filter(classSection -> !classSection.isLecture())
                .map(ClassSection::getLectureSectionGroup)
                .collect(Collectors.toSet())
                .forEach(group -> scheduledClassSections.add(lectures.get(group)));

            Schedule schedule = new Schedule.ScheduleBuilder(this.getQuarter(), this.getUserEmail())
                .setScheduledClasses(scheduledClassSections)
                .setSelectedClasses(classSections)
                .setCustomEvents(customEvents)
                .build();
            
            if (!schedule.getConflicting()) {
                schedules.add(schedule);  // Only return non-conflicting schedules
            } else {
                log.debug("Skipping conflicting schedule.");
            }
            startIndex += 1;
        }
        this.setLastIndex(startIndex);
        return schedules;
    }

    /**
     * Uses lazy cartesian product algorithm to get a combination of Sections at the given index
     * @param i The index of the desired combination
     * @return A list of events
     */
    private List<ClassSection> getSectionCombination(int i) {
        List<ClassSection> combo = new ArrayList<>();
        for (int groupIndex = 0; groupIndex < getGroupedSections().size(); groupIndex++) {
            int getAt = (i/dividends.get(groupIndex)) % moduli.get(groupIndex);
            combo.add(getGroupedSections().get(groupIndex).get(getAt));
        }
        return combo;
    }

    /**
     * Setup method.
     * Calculates the dividends and moduli in the algorithm described here (http://phrogz.net/lazy-cartesian-product)
     */
    private void initDividendsAndModuli() {
        int factor = 1;

        for (int i = this.getGroupedSections().size()-1; i >= 0; i--) {
            int size = this.getGroupedSections().get(i).size();
            dividends.add(factor);
            moduli.add(size);
            factor = factor * size;
        }

        Collections.reverse(dividends);
        Collections.reverse(moduli);

        this.setNumTotalCombinations(this.getGroupedSections()
            .stream()
            .map(List::size)
            .reduce(1, (a, b) -> a * b));
    }

    private void groupSections() {
        List<List<ClassSection>> courseGroups;
        List<List<ClassSection>> sectionGroups = new ArrayList<>();
        Map<String, ClassSection> lectureGroups = new HashMap<>();

        // Group classSections by course
        courseGroups = new ArrayList<>(
            this.getClassSections()
                .stream()
                .collect(
                    Collectors.groupingBy(ClassSection::getCourseId))
                .values()
        );

        // Put
        courseGroups.forEach((List<ClassSection> group) -> {
            if (group.stream().allMatch(ClassSection::isLecture)) { // If only lectures, put them in a group
                sectionGroups.add(group);
            } else { // Put sections into sectionGroups
                sectionGroups.add((
                    group
                        .stream()
                        .filter((ClassSection a) -> !a.isLecture()))
                        .collect(Collectors.toList())
                );

                // Put lecture into the lookup map (should only be one down here)
                group
                    .stream()
                    .filter((ClassSection::isLecture))
                    .forEach((ClassSection lecture) ->
                        lectureGroups.put(lecture.getLectureSectionGroup(), lecture));
            }
        });

        this.setGroupedSections(sectionGroups);
        this.setLectures(lectureGroups);
    }

}
