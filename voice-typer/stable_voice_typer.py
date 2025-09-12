
# 
# calculator Lucky 2025.09.12 calculator-20250912-B5B479BD 1.0 not bad right!?
# 
# Stable Voice Typer - Independent GUI app
import speech_recognition as sr
import pyautogui
import tkinter as tk
from tkinter import messagebox
import threading
import sys
import os

class StableVoiceTyper:
    def __init__(self):
        try:
            self.root = tk.Tk()
            self.root.title("Voice Typer")
            self.root.geometry("450x350")
            self.root.resizable(True, True)
            
            # Center the window
            self.center_window()
            
            self.is_listening = False
            self.recognizer = None
            self.microphone = None
            self.mic_initialized = False
            
            # Create GUI
            self.create_gui()
            
            # Handle window close
            self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
            
        except Exception as e:
            print(f"Error initializing app: {e}")
            sys.exit(1)
    
    def center_window(self):
        """Center the window on screen"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")
    
    def create_gui(self):
        # Title
        title = tk.Label(self.root, text="Voice Typer", font=("Arial", 18, "bold"))
        title.pack(pady=15)
        
        # Instructions
        instructions = tk.Label(self.root, 
                               text="1. Click 'Start Listening'\n2. Speak clearly into your microphone\n3. Click 'Type Text' and click where you want text", 
                               font=("Arial", 10), justify=tk.LEFT)
        instructions.pack(pady=10)
        
        # Status
        self.status_label = tk.Label(self.root, text="Ready! Click Start to begin.", fg="green", font=("Arial", 11))
        self.status_label.pack(pady=5)
        
        # Text area with scrollbar
        text_frame = tk.Frame(self.root)
        text_frame.pack(pady=10, padx=15, fill=tk.BOTH, expand=True)
        
        self.text_area = tk.Text(text_frame, height=8, width=55, wrap=tk.WORD, font=("Arial", 10))
        scrollbar = tk.Scrollbar(text_frame, orient=tk.VERTICAL, command=self.text_area.yview)
        self.text_area.configure(yscrollcommand=scrollbar.set)
        
        self.text_area.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Buttons
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=15)
        
        self.start_btn = tk.Button(button_frame, text="Start Listening", 
                                 command=self.start_listening, bg="green", fg="white",
                                 font=("Arial", 12), width=15)
        self.start_btn.pack(side=tk.LEFT, padx=5)
        
        self.type_btn = tk.Button(button_frame, text="Type Text", 
                                command=self.type_text, bg="blue", fg="white",
                                font=("Arial", 12), width=15)
        self.type_btn.pack(side=tk.LEFT, padx=5)
        
        self.clear_btn = tk.Button(button_frame, text="Clear", 
                                 command=self.clear_text, bg="red", fg="white",
                                 font=("Arial", 12), width=15)
        self.clear_btn.pack(side=tk.LEFT, padx=5)
    
    def init_microphone(self):
        """Initialize microphone only when needed"""
        if not self.mic_initialized:
            try:
                self.status_label.config(text="Initializing microphone...", fg="orange")
                self.root.update()
                
                self.recognizer = sr.Recognizer()
                self.microphone = sr.Microphone()
                
                # Quick test
                with self.microphone as source:
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                self.mic_initialized = True
                self.status_label.config(text="Microphone ready! Click Start to listen.", fg="green")
                return True
            except Exception as e:
                self.status_label.config(text=f"Microphone error: {str(e)[:50]}...", fg="red")
                messagebox.showerror("Microphone Error", f"Could not access microphone:\n{e}")
                return False
        return True
    
    def start_listening(self):
        if not self.is_listening:
            # Initialize microphone if needed
            if not self.init_microphone():
                return
                
            self.is_listening = True
            self.start_btn.config(text="Stop Listening", bg="red")
            self.status_label.config(text="Listening... Speak now!", fg="red")
            
            # Start listening in thread
            thread = threading.Thread(target=self.listen, daemon=True)
            thread.start()
        else:
            self.is_listening = False
            self.start_btn.config(text="Start Listening", bg="green")
            self.status_label.config(text="Stopped listening", fg="blue")
    
    def listen(self):
        try:
            with self.microphone as source:
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=15)
            
            # Convert speech to text
            text = self.recognizer.recognize_google(audio)
            
            # Update GUI from main thread
            self.root.after(0, self.add_text, text)
            
        except sr.WaitTimeoutError:
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text="No speech detected. Try again.", fg="orange"))
        except sr.UnknownValueError:
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text="Could not understand speech. Try again.", fg="orange"))
        except sr.RequestError as e:
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text=f"API error: {e}", fg="red"))
        except Exception as e:
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text=f"Error: {e}", fg="red"))
    
    def add_text(self, text):
        current = self.text_area.get("1.0", tk.END).strip()
        if current:
            self.text_area.insert(tk.END, " " + text)
        else:
            self.text_area.insert(tk.END, text)
        
        self.status_label.config(text="Text recognized! Click 'Type Text' to paste.", fg="green")
        self.is_listening = False
        self.start_btn.config(text="Start Listening", bg="green")
    
    def type_text(self):
        text = self.text_area.get("1.0", tk.END).strip()
        if not text:
            messagebox.showwarning("Warning", "No text to type!")
            return
        
        self.status_label.config(text="Click where you want to type in 3 seconds...", fg="orange")
        self.root.after(3000, self.do_type, text)
    
    def do_type(self, text):
        try:
            pyautogui.typewrite(text)
            self.status_label.config(text="Text typed successfully!", fg="green")
        except Exception as e:
            self.status_label.config(text=f"Error typing: {e}", fg="red")
    
    def clear_text(self):
        self.text_area.delete("1.0", tk.END)
        self.status_label.config(text="Text cleared", fg="blue")
    
    def on_closing(self):
        """Handle window close"""
        self.is_listening = False
        self.root.destroy()
    
    def run(self):
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.on_closing()

def main():
    try:
        app = StableVoiceTyper()
        app.run()
    except Exception as e:
        print(f"Error running app: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()



