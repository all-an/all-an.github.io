package com.dimensionkingdom.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.dom.client.Document;
import com.google.gwt.dom.client.Element;
import com.google.gwt.dom.client.InputElement;
import com.google.gwt.dom.client.Style;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.Event;
import com.google.gwt.user.client.EventListener;

import com.dimensionkingdom.client.model.Answer;
import com.dimensionkingdom.client.model.Character;
import com.dimensionkingdom.client.game.GameData;

public class DimensionKingdom implements EntryPoint {

    // ── Character creation state ───────────────────────────────────────────
    private String selectedRace       = null;
    private String selectedBirthplace = null;
    private String selectedWings      = null;
    private Element selectedRaceEl       = null;
    private Element selectedBirthplaceEl = null;
    private Element selectedWingsEl      = null;
    private InputElement raceInput;
    private InputElement wingsInput;
    private Element beginBtn;
    private Element creationEl;

    // ── Game state ─────────────────────────────────────────────────────────
    private com.dimensionkingdom.client.model.Event currentEvent;
    private Character character;

    // ── Game UI ────────────────────────────────────────────────────────────
    private Element gameEl;
    private Element descriptionEl;
    private Element answersEl;
    private Element restartEl;
    private Element staminaFillEl;
    private Element staminaLabelEl;
    private Element statsPanel;
    private boolean statsVisible = false;

    // ── Native localStorage helpers ────────────────────────────────────────
    private static native String lsGet(String key) /*-{
        return $wnd.localStorage.getItem(key) || "";
    }-*/;

    private static native void lsSet(String key, String value) /*-{
        $wnd.localStorage.setItem(key, value);
    }-*/;

    private static native void lsRemove(String key) /*-{
        $wnd.localStorage.removeItem(key);
    }-*/;

