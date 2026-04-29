import tkinter as tk
import random

class GreetingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Special Greeting")
        
        # Set up a black canvas to make colors pop
        self.canvas = tk.Canvas(root, width=800, height=600, bg='black', highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # Place the name in the center
        self.canvas.create_text(
            400, 300, 
            text="Zain Oluwa Khan", 
            fill="white", 
            font=("Arial", 40, "bold"),
            tags="name"
        )

        self.colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFFF33', '#00FFFF']
        self.animate()

    def create_firework(self):
        # Pick a random spot for the burst
        x = random.randint(100, 700)
        y = random.randint(100, 500)
        color = random.choice(self.colors)
        
        # Create particles that "explode" outward
        particles = []
        for _ in range(20):
            p = self.canvas.create_oval(x, y, x+5, y+5, fill=color, outline=color)
            dx = random.uniform(-5, 5)
            dy = random.uniform(-5, 5)
            particles.append((p, dx, dy))
            
        self.update_particles(particles, 0)

    def update_particles(self, particles, step):
        if step < 20:
            for p, dx, dy in particles:
                self.canvas.move(p, dx, dy)
                # Gradually fade out (optional visual effect)
            self.root.after(30, lambda: self.update_particles(particles, step + 1))
        else:
            for p, dx, dy in particles:
                self.canvas.delete(p)

    def animate(self):
        # Randomly trigger a firework burst
        if random.random() > 0.7:
            self.create_firework()
        
        # Make the text "glow" by changing color slightly
        current_color = random.choice(self.colors)
        self.canvas.itemconfig("name", fill=current_color)
        
        # Keep the animation loop going
        self.root.after(100, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = GreetingApp(root)
    # This keeps the window open until you close it
    root.mainloop()
