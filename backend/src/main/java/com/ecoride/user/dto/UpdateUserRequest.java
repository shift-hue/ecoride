package com.ecoride.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Size(max = 100, message = "Department must be at most 100 characters")
    private String department;

    @Min(value = 1, message = "Year must be between 1 and 6")
    @Max(value = 6, message = "Year must be between 1 and 6")
    private Integer year;

    @Size(max = 100, message = "Vehicle model must be at most 100 characters")
    private String vehicleModel;

    @Size(max = 30, message = "Vehicle number must be at most 30 characters")
    private String vehicleNumber;

    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    @Size(max = 200, message = "Preferences must be at most 200 characters")
    private String preferences;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phoneNumber;

    private Boolean phoneVerified;

    private Boolean licenseVerified;
}
