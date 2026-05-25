package com.catalogue.repository;

import com.catalogue.entity.ItemSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemSizeRepository extends JpaRepository<ItemSize, Integer> {
    List<ItemSize> findByEnterpriseEntIdAndIsActiveTrueOrderBySortOrderAscLabelAsc(String entId);
    Optional<ItemSize> findBySizeIdAndEnterpriseEntId(Integer sizeId, String entId);
    boolean existsByLabelAndEnterpriseEntId(String label, String entId);
}
