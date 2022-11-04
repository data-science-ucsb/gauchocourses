package org.gaucho.courses.domain.scheduling;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import org.gaucho.courses.domain.core.Event;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "schedules")
@Entity(name = "custom_events")
public class CustomEvent extends Event {

    private static final long serialVersionUID = 1L;

    @ManyToMany(mappedBy = "customEvents")
    @JsonBackReference
    private Set<Schedule> schedules = new HashSet<>();

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    private String name;

    public void addSchedule(Schedule schedule) {
        this.schedules.add(schedule);
    }

}
