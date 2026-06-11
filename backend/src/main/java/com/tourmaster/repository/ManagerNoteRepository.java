package com.tourmaster.repository;

import com.tourmaster.entity.ManagerNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagerNoteRepository extends JpaRepository<ManagerNote, Long> {
    List<ManagerNote> findByUserIdOrderByCreatedAtDesc(Long userId);
}
