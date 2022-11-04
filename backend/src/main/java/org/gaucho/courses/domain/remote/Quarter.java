package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.*;
import java.io.Serializable;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Quarter implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private String quarter;
    private String qyy;
    private String name;
    private String category;
    private String academicYear;
    private String firstDayOfClasses;
    private String lastDayOfClasses;
    private String firstDayOfFinals;
    private String lastDayOfFinals;
    private String firstDayOfQuarter;
    private String lastDayOfSchedule;
    private String pass1Begin;
    private String pass2Begin;
    private String pass3Begin;
    private String feeDeadline;
    private String lastDayToAddUnderGrad;
    private String lastDayToAddGrad;
    private String lastDayThirdWeek;

}