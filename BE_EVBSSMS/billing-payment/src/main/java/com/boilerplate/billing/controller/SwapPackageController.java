package com.boilerplate.billing.controller;

import com.boilerplate.billing.model.entity.SwapPackage;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.service.SwapPackageSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/packages")
public class SwapPackageController {

    @Autowired
    private SwapPackageSchedulerService swapPackageService;

    @PostMapping("/create")
    public ResponseEntity<ResponseData<SwapPackage>> create(@RequestBody SwapPackage swapPackage) {
        return swapPackageService.createPackage(swapPackage);
    }

    @PutMapping("/extend/{id}")
    public ResponseEntity<ResponseData<SwapPackage>> extend(@PathVariable Long id, @RequestParam Integer extraDays) {
        return swapPackageService.extendPackage(id, extraDays);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<String>> delete(@PathVariable Long id) {
        return swapPackageService.deletePackage(id);
    }

    @GetMapping("/getall")
    public ResponseEntity<?> getAll() {
        return swapPackageService.getAllPackages();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return swapPackageService.getPackageById(id);
    }
}
