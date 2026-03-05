package com.dimensionkingdom.client.model;

public class Answer {

    private final String text;
    private final Event nextEvent;

    public Answer(String text, Event nextEvent) {
        this.text = text;
        this.nextEvent = nextEvent;
    }

    public String getText() {
        return text;
    }

    public Event getNextEvent() {
        return nextEvent;
    }
}
