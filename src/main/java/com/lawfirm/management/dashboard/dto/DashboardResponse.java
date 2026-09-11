package com.lawfirm.management.dashboard.dto;
public record DashboardResponse(long totalUsers,long activeUsers,long totalClients,long activeClients,long totalCases,long activeCases,long pendingDeadlines,long overdueDeadlines,long upcomingAppointments,long unreadNotifications) {}
