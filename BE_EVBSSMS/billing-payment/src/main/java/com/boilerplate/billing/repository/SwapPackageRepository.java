package com.boilerplate.billing.repository;

import com.boilerplate.billing.model.entity.SwapPackage;
import com.boilerplate.billing.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwapPackageRepository extends JpaRepository<SwapPackage, Long> {
    List<SwapPackage> findByStatus(PackageStatus status);
}
