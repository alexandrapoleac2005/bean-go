package com.cafe.bean_go.entities.enums;

public enum UserBadge {

    ROOKIE(0),
    COFFEE_LOVER(500),
    CAFFEINE_ADDICT(1500),
    BEAN_MASTER(3000);

    private final int requiredPoints;

    UserBadge(int requiredPoints) {
        this.requiredPoints = requiredPoints;
    }

    public static UserBadge getBadgeForPoints(int points) {
        if (points >= BEAN_MASTER.requiredPoints) return BEAN_MASTER;
        if (points >= CAFFEINE_ADDICT.requiredPoints) return CAFFEINE_ADDICT;
        if (points >= COFFEE_LOVER.requiredPoints) return COFFEE_LOVER;
        return ROOKIE;
    }
}
