//backend/src/main/java/com/gabrielsurvila/commerce_lab/auth/security/CustomUserDetailsService.java
package com.gabrielsurvila.commerce_lab.auth.security;

import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import com.gabrielsurvila.commerce_lab.user.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public CustomUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new AuthUserDetails(user);
    }

    public UserDetails loadUserById(Long id) {
        UserAccount user = userAccountRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new AuthUserDetails(user);
    }
}
