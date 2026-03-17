//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/dto/SignupRequest.java
package com.gabrielsurvila.commerce_lab.auth.dto;

public class SignupRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String password;

    public SignupRequest() {
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
