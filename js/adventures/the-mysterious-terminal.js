/**
 * The Mysterious Terminal - Text Adventure
 * A story about ethical hacking, decision-making, and consequences
 */

const mysteriousTerminalAdventure = {
    id: 1,
    title: "The Mysterious Terminal",
    description: "A cyberpunk adventure about making ethical choices in the digital world",
    events: [
        // Event 1: Starting point
        {
            id: 1,
            description: `You wake up in front of a glowing computer terminal in a dark room. The screen shows a blinking cursor and the text 'SYSTEM BREACH DETECTED - UNAUTHORIZED ACCESS LOGGED'. 

Your head is fuzzy, but you remember you're a security researcher who was investigating suspicious network activity. The terminal displays three options, but you notice something else - a locked filing cabinet nearby and a note on the floor.

The screen shows: "EMERGENCY PROTOCOL ACTIVE - CHOOSE RESPONSE:"`,
            timeLimit: 30,
            commands: [
                { text: "Pull the RED cable (Emergency Shutdown)", nextEvent: 2 },
                { text: "Pull the BLUE cable (Diagnostic Mode)", nextEvent: 3 },
                { text: "Read the note on the floor first", nextEvent: 4 },
                { text: "Try to access the locked filing cabinet", nextEvent: 5 }
            ]
        },

        // Event 2: Red cable - Immediate action
        {
            id: 2,
            description: `You pull the RED cable and alarms start blaring! The emergency shutdown activates, but not before you see a flash of data on the screen: "PATIENT DATABASE - 10,000 RECORDS COMPROMISED".

The lights flicker on, revealing you're in a medical facility's IT room. A voice announces: 'Security breach contained. All personnel report to stations.'

But you saw something troubling - this wasn't just a random attack. The breach was specifically targeting patient mental health records. Someone was trying to steal sensitive psychological profiles.

ETHICAL DILEMMA: You stopped the immediate breach, but the vulnerability still exists. You could:`,
            timeLimit: 25,
            commands: [
                { text: "Report to security immediately (Follow protocol)", nextEvent: 6 },
                { text: "Try to patch the vulnerability yourself first", nextEvent: 7 },
                { text: "Investigate who was behind the attack", nextEvent: 8 }
            ]
        },

        // Event 3: Blue cable - Diagnostic approach  
        {
            id: 3,
            description: `You pull the BLUE cable and the terminal enters diagnostic mode. The screen floods with information:

"SYSTEM ANALYSIS RUNNING...
- FIREWALL: 23 VULNERABILITIES DETECTED
- DATABASE: UNAUTHORIZED QUERIES LOGGED
- SOURCE: INTERNAL NETWORK - EMPLOYEE ID #4471"

A soft hum fills the room as ventilation kicks in. A hidden panel slides open, revealing network equipment. You realize this is a sophisticated internal attack - someone with legitimate access is stealing patient data.

PUZZLE: The system shows recent login attempts. You need to find the pattern:
- Monday 14:30 - Login from Office 204
- Tuesday 14:30 - Login from Office 204  
- Wednesday 14:30 - Login from Office 204
- Thursday 02:15 - Login from Server Room
- Today 14:30 - Login expected from Office 204

What's suspicious about Thursday's login?`,
            timeLimit: 35,
            commands: [
                { text: "The time is different - 02:15 instead of 14:30", nextEvent: 9 },
                { text: "The location is different - Server Room instead of Office 204", nextEvent: 9 },
                { text: "Both the time AND location are different", nextEvent: 10 },
                { text: "Skip the puzzle and investigate the hidden panel", nextEvent: 11 }
            ]
        },

        // Event 4: Reading the note
        {
            id: 4,
            description: `You pick up the crumpled note from the floor. It's written in hurried handwriting:

"If you're reading this, they got to me. The breach isn't random - it's Dr. Martinez. He's been selling patient therapy sessions to insurance companies to deny coverage. I tried to stop him, but he has admin access.

The proof is in his office computer, password is his daughter's name and birth year: Maria2016. But be careful - he's been monitoring security feeds. There's another way through the maintenance tunnels, but you'd need to disable the motion sensors first.

- Sarah (Night Shift IT)

P.S. The red cable triggers alarms, blue cable gives you 5 minutes of diagnostic access before he gets alerts."

MORAL CHOICE: You now know this is a whistleblowing situation. Dr. Martinez is exploiting patients for profit, but taking action could cost jobs and expose personal medical data.`,
            timeLimit: 40,
            commands: [
                { text: "Use the blue cable and gather evidence carefully", nextEvent: 13 },
                { text: "Go directly to Dr. Martinez's office", nextEvent: 14 },
                { text: "Contact external authorities immediately", nextEvent: 15 },
                { text: "Try to find Sarah first to verify the story", nextEvent: 16 }
            ]
        },

        // Event 5: Filing cabinet investigation
        {
            id: 5,
            description: `You examine the locked filing cabinet. It's an electronic lock with a 4-digit display. There's a small camera above it that's been damaged.

Next to the cabinet, you find several clues:
- A family photo showing "Dr. Martinez & Maria - 2016"  
- A medical badge with employee ID "4471"
- A coffee mug with "World's Best Dad since 2016" 
- A calendar with "Maria's birthday - March 12" circled

The cabinet hums softly with network cables running into it. This isn't just storage - it's processing stolen data.

PUZZLE: What's the 4-digit code? Look at the clues:
- Employee ID: 4471
- Birth year: 2016  
- Birthday: March 12 (0312)
- Coffee mug: 2016

Which code makes most sense for a father's personal lock?`,
            timeLimit: 30,
            commands: [
                { text: "Enter 0312 (Maria's birthday month/day)", nextEvent: 17 },
                { text: "Enter 2016 (Maria's birth year)", nextEvent: 18 },
                { text: "Enter 4471 (Employee ID)", nextEvent: 19 },
                { text: "Give up and try a different approach", nextEvent: 20 }
            ]
        },

        // Correct puzzle solutions lead to major revelations
        {
            id: 9,
            description: `Correct! You identified that Thursday's login was suspicious because it happened at 2:15 AM from the Server Room instead of the usual 2:30 PM pattern from Office 204.

This reveals the attacker's mistake - they tried to access the system during off-hours when they thought no one would notice, but forgot to use the regular schedule.

The system logs show: "Employee #4471 - Dr. Martinez - attempted to download ENTIRE patient database at 02:15 Thursday. Download interrupted by security scan."

Now you understand: Dr. Martinez has been stealing patient data during his regular shifts, but got greedy and tried to take everything at once during a night shift.

CRITICAL DECISION: The system shows he's planning another download attempt today at 14:30 - in just 10 minutes! You could:`,
            timeLimit: 20,
            commands: [
                { text: "Set up a trap to catch him in the act", nextEvent: 21 },
                { text: "Block his access immediately", nextEvent: 22 },
                { text: "Alert security and have him arrested", nextEvent: 23 },
                { text: "Confront him directly", nextEvent: 24 }
            ]
        },

        // Event 17: Correct cabinet code
        {
            id: 17,
            description: `The lock clicks open with 0312 - Maria's birthday! Inside the cabinet, you find a hidden computer server running data mining software.

The screen shows horrifying information:
- "PSYCHOLOGICAL PROFILES: 15,247 PATIENTS"
- "INSURANCE DENIALS GENERATED: 3,891" 
- "REVENUE TO MEDDATA ANALYTICS: $2.3 MILLION"

But there's something worse - a file labeled "CHILDREN_TARGETS.xlsx" with 2,847 pediatric patients. The data includes:
- Therapy session notes
- Family financial information  
- School performance records
- Medication histories

A timer shows: "NEXT UPLOAD: 8 MINUTES"

You realize this isn't just about insurance fraud - someone is building detailed psychological profiles of children, possibly for predatory targeting.

URGENT CHOICE: You have 8 minutes before 2,847 children's private medical data gets uploaded to unknown parties:`,
            timeLimit: 15,
            commands: [
                { text: "Destroy the server immediately", nextEvent: 31 },
                { text: "Copy the evidence first, then stop the upload", nextEvent: 32 },
                { text: "Try to trace where the data is going", nextEvent: 33 },
                { text: "Call FBI Child Exploitation Unit immediately", nextEvent: 34 }
            ]
        },

        // Victory Endings
        {
            id: 31,
            description: `PROTECTOR ENDING:

You smash the server with a fire extinguisher, immediately stopping the data upload. Sparks fly as the machine dies, but 2,847 children's psychological profiles are safe.

Within minutes, alarms sound as Dr. Martinez arrives to check on his operation. He finds you standing over the destroyed server, evidence scattered around the room.

"You have no idea what you've done," he says, but his voice cracks. "They have my daughter. If I don't deliver this data..."

The truth comes out: Dr. Martinez's own daughter was kidnapped by a criminal network that forces medical professionals to steal patient data. Children's psychological profiles are sold to online predators and used to manipulate social media algorithms.

Your quick action saved thousands of children, but also doomed Dr. Martinez's daughter - or so it seemed.

RESOLUTION: 
FBI agents, already investigating similar cases, traced the network through your evidence and rescued 12 kidnapped children, including Maria Martinez. The criminal organization was dismantled.

Dr. Martinez received counseling and community service instead of prison time. The hospital implemented new security measures with you as Chief Information Security Officer.

SCORE: PROTECTOR ENDING
"Sometimes the right choice means acting first and asking questions later. You saved 2,847 children."`,
            timeLimit: 5,
            commands: []
        },

        {
            id: 32,
            description: `INVESTIGATOR ENDING:

You quickly copy all the evidence to a secure drive before stopping the upload with 30 seconds to spare. The data reveals a massive criminal network spanning 12 states, all targeting children's medical records.

Your evidence shows:
- 47 compromised medical facilities
- Over 50,000 children's profiles stolen
- A network of predators paying premium prices for psychological vulnerabilities
- Social media companies unknowingly amplifying harmful content to targeted children

The investigation takes three months, but your methodical approach pays off. The evidence you preserved leads to:
- 67 arrests across multiple states
- The rescue of 23 kidnapped children (including Dr. Martinez's daughter)
- New federal laws protecting children's medical privacy
- A complete overhaul of healthcare cybersecurity

RESOLUTION:
Dr. Martinez, revealed to be a victim of blackmail, becomes a key witness. Together, you testify before Congress about the vulnerability of children's medical data.

The Children's Medical Privacy Act, nicknamed "The Martinez Law," becomes a model for international legislation.

SCORE: INVESTIGATOR ENDING
"Your careful documentation saved not just these children, but changed laws to protect all children."`,
            timeLimit: 5,
            commands: []
        },

        {
            id: 34,
            description: `GUARDIAN ENDING:

You immediately call the FBI Child Exploitation Unit, recognizing that this situation requires specialized expertise. Within 90 seconds, agents are coordinating with local police.

"This is Agent Sarah Chen, FBI. We've been tracking this network for eight months. Your call just gave us the break we needed."

While you keep the server running under FBI direction, they use the connection to trace the criminal network in real-time. The upload continues under their supervision, but now it's feeding the criminals fake data while the FBI maps their entire operation.

The coordinated response is swift:
- 23 simultaneous arrests across 8 states
- Rescue of 31 kidnapped children
- Discovery of a $50 million criminal enterprise
- Prevention of data theft from 200+ medical facilities

Dr. Martinez's daughter Maria is among the rescued children. The doctor breaks down when reunited with her, revealing months of terror and blackmail.

RESOLUTION:
Your recognition that some situations require expert intervention led to the largest takedown of a child exploitation network in FBI history.

You receive the Director's Community Leadership Award and work with the FBI to train other healthcare workers to recognize similar threats.

SCORE: GUARDIAN ENDING
"You knew when to call for help. Because you did, 31 children came home safely."`,
            timeLimit: 5,
            commands: []
        }
    ]
};

// Export for use
if (typeof window !== 'undefined') {
    window.mysteriousTerminalAdventure = mysteriousTerminalAdventure;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = mysteriousTerminalAdventure;
}