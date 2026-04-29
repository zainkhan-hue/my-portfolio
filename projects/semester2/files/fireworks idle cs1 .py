import tkinter as tk
import random

class CS1Greeting:
    def __init__(self, root):
        self.root = root
        self.root.title("CS 1 Welcome")
        
        # Setup the canvas
        self.canvas = tk.Canvas(root, width=800, height=600, bg='black')
        self.canvas.pack(fill="both", expand=True)

        # The Welcome Message
        self.canvas.create_text(
            400, 300, 
            text="Welcome to CS 1", 
            fill="white", 
            font=("Courier New", 50, "bold"),
            tags="welcome"
        )

        self.colors = ['#FF1493', '#00FFFF', '#ADFF2F', '#FFD700', '#FF4500', '#FFFFFF']
        self.animate()

    def create_sparkle(self):
        # Pick a random location
        x = random.randint(50, 750)
        y = random.randint(50, 550)
        color = random.choice(self.colors)
        
        # Create a "burst" of small particles
        particles = []
        for _ in range(12):
            p = self.canvas.create_oval(x, y, x+4, y+4, fill=color, outline=color)
            vx = random.uniform(-6, 6)
            vy = random.uniform(-6, 6)
            particles.append([p, vx, vy])
            
        self.fade_sparkle(particles, 0)

    def fade_sparkle(self, particles, step):
        if step < 15:
            for p_data in particles:
                self.canvas.move(p_data[0], p_data[1], p_data[2])
            self.root.after(40, lambda: self.fade_sparkle(particles, step + 1))
        else:
            for p_data in particles:
                self.canvas.delete(p_data[0])

    def animate(self):
        # Occasionally launch a new sparkle burst
        if random.random() > 0.8:
            self.create_sparkle()
        
        # Make the text flash different colors
        self.canvas.itemconfig("welcome", fill=random.choice(self.colors))
        
        # Loop the animation
        self.root.after(100, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = CS1Greeting(root)
    root.mainloop()
