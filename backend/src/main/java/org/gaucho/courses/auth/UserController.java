package org.gaucho.courses.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping(value = "api/user/")
public class UserController {

    /**
     * REST controller to return information on the currently authenticated user. If the user is not
     * logged in, this will return an empty response. If there is some problem retrieving the token,
     * this will fail and return an 500-level response.
     * @return The OAuth2 authentication token. (null if user is anonymous).
     */
    @RequestMapping("/")
    public ResponseEntity<OAuth2AuthenticationToken> userAuthentication() {
        if (getUserAuthentication().isPresent()) {
            return ResponseEntity
                .status(HttpStatus.OK)
                .body(getUserAuthentication().get());
        } else {
            return ResponseEntity
                .status(HttpStatus.OK)
                .body(null);
        }
    }

    /**
     * Returns Optional with the Oauth2 token for the currently authenticated user. If the user is not logged in with
     * OAuth, then the Optional will be empty.
     * @return An Optional that may contain the authentication token.
     */
    public Optional<OAuth2AuthenticationToken> getUserAuthentication() {
        Authentication token = SecurityContextHolder.getContext().getAuthentication();

        if (token instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        } else if (token.isAuthenticated()) {
            return Optional.of((OAuth2AuthenticationToken) token);
        } else {
            return Optional.empty();
        }
    }

    /**
     * Returns the email address for the currently authenticated user.
     * @return The authenticated user's email. (null if user is anonymous).
     */
    public String getUserEmail() {
        Optional<OAuth2AuthenticationToken> token = getUserAuthentication();

        if (token.isPresent()) {
            return token.get().getPrincipal().getAttribute("email");
        } else {
            return null;
        }
    }

}
