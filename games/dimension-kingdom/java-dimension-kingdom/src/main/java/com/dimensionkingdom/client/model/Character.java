package com.dimensionkingdom.client.model;

public class Character {

    private final String race;
    private final String birthplace;
    private final String wingType;
    private int stamina;
    public static final int MAX_STAMINA = 100;

    public Character(String race, String birthplace, String wingType) {
        this.race = race;
        this.birthplace = birthplace;
        this.wingType = wingType;
        this.stamina = MAX_STAMINA;
    }

    public String getRace()     { return race; }
    public String getBirthplace() { return birthplace; }
    public String getWingType() { return wingType; }
    public int getStamina()     { return stamina; }

    public void useStamina(int amount) {
        stamina = Math.max(0, stamina - amount);
    }

    public void recoverStamina(int amount) {
        stamina = Math.min(MAX_STAMINA, stamina + amount);
    }

    public boolean canFly() {
        return stamina >= 15;
    }
}
