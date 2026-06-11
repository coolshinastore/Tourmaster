package com.tourmaster.service;

import com.tourmaster.dto.request.AddManagerNoteRequest;
import com.tourmaster.dto.response.*;
import com.tourmaster.entity.BookingStatus;
import com.tourmaster.entity.ManagerNote;
import com.tourmaster.entity.Role;
import com.tourmaster.entity.User;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.BookingMapper;
import com.tourmaster.repository.BookingRepository;
import com.tourmaster.repository.ManagerNoteRepository;
import com.tourmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminClientService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ManagerNoteRepository managerNoteRepository;
    private final BookingMapper bookingMapper;

    @Transactional(readOnly = true)
    public PageResponse<AdminClientResponse> findAll(String q, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<User> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("role"), Role.CLIENT));

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return PageResponse.of(userRepository.findAll(spec, pageable)
                .map(this::toClientResponse));
    }

    @Transactional(readOnly = true)
    public AdminClientProfileResponse getProfile(Long userId) {
        User user = findOrThrow(userId);

        var bookingsPage = bookingRepository.findByUserId(
                userId, PageRequest.of(0, 10, Sort.by("createdAt").descending())
        );

        BigDecimal totalSpent = bookingsPage.stream()
                .filter(b -> b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getTotalPrice().subtract(b.getDiscount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BookingResponse> recentBookings = bookingsPage.stream()
                .limit(5)
                .map(bookingMapper::toResponse)
                .toList();

        List<ManagerNoteResponse> notes = managerNoteRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> new ManagerNoteResponse(
                        n.getId(),
                        n.getManager().getFirstName() + " " + n.getManager().getLastName(),
                        n.getNote(),
                        n.getCreatedAt()
                ))
                .toList();

        return new AdminClientProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getLoyaltyPoints(),
                bookingsPage.getTotalElements(),
                totalSpent,
                recentBookings,
                notes
        );
    }

    @Transactional
    public ManagerNoteResponse addNote(Long userId, User manager, AddManagerNoteRequest request) {
        User client = findOrThrow(userId);

        ManagerNote note = ManagerNote.builder()
                .user(client)
                .manager(manager)
                .note(request.note())
                .build();

        ManagerNote saved = managerNoteRepository.save(note);
        return new ManagerNoteResponse(
                saved.getId(),
                manager.getFirstName() + " " + manager.getLastName(),
                saved.getNote(),
                saved.getCreatedAt()
        );
    }

    private AdminClientResponse toClientResponse(User user) {
        long total = bookingRepository.findByUserId(user.getId(), PageRequest.of(0, 1)).getTotalElements();
        return new AdminClientResponse(
                user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhone(), user.getLoyaltyPoints(), total
        );
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
