package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Article;
import com.product.exe.backend.enums.ArticleCategory;
import com.product.exe.backend.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    @Query(value = "SELECT a FROM Article a " +
           "WHERE a.status = :status AND a.isActive = true " +
           "AND (:category IS NULL OR a.category = :category) " +
           "AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(:search) OR LOWER(a.content) LIKE LOWER(:search))",
           countQuery = "SELECT COUNT(a) FROM Article a " +
           "WHERE a.status = :status AND a.isActive = true " +
           "AND (:category IS NULL OR a.category = :category) " +
           "AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(:search) OR LOWER(a.content) LIKE LOWER(:search))")
    Page<Article> findAllByStatusAndCategoryAndSearch(
            @Param("status") ArticleStatus status,
            @Param("category") ArticleCategory category,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT a FROM Article a " +
           "WHERE (:status IS NULL OR a.status = :status) " +
           "AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Article> findAllForAdmin(
            @Param("status") ArticleStatus status,
            @Param("search") String search,
            Pageable pageable);

    Optional<Article> findBySlugAndStatus(String slug, ArticleStatus status);

    @Query("SELECT SUM(a.viewCount) FROM Article a")
    Long sumViewCount();

    @Query("SELECT a FROM Article a " +
           "WHERE a.status = :status AND a.isActive = true " +
           "AND LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY a.viewCount DESC, a.publishedAt DESC")
    List<Article> findTopByKeyword(
            @Param("keyword") String keyword,
            @Param("status") ArticleStatus status,
            Pageable pageable);

    Page<Article> findAllByOrderByViewCountDesc(Pageable pageable);
}
