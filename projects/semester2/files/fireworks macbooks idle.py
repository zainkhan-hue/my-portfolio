import tkinter as tk
import random

class CelebrationApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Village School Appreciation")
        
        # Create a full-screen style black canvas
        self.canvas = tk.Canvas(root, width=900, height=600, bg='black', highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)

        # The Thank You Message
        self.message = "Thank you Village School\nfor the Macbooks!"
        self.canvas.create_text(
            450, 300, 
            text=self.message, 
            fill="white", 
            justify="center",
            font=("Helvetica", 40, "bold"),
            tags="text_glow"
        )

        # Vibrant celebration colors
        self.colors = ['#00FF00', '#FF3399', '#6666FF', '#FFFF00', '#00FFFF', '#FF9900']
        self.animate()

    def create_burst(self):
        # Determine a random spot for a celebration burst
        x = random.randint(100, 800)
        y = random.randint(100, 500)
        color = random.choice(self.colors)
        
        particles = []
        # Create 15 small circles that move outward
        for _ in range(15):
            size = random.randint(2, 5)
            p = self.canvas.create_oval(x, y, x+size, y+size, fill=color, outline="")
            dx = random.uniform(-7, 7)
            dy = random.uniform(-7, 7)
            particles.append([p, dx, dy])
            
        self.move_particles(particles, 0)

    def move_particles(self, particles, step):
        if step < 20:
            for p_info in particles:
                self.canvas.move(p_info[0], p_info[1], p_info[2])
            # Schedule the next frame of the burst
            self.root.after(30, lambda: self.move_particles(particles, step + 1))
        else:
            # Clean up particles once the burst is over
            for p_info in particles:
                self.canvas.delete(p_info[0])

    def animate(self):
        # Trigger a new burst every few frames
        if random.random() > 0.75:
            self.create_burst()
        
        # Make the message text change colors (glow effect)
        self.canvas.itemconfig("text_glow", fill=random.choice(self.colors))
        
        # Loop the animation every 100 milliseconds
        self.root.after(100, self.animate)

if __name__ == "__main__":
    root = tk.Tk()
    # Set the window size
    root.geometry("900x600")
    app = CelebrationApp(root)
    root.mainloop()
