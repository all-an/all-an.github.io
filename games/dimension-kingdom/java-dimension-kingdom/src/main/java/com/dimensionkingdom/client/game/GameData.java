package com.dimensionkingdom.client.game;

import com.dimensionkingdom.client.model.Answer;
import com.dimensionkingdom.client.model.Character;
import com.dimensionkingdom.client.model.Event;

public class GameData {

    public static Event buildGame(Character c) {

        // ── Terminal events ──────────────────────────────────────────────────
        Event powerEnd = new Event(
            "The voice grants you immeasurable power. As a " + c.getRace() +
            " born of a " + c.getBirthplace() + ", you feel the dimensions bend to your will. " +
            "But power without wisdom is a cage. You are forever trapped between worlds."
        );

        Event knowledgeEnd = new Event(
            "Ancient secrets flood your mind. You understand the true nature of all dimensions. " +
            "You become the Keeper of Worlds — the guardian of Dimension Kingdom."
        );

        Event dealEnd = new Event(
            "You accept the dragon's deal and become Champion of the Shadow Realm. " +
            "The dragon bows before you. The darkness is yours to command."
        );

        Event fightEnd = new Event(
            "You battle the dragon with everything you have. Against all odds, you win. " +
            "The kingdom erupts in celebration. You are its greatest hero."
        );

        // ── Sage / crossroads ────────────────────────────────────────────────
        Event sageEvent = new Event(
            "A wise sage appears on the light path. Her eyes hold the knowledge of a thousand dimensions. " +
            "She offers to guide you — or you can turn back."
        );
        sageEvent.addAnswer(new Answer("Follow her wisdom", knowledgeEnd));

        Event dragonLair = new Event(
            "The dark path leads to a dragon's lair. Bones litter the ground. " +
            "The dragon opens one eye and offers you a deal."
        );
        dragonLair.addAnswer(new Answer("Accept the dragon's deal", dealEnd));
        dragonLair.addAnswer(new Answer("Fight the dragon", fightEnd));

        Event crossroads = new Event(
            "You wander through the kingdom and reach a crossroads. " +
            "A dark path descends into shadow. A light path climbs toward radiant peaks."
        );
        crossroads.addAnswer(new Answer("Take the dark path", dragonLair));
        crossroads.addAnswer(new Answer("Take the light path", sageEvent));

        sageEvent.addAnswer(new Answer("Turn back to the crossroads", crossroads));

        // ── Portal event ─────────────────────────────────────────────────────
        Event portalEvent = new Event(
            "The portal swirls with cosmic energy. A disembodied voice fills your mind: " +
            "\"What do you seek, traveller?\""
        );
        portalEvent.addAnswer(new Answer("I seek power", powerEnd));
        portalEvent.addAnswer(new Answer("I seek knowledge", knowledgeEnd));

        // ── Flight events ─────────────────────────────────────────────────────
        Event restLanding = new Event(
            "You glide to the ground softly, " + c.getWingType() + " folding behind you. " +
            "The cool earth steadies you. A moment of stillness — your strength returns.",
            0, 35, false
        );
        restLanding.addAnswer(new Answer("Continue into the kingdom", crossroads));

        Event towerRest = new Event(
            "You fold your " + c.getWingType() + " and perch atop the highest obsidian tower. " +
            "The kingdom hums beneath you. Stars pierce through the dimensional veil. You breathe. You recover.",
            0, 30, false
        );
        towerRest.addAnswer(new Answer("Descend and explore the kingdom", crossroads));

        Event marketLanding = new Event(
            "You touch down in the market square. Merchants scatter, then stare in wonder. " +
            "A hooded figure steps forward and whispers: \"I know why you are here, " + c.getRace() + ".\"",
            0, 25, false
        );
        marketLanding.addAnswer(new Answer("Listen to the figure", crossroads));
        marketLanding.addAnswer(new Answer("Ignore them and explore", crossroads));

        Event flyPortal = new Event(
            "You angle your " + c.getWingType() + " toward the swirling portal above. " +
            "The cosmic wind catches you, pulling you faster. A disembodied voice fills your mind: " +
            "\"What do you seek, traveller?\"",
            20, 0, true
        );
        flyPortal.addAnswer(new Answer("I seek power", powerEnd));
        flyPortal.addAnswer(new Answer("I seek knowledge", knowledgeEnd));

        Event flyCity2 = new Event(
            "You weave between the crystal towers at speed. Wind howls past your " + c.getWingType() + ". " +
            "Far below, citizens point upward in awe. You spot the dragon lair carved into the cliffs.",
            20, 0, true
        );
        flyCity2.addAnswer(new Answer("Dive toward the dragon lair", dragonLair));
        flyCity2.addAnswer(new Answer("Perch atop the highest tower to rest", towerRest));

        Event flyCity = new Event(
            "The ancient city unfolds beneath your " + c.getWingType() + ". " +
            "Towers of obsidian and quartz rise like teeth from the earth. " +
            "The market square glows with merchant fires far below.",
            15, 0, true
        );
        flyCity.addAnswer(new Answer("Land in the market square", marketLanding));
        flyCity.addAnswer(new Answer("Keep flying — weave through the towers", flyCity2));

        Event flyStart = new Event(
            "You spread your " + c.getWingType() + " wide. For a breathless moment you hang suspended — " +
            "then the air catches you. The kingdom of Dimension Kingdom swells below. " +
            "The portal blazes above. Every wingbeat costs you, but you could fly for a long time yet.",
            15, 0, true
        );
        flyStart.addAnswer(new Answer("Soar toward the portal above", flyPortal));
        flyStart.addAnswer(new Answer("Dive toward the ancient city below", flyCity));
        flyStart.addAnswer(new Answer("Glide down and rest", restLanding));

        // ── Start ─────────────────────────────────────────────────────────────
        Event start = new Event(
            "You wake in a mystical kingdom suspended between dimensions. " +
            "As a " + c.getRace() + " born of a " + c.getBirthplace() + ", this place feels almost familiar. " +
            "This realm is a Plane — a distinct layer of reality nested within a greater Dimension, " +
            "which itself contains many such Planes; Celestial Bodies orbit within those Planes, " +
            "each a world unto itself. The sky here shimmers with impossible colours. " +
            "A glowing portal pulses before you, and the ancient city stretches into the horizon."
        );
        start.addAnswer(new Answer("Step through the portal", portalEvent));
        start.addAnswer(new Answer("Explore the kingdom", crossroads));
        start.addAnswer(new Answer("Spread your " + c.getWingType() + " and take flight", flyStart));

        return start;
    }
}
