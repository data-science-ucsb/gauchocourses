package org.gaucho.courses.controller.service;

import com.google.common.base.Joiner;
import lombok.extern.slf4j.Slf4j;
import org.gaucho.courses.controller.Gateway;
import org.gaucho.courses.domain.remote.Class;
import org.gaucho.courses.domain.remote.ClassSection;
import org.gaucho.courses.domain.remote.Department;
import org.gaucho.courses.domain.remote.Quarter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

@Slf4j
@Service
public class GatewayService {

    @Value("${gauchocourses.proxy.server}")
    private String SERVER;
    @Value("${gauchocourses.proxy.port}")
    private Integer PORT;
    @Value("${gauchocourses.proxy.scheme}")
    private String SCHEME;
    @Value("${gauchocourses.proxy.api-key-name}")
    private String API_KEY_NAME;
    @Value("${gauchocourses.proxy.api-key-value}")
    private String API_KEY_VALUE;

    /**
     * Proxies request to SERVER and attaches the API key as a header. The request body is not forwarded.
     * @param responseClass The class of the expected response from the remote server.
     * @param request ServletRequest object
     * @return The response from SERVER.
     */
    public <A> A proxyRequest(java.lang.Class<A> responseClass, HttpServletRequest request, Map<String, String> allQueryParams) throws URISyntaxException {
        URI uri;
        String restOfTheUrl = request.getRequestURI().substring(7);
//        String queryParams = request.getQueryString().replace("%20", " ");
        String queryParams = Joiner.on("&").withKeyValueSeparator("=").join(allQueryParams);

        uri = new URI(
            SCHEME,
            null,
            SERVER,
            PORT,
            restOfTheUrl,
            queryParams,
            null);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add(API_KEY_NAME, API_KEY_VALUE);

        log.info("Proxying request from "+request.getRequestURI()+" to "+uri.toString());

        return restTemplate
                .exchange(
                        uri,
                        HttpMethod.resolve(request.getMethod()),
                        new HttpEntity<>(headers),
                        responseClass)
                .getBody();
    }

    @Cacheable(value="quarters", key="#allQueryParams")
    public Quarter[] getQuarter(Map<String, String> allQueryParams, HttpServletRequest request) {
        try {
            return proxyRequest(Quarter[].class, request, allQueryParams);
        } catch (URISyntaxException e) {
            log.error("Exception thrown when proxying request. Nested exception is:");
            log.error(e.getMessage());
            return null;
        }
    }

    @Cacheable(value="classes", key="#allQueryParams")
    public Gateway.PaginatedClasses getClassSections(Map<String, String> allQueryParams, HttpServletRequest request) {
        try {
            Gateway.PaginatedClasses classes = proxyRequest(Gateway.PaginatedClasses.class, request, allQueryParams);
            classes
                .getClasses()
                .forEach((Class class_) -> {
                    class_.getClassSections()
                        .forEach((ClassSection classSection) -> {
                            classSection.setCourseId(class_.getCourseId());
                            classSection.setLectureSectionGroup(class_.getCourseId()+classSection.getSection().substring(0,2));
                        });
                });
            return classes;
        } catch (URISyntaxException e) {
            log.error("Exception thrown when proxying request. Nested exception is:");
            log.error(e.getMessage());
        } catch (Exception e) {
            log.error("Proxied request returned an error.");
            log.error(e.getMessage());
        }
        return null;
    }

    @Cacheable(value="departments", key="#allQueryParams")
    public Department[] getDepartments(Map<String, String> allQueryParams, HttpServletRequest request) {
        try {
            return proxyRequest(Department[].class, request, allQueryParams);
        } catch (URISyntaxException e) {
            log.error("Exception thrown when proxying request. Nested exception is:");
            log.error(e.getMessage());
            return null;
        }
    }

}