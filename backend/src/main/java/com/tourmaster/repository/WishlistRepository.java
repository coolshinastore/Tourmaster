package com.tourmaster.repository;

import com.tourmaster.entity.Wishlist;
import com.tourmaster.entity.WishlistId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, WishlistId> {
    List<Wishlist> findByIdUserId(Long userId);
}
