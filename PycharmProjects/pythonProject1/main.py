print("--------")

secret_number = 42

typed = input("Type your number: ")

print("You typed", typed)

if secret_number == int(typed):
    print("You are right")
else:
    print("You are wrong")

print("End of the Game")