    // ── Entry point ────────────────────────────────────────────────────────
    @Override
    public void onModuleLoad() {
        String savedRace  = lsGet("dk_race");
        String savedPlace = lsGet("dk_birthplace");
        String savedWings = lsGet("dk_wings");

        if (!savedRace.isEmpty() && !savedPlace.isEmpty() && !savedWings.isEmpty()) {
            character = new Character(savedRace, savedPlace, savedWings);
            buildGameUI();
            currentEvent = GameData.buildGame(character);
            render(currentEvent);
        } else {
            buildCreationUI();
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // CHARACTER CREATION
    // ══════════════════════════════════════════════════════════════════════

    private void buildCreationUI() {
        Element body = Document.get().getBody();
        creationEl = Document.get().createDivElement();
        styleContainer(creationEl);

        Element title = Document.get().createHElement(1);
        title.setInnerText("Character Creation");
        styleTitle(title);
        creationEl.appendChild(title);

        Element sub = Document.get().createDivElement();
        sub.setInnerText("Define your identity before entering Dimension Kingdom");
        styleSub(sub);
        creationEl.appendChild(sub);

        creationEl.appendChild(buildSection("Your Heritage",  buildRaceOptions()));
        creationEl.appendChild(buildSection("Your Origin",    buildBirthplaceOptions()));
        creationEl.appendChild(buildSection("Your Wings",     buildWingsOptions()));

        beginBtn = Document.get().createDivElement();
        beginBtn.setInnerText("Begin Journey");
        styleBeginBtn(beginBtn, false);
        DOM.setEventListener((com.google.gwt.user.client.Element) beginBtn, new EventListener() {
            @Override public void onBrowserEvent(Event e) {
                if (e.getTypeInt() == Event.ONCLICK) onBeginJourney();
            }
        });
        DOM.sinkEvents((com.google.gwt.user.client.Element) beginBtn, Event.ONCLICK);
        creationEl.appendChild(beginBtn);

        body.appendChild(creationEl);
    }

    private Element buildSection(String label, Element content) {
        Element section = Document.get().createDivElement();
        section.getStyle().setProperty("marginBottom", "16px");
        Element lbl = Document.get().createDivElement();
        lbl.setInnerText(label);
        styleSectionLabel(lbl);
        section.appendChild(lbl);
        section.appendChild(content);
        return section;
    }

    private Element buildRaceOptions() {
        Element wrap = Document.get().createDivElement();
        styleOptionWrap(wrap);

        for (String race : new String[]{"Half Dragon", "Half Alien", "Half Elemental"}) {
            wrap.appendChild(buildOptionBtn(race, "race"));
        }

        Element customRow = Document.get().createDivElement();
        customRow.getStyle().setProperty("display", "flex");
        customRow.getStyle().setProperty("gap", "8px");
        customRow.getStyle().setProperty("alignItems", "center");
        customRow.getStyle().setProperty("flexWrap", "wrap");

        Element customBtn = buildOptionBtn("custom", "race");
        customBtn.setInnerText("Half ...");

        raceInput = Document.get().createElement("input").cast();
        raceInput.setAttribute("type", "text");
        raceInput.setAttribute("placeholder", "your heritage...");
        styleTextInput(raceInput);
        raceInput.getStyle().setProperty("display", "none");

        customRow.appendChild(customBtn);
        customRow.appendChild(raceInput);
        wrap.appendChild(customRow);
        return wrap;
    }

    private Element buildBirthplaceOptions() {
        Element wrap = Document.get().createDivElement();
        styleOptionWrap(wrap);

        Element note = Document.get().createDivElement();
        note.setInnerText("Dimensions contain Planes — Planes contain Celestial Bodies");
        styleNote(note);
        wrap.appendChild(note);

        for (String place : new String[]{"Dimension", "Plane", "Celestial Body"}) {
            wrap.appendChild(buildOptionBtn(place, "birthplace"));
        }
        return wrap;
    }

    private Element buildWingsOptions() {
        Element wrap = Document.get().createDivElement();
        styleOptionWrap(wrap);

        for (String w : new String[]{"Feather Wings", "Translucid Wings", "Dragon Wings", "Fire Wings", "Insect Wings"}) {
            wrap.appendChild(buildOptionBtn(w, "wings"));
        }

        Element customRow = Document.get().createDivElement();
        customRow.getStyle().setProperty("display", "flex");
        customRow.getStyle().setProperty("gap", "8px");
        customRow.getStyle().setProperty("alignItems", "center");
        customRow.getStyle().setProperty("flexWrap", "wrap");

        Element customBtn = buildOptionBtn("custom", "wings");
        customBtn.setInnerText("... Wings");

        wingsInput = Document.get().createElement("input").cast();
        wingsInput.setAttribute("type", "text");
        wingsInput.setAttribute("placeholder", "your wings...");
        styleTextInput(wingsInput);
        wingsInput.getStyle().setProperty("display", "none");

        customRow.appendChild(customBtn);
        customRow.appendChild(wingsInput);
        wrap.appendChild(customRow);
        return wrap;
    }

    private Element buildOptionBtn(final String value, final String category) {
        Element btn = Document.get().createDivElement();
        styleOptionBtn(btn, false);
        btn.setInnerText(value);
        DOM.setEventListener((com.google.gwt.user.client.Element) btn, new EventListener() {
            @Override public void onBrowserEvent(Event e) {
                if (e.getTypeInt() == Event.ONCLICK) onOptionSelected(category, value, btn);
            }
        });
        DOM.sinkEvents((com.google.gwt.user.client.Element) btn, Event.ONCLICK);
        return btn;
    }

    private void onOptionSelected(String category, String value, Element btn) {
        if (category.equals("race")) {
            if (selectedRaceEl != null) styleOptionBtn(selectedRaceEl, false);
            selectedRaceEl = btn;
            selectedRace   = value;
            if (value.equals("custom")) raceInput.getStyle().clearProperty("display");
            else                        raceInput.getStyle().setProperty("display", "none");
        } else if (category.equals("birthplace")) {
            if (selectedBirthplaceEl != null) styleOptionBtn(selectedBirthplaceEl, false);
            selectedBirthplaceEl = btn;
            selectedBirthplace   = value;
        } else {
            if (selectedWingsEl != null) styleOptionBtn(selectedWingsEl, false);
            selectedWingsEl = btn;
            selectedWings   = value;
            if (value.equals("custom")) wingsInput.getStyle().clearProperty("display");
            else                        wingsInput.getStyle().setProperty("display", "none");
        }
        styleOptionBtn(btn, true);
        updateBeginBtn();
    }

    private void updateBeginBtn() {
        styleBeginBtn(beginBtn, selectedRace != null && selectedBirthplace != null && selectedWings != null);
    }

    private void onBeginJourney() {
        if (selectedRace == null || selectedBirthplace == null || selectedWings == null) return;

        String race = selectedRace.equals("custom")
            ? "Half " + (raceInput.getValue().trim().isEmpty() ? "Unknown" : raceInput.getValue().trim())
            : selectedRace;
        String wings = selectedWings.equals("custom")
            ? (wingsInput.getValue().trim().isEmpty() ? "Mysterious" : wingsInput.getValue().trim()) + " Wings"
            : selectedWings;

        lsSet("dk_race",       race);
        lsSet("dk_birthplace", selectedBirthplace);
        lsSet("dk_wings",      wings);

        character = new Character(race, selectedBirthplace, wings);
        creationEl.getStyle().setProperty("display", "none");
        buildGameUI();
        currentEvent = GameData.buildGame(character);
        render(currentEvent);
    }

    // ══════════════════════════════════════════════════════════════════════
    // GAME UI
    // ══════════════════════════════════════════════════════════════════════

    private void buildGameUI() {
        Element body = Document.get().getBody();
        gameEl = Document.get().createDivElement();
        styleContainer(gameEl);

        Element title = Document.get().createHElement(1);
        title.setInnerText("Dimension Kingdom");
        styleTitle(title);
        gameEl.appendChild(title);

        gameEl.appendChild(buildStaminaBar());

        descriptionEl = Document.get().createDivElement();
        styleDescription(descriptionEl);
        gameEl.appendChild(descriptionEl);

        answersEl = Document.get().createDivElement();
        styleAnswersPanel(answersEl);
        gameEl.appendChild(answersEl);

        restartEl = Document.get().createDivElement();
        styleRestartButton(restartEl);
        restartEl.setInnerText("Play Again");
        restartEl.getStyle().setDisplay(Style.Display.NONE);
        DOM.setEventListener((com.google.gwt.user.client.Element) restartEl, new EventListener() {
            @Override public void onBrowserEvent(Event e) {
                if (e.getTypeInt() == Event.ONCLICK) {
                    character = new Character(character.getRace(), character.getBirthplace(), character.getWingType());
                    currentEvent = GameData.buildGame(character);
                    render(currentEvent);
                }
            }
        });
        DOM.sinkEvents((com.google.gwt.user.client.Element) restartEl, Event.ONCLICK);
        gameEl.appendChild(restartEl);

        // ── Bottom row: View Stats | New Character ─────────────────────────
        Element row = Document.get().createDivElement();
        row.getStyle().setProperty("display", "flex");
        row.getStyle().setProperty("gap", "12px");
        row.getStyle().setProperty("marginTop", "16px");
        row.getStyle().setProperty("flexWrap", "wrap");

        Element statsBtn = Document.get().createDivElement();
        statsBtn.setInnerText("View Stats");
        styleSmallBtn(statsBtn, "rgba(0,204,255,0.08)", "rgba(0,204,255,0.3)", "rgba(0,204,255,0.8)");
        DOM.setEventListener((com.google.gwt.user.client.Element) statsBtn, new EventListener() {
            @Override public void onBrowserEvent(Event e) {
                if (e.getTypeInt() == Event.ONCLICK) toggleStats();
            }
        });
        DOM.sinkEvents((com.google.gwt.user.client.Element) statsBtn, Event.ONCLICK);
        row.appendChild(statsBtn);

        Element newCharBtn = Document.get().createDivElement();
        newCharBtn.setInnerText("New Character");
        styleSmallBtn(newCharBtn, "rgba(255,100,100,0.06)", "rgba(255,100,100,0.25)", "rgba(255,100,100,0.7)");
        DOM.setEventListener((com.google.gwt.user.client.Element) newCharBtn, new EventListener() {
            @Override public void onBrowserEvent(Event e) {
                if (e.getTypeInt() == Event.ONCLICK) {
                    lsRemove("dk_race");
                    lsRemove("dk_birthplace");
                    lsRemove("dk_wings");
                    // reload page to show creation screen fresh
                    reload();
                }
            }
        });
        DOM.sinkEvents((com.google.gwt.user.client.Element) newCharBtn, Event.ONCLICK);
        row.appendChild(newCharBtn);

        gameEl.appendChild(row);

        statsPanel = Document.get().createDivElement();
        styleStatsPanel(statsPanel);
        statsPanel.getStyle().setProperty("display", "none");
        gameEl.appendChild(statsPanel);

        body.appendChild(gameEl);
    }

    private static native void reload() /*-{
        $wnd.location.reload();
    }-*/;

    private Element buildStaminaBar() {
        Element wrap = Document.get().createDivElement();
        wrap.getStyle().setProperty("marginBottom", "10px");

        Element label = Document.get().createDivElement();
        label.setInnerText("STAMINA");
        label.getStyle().setProperty("fontSize", "0.7rem");
        label.getStyle().setProperty("letterSpacing", "2px");
        label.getStyle().setProperty("color", "rgba(0,255,136,0.6)");
        label.getStyle().setProperty("marginBottom", "6px");
        wrap.appendChild(label);

        Element track = Document.get().createDivElement();
        track.getStyle().setProperty("width", "100%");
        track.getStyle().setProperty("height", "8px");
        track.getStyle().setProperty("background", "rgba(255,255,255,0.1)");
        track.getStyle().setProperty("borderRadius", "4px");
        track.getStyle().setProperty("overflow", "hidden");

        staminaFillEl = Document.get().createDivElement();
        staminaFillEl.getStyle().setProperty("height", "100%");
        staminaFillEl.getStyle().setProperty("width", "100%");
        staminaFillEl.getStyle().setProperty("background", "linear-gradient(90deg, #00ff88, #00ccff)");
        staminaFillEl.getStyle().setProperty("borderRadius", "4px");
        staminaFillEl.getStyle().setProperty("transition", "width 0.4s ease, background 0.4s ease");
        track.appendChild(staminaFillEl);
        wrap.appendChild(track);

        staminaLabelEl = Document.get().createDivElement();
        staminaLabelEl.getStyle().setProperty("fontSize", "0.75rem");
        staminaLabelEl.getStyle().setProperty("color", "rgba(200,200,200,0.5)");
        staminaLabelEl.getStyle().setProperty("marginTop", "4px");
        staminaLabelEl.setInnerText("100 / 100");
        wrap.appendChild(staminaLabelEl);

        return wrap;
    }

    private void updateStaminaBar() {
        int s   = character.getStamina();
        int pct = (s * 100) / Character.MAX_STAMINA;
        staminaFillEl.getStyle().setProperty("width", pct + "%");
        staminaLabelEl.setInnerText(s + " / " + Character.MAX_STAMINA);
        if (s <= 20)
            staminaFillEl.getStyle().setProperty("background", "linear-gradient(90deg, #ff4444, #ff8800)");
        else if (s <= 50)
            staminaFillEl.getStyle().setProperty("background", "linear-gradient(90deg, #ffaa00, #ffcc44)");
        else
            staminaFillEl.getStyle().setProperty("background", "linear-gradient(90deg, #00ff88, #00ccff)");
    }

    private void toggleStats() {
        statsVisible = !statsVisible;
        if (statsVisible) {
            refreshStatsPanel();
            statsPanel.getStyle().clearProperty("display");
        } else {
            statsPanel.getStyle().setProperty("display", "none");
        }
    }

    private void refreshStatsPanel() {
        statsPanel.setInnerHTML(
            "<div style='font-size:0.75rem;letter-spacing:2px;color:rgba(0,255,136,0.7);" +
            "text-transform:uppercase;margin-bottom:16px;'>Character Stats</div>" +
            "<div style='margin-bottom:8px;color:#ccc;font-size:0.95rem;'>Race: " +
            "<span style='color:#00ff88;'>" + character.getRace() + "</span></div>" +
            "<div style='margin-bottom:8px;color:#ccc;font-size:0.95rem;'>Origin: " +
            "<span style='color:#00ff88;'>" + character.getBirthplace() + "</span></div>" +
            "<div style='margin-bottom:16px;color:#ccc;font-size:0.95rem;'>Wings: " +
            "<span style='color:#00ff88;'>" + character.getWingType() + "</span></div>" +
            "<div style='color:#ccc;font-size:0.95rem;'>Stamina: " +
            "<span style='color:#00ccff;font-weight:bold;'>" +
            character.getStamina() + " / " + Character.MAX_STAMINA + "</span></div>"
        );
    }

    private void render(com.dimensionkingdom.client.model.Event event) {
        currentEvent = event;

        if (event.getStaminaCost()    > 0) character.useStamina(event.getStaminaCost());
        if (event.getStaminaRecover() > 0) character.recoverStamina(event.getStaminaRecover());

        updateStaminaBar();
        if (statsVisible) refreshStatsPanel();

        descriptionEl.setInnerText(event.getDescription());
        answersEl.setInnerHTML("");

        if (event.isTerminal()) {
            restartEl.getStyle().clearDisplay();
        } else {
            restartEl.getStyle().setDisplay(Style.Display.NONE);
            for (Answer answer : event.getAnswers()) {
                answersEl.appendChild(createAnswerButton(answer));
            }
        }
    }

    private Element createAnswerButton(Answer answer) {
        boolean disabled = answer.getNextEvent().requiresFlight() && !character.canFly();
        Element btn = Document.get().createDivElement();
        if (disabled) {
            styleAnswerButtonDisabled(btn);
            btn.setInnerText(answer.getText() + "  [too exhausted to fly]");
        } else {
            styleAnswerButton(btn);
            btn.setInnerText(answer.getText());
            DOM.setEventListener((com.google.gwt.user.client.Element) btn, new EventListener() {
                @Override public void onBrowserEvent(Event e) {
                    if (e.getTypeInt() == Event.ONCLICK) render(answer.getNextEvent());
                }
            });
            DOM.sinkEvents((com.google.gwt.user.client.Element) btn, Event.ONCLICK);
        }
        return btn;
    }

    // ══════════════════════════════════════════════════════════════════════
    // STYLES
    // ══════════════════════════════════════════════════════════════════════

    private void styleContainer(Element el) {
        Style s = el.getStyle();
        s.setProperty("maxWidth",          "680px");
        s.setProperty("margin",            "20px auto");
        s.setProperty("padding",           "24px 32px");
        s.setProperty("maxHeight",         "756px");
        s.setProperty("overflowY",         "auto");
        s.setProperty("boxSizing",         "border-box");
        s.setProperty("fontFamily",        "'Consolas', 'Monaco', 'Courier New', monospace");
        s.setProperty("color",             "#e0e0e0");
        s.setProperty("position",          "relative");
        s.setProperty("zIndex",            "10");
        s.setProperty("background",        "rgba(10, 15, 20, 0.55)");
        s.setProperty("backdropFilter",    "blur(12px)");
        s.setProperty("-webkit-backdrop-filter", "blur(12px)");
        s.setProperty("border",            "1px solid rgba(0,255,136,0.15)");
        s.setProperty("borderRadius",      "16px");
        s.setProperty("boxShadow",         "0 8px 32px rgba(0,0,0,0.5)");
    }

    private void styleTitle(Element el) {
        Style s = el.getStyle();
        s.setProperty("fontSize",          "1.6rem");
        s.setProperty("marginBottom",      "16px");
        s.setProperty("background",        "linear-gradient(45deg, #00ff88, #00ccff)");
        s.setProperty("-webkit-background-clip", "text");
        s.setProperty("-webkit-text-fill-color", "transparent");
        s.setProperty("backgroundClip",    "text");
        s.setProperty("textAlign",         "center");
        s.setProperty("letterSpacing",     "3px");
        s.setProperty("textTransform",     "uppercase");
    }

    private void styleSub(Element el) {
        Style s = el.getStyle();
        s.setProperty("textAlign",    "center");
        s.setProperty("color",        "rgba(200,200,200,0.6)");
        s.setProperty("fontSize",     "0.9rem");
        s.setProperty("marginBottom", "16px");
        s.setProperty("letterSpacing","1px");
    }

    private void styleSectionLabel(Element el) {
        Style s = el.getStyle();
        s.setProperty("fontSize",      "0.75rem");
        s.setProperty("letterSpacing", "3px");
        s.setProperty("color",         "rgba(0,255,136,0.7)");
        s.setProperty("textTransform", "uppercase");
        s.setProperty("marginBottom",  "10px");
    }

    private void styleNote(Element el) {
        Style s = el.getStyle();
        s.setProperty("width",       "100%");
        s.setProperty("fontSize",    "0.75rem");
        s.setProperty("color",       "rgba(0,204,255,0.6)");
        s.setProperty("fontStyle",   "italic");
        s.setProperty("marginBottom","10px");
    }

    private void styleOptionWrap(Element el) {
        Style s = el.getStyle();
        s.setProperty("display",  "flex");
        s.setProperty("flexWrap", "wrap");
        s.setProperty("gap",      "10px");
    }

    private void styleOptionBtn(Element el, boolean selected) {
        Style s = el.getStyle();
        s.setProperty("padding",      "10px 18px");
        s.setProperty("borderRadius", "8px");
        s.setProperty("fontSize",     "0.9rem");
        s.setProperty("cursor",       "pointer");
        s.setProperty("letterSpacing","1px");
        s.setProperty("transition",   "all 0.2s ease");
        if (selected) {
            s.setProperty("background", "rgba(0,255,136,0.15)");
            s.setProperty("border",     "1px solid rgba(0,255,136,0.8)");
            s.setProperty("color",      "#00ff88");
        } else {
            s.setProperty("background", "rgba(255,255,255,0.05)");
            s.setProperty("border",     "1px solid rgba(255,255,255,0.15)");
            s.setProperty("color",      "#aaaaaa");
        }
    }

    private void styleTextInput(InputElement el) {
        Style s = el.getStyle();
        s.setProperty("padding",    "10px 14px");
        s.setProperty("background", "rgba(0,0,0,0.4)");
        s.setProperty("border",     "1px solid rgba(0,255,136,0.3)");
        s.setProperty("borderRadius","8px");
        s.setProperty("color",      "#e0e0e0");
        s.setProperty("fontSize",   "0.9rem");
        s.setProperty("fontFamily", "'Consolas', 'Monaco', 'Courier New', monospace");
        s.setProperty("outline",    "none");
        s.setProperty("width",      "180px");
    }

    private void styleBeginBtn(Element el, boolean enabled) {
        Style s = el.getStyle();
        s.setProperty("marginTop",     "16px");
        s.setProperty("padding",       "14px 32px");
        s.setProperty("borderRadius",  "8px");
        s.setProperty("fontSize",      "1rem");
        s.setProperty("letterSpacing", "3px");
        s.setProperty("textTransform", "uppercase");
        s.setProperty("textAlign",     "center");
        s.setProperty("fontWeight",    "bold");
        if (enabled) {
            s.setProperty("background", "linear-gradient(45deg, #00ff88, #00ccff)");
            s.setProperty("color",      "#000");
            s.setProperty("cursor",     "pointer");
            s.setProperty("opacity",    "1");
        } else {
            s.setProperty("background", "rgba(255,255,255,0.08)");
            s.setProperty("color",      "rgba(255,255,255,0.3)");
            s.setProperty("cursor",     "not-allowed");
            s.setProperty("opacity",    "0.5");
        }
    }

    private void styleDescription(Element el) {
        Style s = el.getStyle();
        s.setProperty("fontSize",     "1.1rem");
        s.setProperty("lineHeight",   "1.8");
        s.setProperty("marginBottom", "16px");
        s.setProperty("padding",      "14px 18px");
        s.setProperty("border",       "1px solid rgba(0,255,136,0.25)");
        s.setProperty("borderRadius", "8px");
        s.setProperty("background",   "rgba(0, 20, 10, 0.5)");
        s.setProperty("backdropFilter", "blur(8px)");
        s.setProperty("-webkit-backdrop-filter", "blur(8px)");
        s.setProperty("color",        "#e8e8e8");
        s.setProperty("textShadow",   "0 1px 4px rgba(0,0,0,0.8)");
    }

    private void styleAnswersPanel(Element el) {
        Style s = el.getStyle();
        s.setProperty("display",        "flex");
        s.setProperty("flexDirection",  "column");
        s.setProperty("gap",            "8px");
    }

    private void styleAnswerButton(Element el) {
        Style s = el.getStyle();
        s.setProperty("padding",      "10px 20px");
        s.setProperty("background",   "linear-gradient(45deg, #0a2a1a, #0a1a2a)");
        s.setProperty("border",       "1px solid rgba(0,255,136,0.4)");
        s.setProperty("borderRadius", "8px");
        s.setProperty("color",        "#00ff88");
        s.setProperty("fontSize",     "1rem");
        s.setProperty("cursor",       "pointer");
        s.setProperty("letterSpacing","1px");
        s.setProperty("transition",   "all 0.2s ease");
    }

    private void styleAnswerButtonDisabled(Element el) {
        Style s = el.getStyle();
        s.setProperty("padding",      "10px 20px");
        s.setProperty("background",   "rgba(40,10,10,0.4)");
        s.setProperty("border",       "1px solid rgba(255,80,80,0.25)");
        s.setProperty("borderRadius", "8px");
        s.setProperty("color",        "rgba(255,80,80,0.45)");
        s.setProperty("fontSize",     "0.9rem");
        s.setProperty("cursor",       "not-allowed");
        s.setProperty("letterSpacing","1px");
    }

    private void styleRestartButton(Element el) {
        Style s = el.getStyle();
        s.setProperty("marginTop",     "10px");
        s.setProperty("padding",       "10px 28px");
        s.setProperty("background",    "linear-gradient(45deg, #0077b5, #005885)");
        s.setProperty("borderRadius",  "8px");
        s.setProperty("color",         "#ffffff");
        s.setProperty("fontSize",      "1rem");
        s.setProperty("cursor",        "pointer");
        s.setProperty("letterSpacing", "2px");
        s.setProperty("textTransform", "uppercase");
        s.setProperty("textAlign",     "center");
        s.setProperty("fontWeight",    "bold");
    }

    private void styleSmallBtn(Element el, String bg, String border, String color) {
        Style s = el.getStyle();
        s.setProperty("padding",       "8px 18px");
        s.setProperty("background",    bg);
        s.setProperty("border",        "1px solid " + border);
        s.setProperty("borderRadius",  "8px");
        s.setProperty("color",         color);
        s.setProperty("fontSize",      "0.8rem");
        s.setProperty("cursor",        "pointer");
        s.setProperty("letterSpacing", "2px");
        s.setProperty("textTransform", "uppercase");
    }

    private void styleStatsPanel(Element el) {
        Style s = el.getStyle();
        s.setProperty("marginTop",      "16px");
        s.setProperty("padding",        "20px");
        s.setProperty("border",         "1px solid rgba(0,255,136,0.2)");
        s.setProperty("borderRadius",   "8px");
        s.setProperty("background",     "rgba(0,10,5,0.6)");
        s.setProperty("backdropFilter", "blur(8px)");
    }
}
