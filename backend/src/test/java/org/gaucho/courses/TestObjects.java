package org.gaucho.courses;

import lombok.Data;
import org.assertj.core.util.Lists;
import org.gaucho.courses.controller.ScheduleController;
import org.gaucho.courses.domain.remote.Class;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.scheduling.CustomEvent;
import org.gaucho.courses.domain.scheduling.Schedule;
import org.gaucho.courses.domain.remote.TimeLocation;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Holds mocked instances of most commmon classes for testing
 */
@Data
public class TestObjects {

    private List<DayOfWeek> Mon = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Tues = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Wed = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Thurs = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> Fri = new ArrayList<DayOfWeek>();

    private List<DayOfWeek> MonTues = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> MonWed = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> MonFri = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> TuesThurs = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> MonWedFri = new ArrayList<DayOfWeek>();
    private List<DayOfWeek> allWeekDays = new ArrayList<DayOfWeek>();

    private LocalTime eightAM = LocalTime.of(8,0);
    private LocalTime nineAM  = LocalTime.of(9,0);
    private LocalTime tenAM  = LocalTime.of(10,0);
    private LocalTime elevenAM  = LocalTime.of(11,0);
    private LocalTime noon  = LocalTime.of(12,0);
    private LocalTime onePM = LocalTime.of(13,0);
    private LocalTime twoPM   = LocalTime.of(14,0);
    private LocalTime threePM = LocalTime.of(15,0);
    private LocalTime fourPM  = LocalTime.of(16,0);
    private LocalTime fivePM  = LocalTime.of(17,0);
    private LocalTime sixPM  = LocalTime.of(18,0);
    private LocalTime sevenPM  = LocalTime.of(19,0);
    private LocalTime eightPM  = LocalTime.of(20,0);

    private Class classA = new Class();
    private Class classB = new Class();
    private Class classC = new Class();

    private ClassSection lectureA1 = new ClassSection();
    private ClassSection sectionA1_1 = new ClassSection();
    private ClassSection sectionA1_2 = new ClassSection();
    private ClassSection sectionA1_3 = new ClassSection();

    private ClassSection lectureA2 = new ClassSection();
    private ClassSection sectionA2_1 = new ClassSection();
    private ClassSection sectionA2_2 = new ClassSection();

    private ClassSection lectureB = new ClassSection();
    private ClassSection sectionB_1 = new ClassSection();
    private ClassSection sectionB_2 = new ClassSection();

    private ClassSection lectureConflictsWithLectureA = new ClassSection();

    private ClassSection standAloneLectureC = new ClassSection();

    private CustomEvent customEvent1 = new CustomEvent();
    private CustomEvent customEvent2 = new CustomEvent();

    private TimeLocation Mon11to12;
    private TimeLocation MonTues8to9;
    private TimeLocation MonWed12to1;
    private TimeLocation MonWed1to2;
    private TimeLocation MonFri2to3;
    private TimeLocation MonFri2to4;
    private TimeLocation MonFri3to4;
    private TimeLocation Tues3to4;
    private TimeLocation Tues5to6;
    private TimeLocation Tues4to6;
    private TimeLocation Tues8to9;
    private TimeLocation Wed10to11;
    private TimeLocation Wed11to12;
    private TimeLocation Wed3to4;
    private TimeLocation Wed5to6;
    private TimeLocation TuesThurs3to4;
    private TimeLocation TuesThurs8to9;
    private TimeLocation Fri9to10;
    private TimeLocation Fri11to12;

    private Schedule schedule = new Schedule();

    /**
     * Initializes the testing objects
     */
    public TestObjects() {
        setUpTimesAndPlaces();
        setUpClassSections();
        setUpSchedule();
    }

