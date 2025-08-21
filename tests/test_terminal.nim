import unittest
import "../nim/terminal"

suite "Terminal Tests":
    test "newCommand creates command correctly":
        let cmd = newCommand("Go north", 2)
        check cmd.action_description == "Go north"
        check cmd.nexteventnumber == 2

    test "Command type has correct fields":
        let cmd = Command(
            action_description: "Look around",
            nexteventnumber: 5
        )
        check cmd.action_description == "Look around"
        check cmd.nexteventnumber == 5

    test "StoryEvent type can hold commands":
        let cmd1 = newCommand("Go east", 10)
        let cmd2 = newCommand("Go west", 11)
        let event = StoryEvent(
            description: "You are in a forest",
            time: 30.0,
            eventnumber: 1,
            commands: @[cmd1, cmd2]
        )
        check event.commands.len == 2
        check event.commands[0].action_description == "Go east"
        check event.commands[1].nexteventnumber == 11

