package com.boilerplate.station.service;

import com.boilerplate.station.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    @Autowired
    private TaskRepository stationTaskRepository;
}