    private void setUpClassSections() {
        // Class setup
        classA.setCourseId("MATH 3B");
        classB.setCourseId("ART 1A");
        classC.setCourseId("PSTAT 199");

        // Set section codes
        lectureA1.setSection("0100");
        sectionA1_1.setSection("0101");
        sectionA1_2.setSection("0102");
        sectionA1_3.setSection("0103");

        lectureA2.setSection("0100");
        sectionA2_1.setSection("0200");
        sectionA2_2.setSection("0201");

        lectureB.setSection("0100");
        sectionB_1.setSection("0101");
        sectionB_2.setSection("0102");

        standAloneLectureC.setSection("0100");

        lectureConflictsWithLectureA.setSection("0100");

        // Set courseId
        lectureA1.setCourseId("MATH3B");
        sectionA1_1.setCourseId("MATH3B");
        sectionA1_2.setCourseId("MATH3B");
        sectionA1_3.setCourseId("MATH3B");

        lectureA2.setCourseId("MATH3B");
        sectionA2_1.setCourseId("MATH3B");
        sectionA2_2.setCourseId("MATH3B");

        lectureB.setCourseId("ART1A");
        sectionB_1.setCourseId("ART1A");
        sectionB_2.setCourseId("ART1A");

        standAloneLectureC.setCourseId("PSTAT199");

        lectureConflictsWithLectureA.setCourseId("ENG_3");

        // Assign lectureSectionGroup
        lectureA1.setLectureSectionGroup("MATH3B_1");
        sectionA1_1.setLectureSectionGroup("MATH3B_1");
        sectionA1_2.setLectureSectionGroup("MATH3B_1");
        sectionA1_3.setLectureSectionGroup("MATH3B_1");

        lectureA2.setLectureSectionGroup("MATH3B_2");
        sectionA2_1.setLectureSectionGroup("MATH3B_2");
        sectionA2_2.setLectureSectionGroup("MATH3B_2");

        lectureB.setLectureSectionGroup("ART1A_1");
        sectionB_1.setLectureSectionGroup("ART1A_1");
        sectionB_2.setLectureSectionGroup("ART1A_1");

        standAloneLectureC.setLectureSectionGroup("PSTAT199");

        lectureConflictsWithLectureA.setLectureSectionGroup("ENG_3");

        // Assign times
        lectureA1.addTimeAndPlace(MonFri2to3);
        sectionA1_1.addTimeAndPlace(Fri9to10);
        sectionA1_2.addTimeAndPlace(Mon11to12);
        sectionA1_3.addTimeAndPlace(Wed10to11);

        lectureA2.addTimeAndPlace(TuesThurs8to9);
        sectionA2_1.addTimeAndPlace(Tues3to4);
        sectionA2_2.addTimeAndPlace(Tues5to6);

        lectureB.addTimeAndPlace(MonWed12to1);
        sectionB_1.addTimeAndPlace(Wed10to11);
        sectionB_2.addTimeAndPlace(Fri11to12);

        standAloneLectureC.addTimeAndPlace(Fri9to10);

        lectureConflictsWithLectureA.addTimeAndPlace(MonFri2to3);

        customEvent1.addTimeAndPlace(MonWed1to2);
        customEvent1.addTimeAndPlace(Wed10to11);
        
        // Assign enroll codes
        lectureA1.setEnrollCode("00000");
        sectionA1_1.setEnrollCode("00001");
        sectionA1_2.setEnrollCode("00002");
        sectionA1_3.setEnrollCode("00003");

        lectureA2.setEnrollCode("00004");
        sectionA2_1.setEnrollCode("00005");
        sectionA2_2.setEnrollCode("00006");

        lectureB.setEnrollCode("00007");
        sectionB_1.setEnrollCode("00008");
        sectionB_2.setEnrollCode("00009");

        standAloneLectureC.setEnrollCode("00010");

        lectureConflictsWithLectureA.setEnrollCode("00011");

        // Assign classSections to Courses
        classA.setClassSections(Lists.list(lectureA1, lectureA2,
                sectionA1_1, sectionA1_2, sectionA1_3, sectionA2_1, sectionA2_2));
        classB.setClassSections(Lists.list(lectureB, sectionB_1, sectionB_2));
        classC.setClassSections(Lists.list(standAloneLectureC));

        // Assign courseId to classSections
        classA.getClassSections().forEach(a -> a.setCourseId(classA.getCourseId()));
        classB.getClassSections().forEach(b -> b.setCourseId(classB.getCourseId()));
        classC.getClassSections().forEach(c -> c.setCourseId(classC.getCourseId()));
    }

    private void setUpTimesAndPlaces() {
        Mon.add(DayOfWeek.MONDAY);
        Tues.add(DayOfWeek.TUESDAY);
        Wed.add(DayOfWeek.WEDNESDAY);
        Thurs.add(DayOfWeek.THURSDAY);
        Fri.add(DayOfWeek.FRIDAY);

        MonTues.add(DayOfWeek.MONDAY); MonTues.add(DayOfWeek.TUESDAY);
        MonWed.add(DayOfWeek.MONDAY); MonWed.add(DayOfWeek.WEDNESDAY);
        MonFri.add(DayOfWeek.MONDAY); MonFri.add(DayOfWeek.FRIDAY);
        TuesThurs.add(DayOfWeek.TUESDAY); TuesThurs.add(DayOfWeek.THURSDAY);
        MonWedFri.add(DayOfWeek.MONDAY); MonWedFri.add(DayOfWeek.WEDNESDAY); MonWedFri.add(DayOfWeek.FRIDAY);

        Mon11to12      = new TimeLocation(Mon,     elevenAM, noon, "", "");
        MonTues8to9    = new TimeLocation(MonTues, eightAM, nineAM, "","");
        MonWed12to1    = new TimeLocation(MonWed,  noon,   onePM, "", "");
        MonWed1to2     = new TimeLocation(MonWedFri, onePM, twoPM, "", "");
        MonFri2to3     = new TimeLocation(MonFri,  twoPM,  threePM, "", "");
        MonFri2to4     = new TimeLocation(MonFri,  twoPM,  fourPM, "", "");
        MonFri3to4     = new TimeLocation(MonFri,  threePM, fourPM, "", "");
        Tues8to9       = new TimeLocation(Tues,     eightAM, nineAM, "", "");
        Tues3to4       = new TimeLocation(Tues,    threePM, fourPM, "", "");
        Tues5to6       = new TimeLocation(Tues,    fivePM,  sixPM, "", "");
        Tues4to6       = new TimeLocation(Tues,    fourPM,  sixPM, "", "");
        Wed10to11      = new TimeLocation(Wed,    tenAM,   elevenAM, "", "");
        Wed11to12      = new TimeLocation(Wed,    elevenAM, noon, "", "");
        Wed3to4        = new TimeLocation(Wed,    threePM,   fourPM, "", "");
        Wed5to6        = new TimeLocation(Wed,    fivePM,   sixPM, "", "");
        TuesThurs3to4  = new TimeLocation(TuesThurs, threePM, fourPM, "", "");
        TuesThurs8to9  = new TimeLocation(TuesThurs, eightAM, nineAM, "", "");
        Fri9to10       = new TimeLocation(Fri,       nineAM,  tenAM,"", "");
        Fri11to12      = new TimeLocation(Fri,       elevenAM, noon, "", "");
    }

    private void setUpSchedule() {
        schedule = new Schedule.ScheduleBuilder("20201", null)
            .setScheduledClasses(Lists.list(
                lectureA1, sectionA1_1, lectureB, sectionB_1))
            .setScheduledClasses(Lists.list(
                lectureA1, lectureA2, sectionA1_1, sectionA1_2, sectionA2_1, sectionA2_2,
                lectureB, sectionB_1, sectionB_2
            ))
            .build();
    }

}
