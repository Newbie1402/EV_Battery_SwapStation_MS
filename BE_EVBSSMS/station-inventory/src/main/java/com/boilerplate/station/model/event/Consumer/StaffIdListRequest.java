package com.boilerplate.station.model.event.Consumer;
import lombok.Data;
import java.util.List;

@Data
public class StaffIdListRequest {
    private List<String> StaffIds;
}
