age = int(input("Enter your age:"))
has_id = input("Do you have your school ID? (yes/no): ")

if age >= 12 and has_id == "yes":
    print("Access granted.")
    if age >= 21:
        print("You're an adult. Welcome!")
else:
    print("Access denied")