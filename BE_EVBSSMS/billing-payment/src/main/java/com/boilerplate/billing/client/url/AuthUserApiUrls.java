package com.boilerplate.billing.client.url;

public class AuthUserApiUrls {

    // Base URL của Auth-User qua Eureka
    public static final String BASE_URL = "http://AUTH-USER/api";

    // -----------------------------
    // Driver API
    // -----------------------------
    public static final String GET_DRIVER_BY_BATTERY_ID = BASE_URL + "/admin/drivers/%s";
    public static final String GET_ALL_DRIVERS = BASE_URL + "/admin/drivers/all";
    public static final String CREATE_DRIVER = BASE_URL + "/admin/drivers/create";
    public static final String DELETE_DRIVER_BY_ID = BASE_URL + "/admin/drivers/delete/%s";

    // Nếu sau này có thêm API khác của AUTH-USER, thêm ở đây luôn
}
