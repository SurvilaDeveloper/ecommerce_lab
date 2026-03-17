//backend/src/main/java/com/gabrielsurvila/commerce_lab/user/repository/UserAccountRepository.java
package com.gabrielsurvila.commerce_lab.user.repository;

import com.gabrielsurvila.commerce_lab.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
