package com.catalogue.repository;

import com.catalogue.entity.ItemBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemBrandRepository extends JpaRepository<ItemBrand, Integer> {
    List<ItemBrand> findByEnterpriseEntIdAndIsActiveTrueOrderByName(String entId);
    Optional<ItemBrand> findByBrandIdAndEnterpriseEntId(Integer brandId, String entId);
    boolean existsByNameAndEnterpriseEntId(String name, String entId);
}
