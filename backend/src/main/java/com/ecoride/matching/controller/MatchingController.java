package com.ecoride.matching.controller;

import com.ecoride.common.response.ApiResponse;
import com.ecoride.matching.dto.MatchResultDto;
import com.ecoride.matching.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    /**
     * GET /rides/match?zone=A&time=2026-03-01T08:30:00Z
     * Returns top 3 ranked rides.
     */
    @GetMapping("/match")
    public ApiResponse<List<MatchResultDto>> match(
            @RequestParam String zone,
            @RequestParam(required = false, defaultValue = "") String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant time,
            @AuthenticationPrincipal UserDetails principal) {

        List<MatchResultDto> results = matchingService.findMatches(zone, destination, time, principal.getUsername());
        return ApiResponse.ok(results);
    }
}
