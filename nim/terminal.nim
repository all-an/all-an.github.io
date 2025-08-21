when defined(js):
    import dom, jsffi, asyncjs
else:
    import times

type
    Command* = object
        action_description*: string
        nexteventnumber*: int

    StoryEvent* = object
        description*: string
        time*: float
        eventnumber*: int
        commands*: seq[Command]

proc newCommand*(actionDesc: string, nextEvent: int): Command =
    Command(
        action_description: actionDesc,
        nexteventnumber: nextEvent
    )

proc newStoryEvent*(description: string, time: float, eventNumber: int, commands: seq[Command]): StoryEvent =
    StoryEvent(
        description: description,
        time: time,
        eventnumber: eventNumber,
        commands: commands
    )

