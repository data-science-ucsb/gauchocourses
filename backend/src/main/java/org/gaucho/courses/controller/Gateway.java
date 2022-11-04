package org.gaucho.courses.controller;

import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.controller.service.Proxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@Controller
@RequestMapping("remote/")
public class Gateway {

    @Autowired
    Proxy proxy;

    @RequestMapping("/**")
    public ResponseEntity<?> proxy(HttpServletRequest request) {
        Object response = proxy.proxyRequest(request);
        HttpStatus status = response == null ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.OK;

        return ResponseEntity.status(status).body(response);
    }

}
