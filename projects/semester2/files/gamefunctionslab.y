import random

def check(guess, secret):
    if guess == secret: 
        return "Correct!"
    return "Too high" if guess > secret else "Too low"

playing = "y"

while playing.lower() == "y":
    target = random.randint(1, 10)
    guess = 0
    
    print("\n--- New Round! ---")
    
    while True:
        u = input("Guess 1-10: ")
        
        if u.isdigit():
            guess = int(u)
            
            # Range check for better UX
            if not 1 <= guess <= 10:
                print("Please stay between 1 and 10!")
                continue
                
            result = check(guess, target)
            print(result)
            
            if result == "Correct!":
                break # Exit the guessing loop
        else:
            print("Numbers only!")
            
    playing = input("Play again? (y/n): ")

print("Thanks for playing!")