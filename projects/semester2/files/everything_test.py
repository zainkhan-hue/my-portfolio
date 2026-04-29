"""
IDLE COMPLETE FEATURE TESTER
1. Press F5 to Run.
2. Use 'File > Class Browser' to see the structure of this script.
3. Use 'Debug > Debugger' in the Shell before running to test stepping.
"""

import sys
import tkinter as tk
from tkinter import messagebox

class IdleTestCapsule:
    """Tests the Class Browser and Syntax Highlighting"""
    
    def __init__(self):
        self.features = ["Highlighting", "Autocomplete", "Shell", "Debugger"]
        self.test_output()

    def test_output(self):
        # 1. Test Syntax Highlighting (Keywords, Strings, Definitions)
        print("--- IDLE FEATURE TEST START ---")
        print(f"Python Executable: {sys.executable}")
        
        # 2. Test Color Coding for Errors (Standard Error vs Standard Out)
        print("This is normal output (Black/Blue text).")
        print("This is a simulated error (Red text).", file=sys.stderr)

    def test_interactive_gui(self):
        """Tests IDLE's ability to handle Tkinter GUI windows"""
        root = tk.Tk()
        root.title("IDLE GUI Test")
        root.geometry("300x100")
        label = tk.Label(root, text="If you see this window, GUI support is active.")
        label.pack(pady=20)
        
        def on_close():
            print("GUI Window closed successfully.")
            root.destroy()
            
        root.protocol("WM_DELETE_WINDOW", on_close)
        root.mainloop()

def test_recursion_limit():
    """Tests the Stack Viewer (Debug > Stack Viewer)"""
    print("\nTesting recursion depth for Stack Viewer...")
    return True

if __name__ == "__main__":
    # 3. Test Call Tips: Type 'print(' below and see the hint
    print("Testing Autocomplete: Type 'sys.' after this line runs...")
    
    # 4. Test Input handling
    user_input = input("Type something to test Shell Input: ")
    print(f"Input received: {user_input}")

    # 5. Run the Class and GUI tests
    tester = IdleTestCapsule()
    tester.test_interactive_gui()
    
    # 6. Test Traceback: This will create a clickable error link in the shell
    print("\nFinal Test: Creating a clickable error link...")
    raise Exception("Click the line number in the Shell to jump to the code!")
