package com.boilerplate.station.model.event;

public final class ApiEndpoints {

    private ApiEndpoints() {} // prevent instantiation

    //================ Staff =================
    public static final String STAFF_BASE = "/api/admin/staff";
    public static final String GET_STAFF_BY_ID = STAFF_BASE + "/{id}";
    public static final String GET_STAFF_LIST = STAFF_BASE;          // ?ids=1,2,3

    //================ Driver =================
    public static final String DRIVER_BASE = "/api/admin/drivers";
    public static final String GET_DRIVER_BY_ID = DRIVER_BASE + "/{id}";
    public static final String GET_DRIVER_LIST = DRIVER_BASE;        // ?ids=1,2,3

    //================ User =================
    public static final String USER_BASE = "/api/admin/users";
    public static final String GET_USER_BY_ID = USER_BASE + "/{id}";
    public static final String GET_USER_LIST = USER_BASE;            // ?ids=1,2,3
}
