package com.tourmaster.repository;

import com.tourmaster.entity.ExtraService;
import com.tourmaster.entity.ExtraServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExtraServiceRepository extends JpaRepository<ExtraService, Long> {
    List<ExtraService> findByType(ExtraServiceType type);
}
