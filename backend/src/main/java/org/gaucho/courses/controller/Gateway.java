package org.gaucho.courses.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.gaucho.courses.controller.service.GatewayService;
import org.gaucho.courses.domain.remote.Department;
import org.gaucho.courses.domain.remote.Quarter;
import org.gaucho.courses.domain.remote.Class;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Controller
@RequestMapping("remote/")
public class Gateway {

    @Autowired
    private GatewayService service;

    private final CacheControl cacheControl = CacheControl
        .maxAge(30, TimeUnit.MINUTES)
        .noTransform()
        .cachePublic();

    @RequestMapping("academics/quartercalendar/v1/quarters/**")
    public ResponseEntity<Quarter[]> getQuarter(@RequestParam Map<String, String> allQueryParams, HttpServletRequest request) {
        final Quarter[] quarters = service.getQuarter(allQueryParams, request);

        if (quarters != null) {
            return ResponseEntity
                .ok()
                .cacheControl(cacheControl)
                .body(quarters);
        } else {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @RequestMapping("academics/curriculums/v1/classes/**")
    public ResponseEntity<PaginatedClasses> getClassSections(@RequestParam Map<String, String> allQueryParams, HttpServletRequest request) {
        final PaginatedClasses classes = service.getClassSections(allQueryParams, request);

        if (classes != null) {
            return ResponseEntity
                .ok()
                .cacheControl(cacheControl)
                .body(classes);
        } else {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @RequestMapping("students/lookups/v1/departments/**")
    public ResponseEntity<Department[]> getDepartments(@RequestParam Map<String, String> allQueryParams, HttpServletRequest request) {
        final Department[] departments = service.getDepartments(allQueryParams, request);

        if (departments != null) {
            return ResponseEntity
                .ok()
                .cacheControl(cacheControl)
                .body(departments);
        } else {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }

    @Data
    @NoArgsConstructor
    public static class PaginatedClasses implements Serializable {

        private static final long serialVersionUID = 1L;

        @JsonProperty("pageNumber") private Integer pageNumber;
        @JsonProperty("pageSize") private Integer pageSize;
        @JsonProperty("total") private Integer total;
        @JsonProperty("classes") private List<Class> classes;
    }

}