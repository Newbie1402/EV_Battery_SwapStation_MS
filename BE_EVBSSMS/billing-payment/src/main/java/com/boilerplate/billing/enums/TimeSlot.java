package com.boilerplate.billing.enums;

public enum TimeSlot {
    SLOT_0_6(0, 6),
    SLOT_6_12(6, 12),
    SLOT_12_18(12, 18),
    SLOT_18_24(18, 24);

    private final int startHour;
    private final int endHour;

    TimeSlot(int startHour, int endHour) {
        this.startHour = startHour;
        this.endHour = endHour;
    }

    public int getStartHour() {
        return startHour;
    }

    public int getEndHour() {
        return endHour;
    }
}
