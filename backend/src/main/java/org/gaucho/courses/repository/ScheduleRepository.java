package org.gaucho.courses.repository;

import org.gaucho.courses.domain.scheduling.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * Returns all schedules that contain the given email. Returns an empty list if
     * there are no schedules for the given email.
     * @param userEmail User's email address.
     */
    List<Schedule> findByUserEmail(String userEmail);

}
