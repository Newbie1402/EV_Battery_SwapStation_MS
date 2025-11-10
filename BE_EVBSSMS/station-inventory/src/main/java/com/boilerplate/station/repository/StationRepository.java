package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

}
