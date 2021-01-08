
print("--------")

secret_number = random.randrange(1, 101)
attempts = 3
laps = 1
score = 1000

print(secret_number)

print("Type the difficult level")
print("1 - Easy, 2 - Normal, 3 - Hard")

level = int(input("Type the Level Here: "))

if level == 1:
    attempts = 20
elif level == 2:
    attempts = 10
else:
    attempts = 5

for laps in range(1, attempts + 1):
    print("Attempt number {} of {}".format(laps, attempts))
    print("Type a number between 1 and 100.")
    typed_str = input("Type your number: ")

    typed = int(typed_str)

    print("You typed", typed)

    if typed < 1 or typed > 100:
        print("Type between 1 and 100")
        continue

    right = secret_number == typed

    if right:
        print("You got the number, and your score is {} ." .format(score))
        break
    else:
        if typed > secret_number:
            print("You are wrong, your number is higher.")
            print("Try again !")
        elif typed < secret_number:
            print("You are wrong, your number is lower.")
            print("Try again !")
        score_lost = abs(secret_number - typed)
        score = score - score_lost

    laps = laps + 1

print("End of the Game")