package org.gaucho.courses.repository;

import org.gaucho.courses.domain.scheduling.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    
    /**
     * Returns all schedules that contain the given email. Returns an empty list if
     * there are no schedules for the given email.
     * @param userEmail User's email address.
     */
    List<Schedule> findByUserEmail(String userEmail);

}
