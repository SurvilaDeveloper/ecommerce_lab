// backend/src/main/java/com/gabrielsurvila/commerce_lab/user/repository/AddressRepository.java
package com.gabrielsurvila.commerce_lab.user.repository;

import com.gabrielsurvila.commerce_lab.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
