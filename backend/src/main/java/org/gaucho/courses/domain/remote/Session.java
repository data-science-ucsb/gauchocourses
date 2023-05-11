package org.gaucho.courses.domain.remote;

import com.fasterxml.jackson.annotation.*;
import java.io.Serializable;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Session implements Serializable {

    private static final long serialVersionUID = 1L;
    private String quarter;
    private String sessionNumber;
    private String firstDayOfClasses;
    private String firstDayOfFinals;
    private String lastDayOfClasses;
    private String lastDayOfFinals;
    private String lastDayToAddGrad;
    private String lastDayToAddUnderGrad;
    private String lastDayToCancel;
    private String lastDayToDropGrad;
    private String lastDayToDropUnderGrad;
}