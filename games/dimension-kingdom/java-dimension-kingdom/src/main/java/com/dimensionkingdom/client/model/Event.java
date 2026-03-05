package com.dimensionkingdom.client.model;

import java.util.ArrayList;
import java.util.List;

public class Event {

    private final String description;
    private final List<Answer> answers;
    private final int staminaCost;
    private final int staminaRecover;
    private final boolean requiresFlight;

    public Event(String description) {
        this(description, 0, 0, false);
    }

    public Event(String description, int staminaCost, int staminaRecover, boolean requiresFlight) {
        this.description     = description;
        this.staminaCost     = staminaCost;
        this.staminaRecover  = staminaRecover;
        this.requiresFlight  = requiresFlight;
        this.answers         = new ArrayList<>();
    }

    public void addAnswer(Answer answer) { answers.add(answer); }

    public String getDescription()  { return description; }
    public List<Answer> getAnswers(){ return answers; }
    public boolean isTerminal()     { return answers.isEmpty(); }
    public int getStaminaCost()     { return staminaCost; }
    public int getStaminaRecover()  { return staminaRecover; }
    public boolean requiresFlight() { return requiresFlight; }
}
