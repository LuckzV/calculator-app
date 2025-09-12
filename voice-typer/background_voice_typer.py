
# 
# calculator Lucky 2025.09.12 calculator-20250912-265F2E0F 1.0 not bad right!?
# 
# Background Voice Typer - Desktop app that types directly where cursor is
import speech_recognition as sr
import pyautogui
import tkinter as tk
from tkinter import messagebox
import threading
import time
import sys
import os

class BackgroundVoiceTyper:
    def __init__(self):
        # Create a minimal system tray window
        self.root = tk.Tk()
        self.root.title("Voice Typer")
        self.root.geometry("300x150")
        self.root.resizable(False, False)
        
        # Make it stay on top and minimize to system tray
        self.root.attributes('-topmost', True)
        
        # Variables
        self.is_listening = False
        self.recognizer = None
        self.microphone = None
        self.mic_initialized = False
        self.last_text = ""
        
        # Create minimal GUI
        self.create_gui()
        
        # Initialize microphone
        self.init_microphone()
        
        # Hotkey support (Ctrl+Shift+V to start/stop)
        self.setup_hotkeys()
    
    def create_gui(self):
        # Title
        title = tk.Label(self.root, text="Voice Typer", font=("Arial", 14, "bold"))
        title.pack(pady=5)
        
        # Status
        self.status_label = tk.Label(self.root, text="Initializing...", fg="blue", font=("Arial", 10))
        self.status_label.pack(pady=5)
        
        # Buttons
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=10)
        
        self.listen_btn = tk.Button(button_frame, text="Start Listening", 
                                   command=self.toggle_listening, bg="green", fg="white",
                                   font=("Arial", 10), width=12)
        self.listen_btn.pack(side=tk.LEFT, padx=5)
        
        self.type_btn = tk.Button(button_frame, text="Type Last Text", 
                                 command=self.type_last_text, bg="blue", fg="white",
                                 font=("Arial", 10), width=12)
        self.type_btn.pack(side=tk.LEFT, padx=5)
        
        # Instructions
        instructions = tk.Label(self.root, 
                               text="Ctrl+Shift+V: Toggle listening\nText types where cursor is",
                               font=("Arial", 8), fg="gray")
        instructions.pack(pady=5)
        
        # Minimize button
        minimize_btn = tk.Button(self.root, text="Minimize to Tray", 
                                command=self.minimize_to_tray, bg="gray", fg="white",
                                font=("Arial", 8))
        minimize_btn.pack(pady=2)
    
    def init_microphone(self):
        try:
            self.recognizer = sr.Recognizer()
            self.microphone = sr.Microphone()
            
            # Quick test
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            self.mic_initialized = True
            self.status_label.config(text="Ready! Press Ctrl+Shift+V or click Start", fg="green")
            
        except Exception as e:
            self.status_label.config(text=f"Mic error: {str(e)[:30]}...", fg="red")
            messagebox.showerror("Microphone Error", f"Could not access microphone:\n{e}")
    
    def setup_hotkeys(self):
        # Bind Ctrl+Shift+V to toggle listening
        self.root.bind('<Control-Shift-KeyPress-v>', lambda e: self.toggle_listening())
        self.root.bind('<Control-Shift-KeyPress-V>', lambda e: self.toggle_listening())
    
    def toggle_listening(self):
        if not self.mic_initialized:
            messagebox.showerror("Error", "Microphone not initialized!")
            return
            
        if not self.is_listening:
            self.start_listening()
        else:
            self.stop_listening()
    
    def start_listening(self):
        self.is_listening = True
        self.listen_btn.config(text="Stop Listening", bg="red")
        self.status_label.config(text="Listening... Speak now!", fg="red")
        
        # Start listening in thread
        thread = threading.Thread(target=self.listen_continuously, daemon=True)
        thread.start()
    
    def stop_listening(self):
        self.is_listening = False
        self.listen_btn.config(text="Start Listening", bg="green")
        self.status_label.config(text="Stopped listening", fg="blue")
    
    def listen_continuously(self):
        """Listen continuously and type text as it's recognized"""
        while self.is_listening:
            try:
                with self.microphone as source:
                    # Listen for audio with timeout
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=10)
                
                # Convert speech to text
                text = self.recognizer.recognize_google(audio)
                
                # Update GUI and type text
                self.root.after(0, self.handle_recognized_text, text)
                
            except sr.WaitTimeoutError:
                # No speech detected, continue listening
                continue
            except sr.UnknownValueError:
                # Could not understand speech, continue listening
                continue
            except sr.RequestError as e:
                # API error
                self.root.after(0, lambda: self.status_label.config(text=f"API error: {e}", fg="red"))
                break
            except Exception as e:
                # Other error
                self.root.after(0, lambda: self.status_label.config(text=f"Error: {e}", fg="red"))
                break
    
    def handle_recognized_text(self, text):
        """Handle recognized text - type it directly where cursor is"""
        self.last_text = text
        
        # Type the text directly where the cursor is
        try:
            pyautogui.typewrite(text + " ")  # Add space after each recognition
            self.status_label.config(text=f"Typed: '{text[:20]}...'", fg="green")
        except Exception as e:
            self.status_label.config(text=f"Error typing: {e}", fg="red")
    
    def type_last_text(self):
        """Type the last recognized text again"""
        if not self.last_text:
            messagebox.showwarning("Warning", "No text to type!")
            return
        
        try:
            pyautogui.typewrite(self.last_text + " ")
            self.status_label.config(text=f"Re-typed: '{self.last_text[:20]}...'", fg="green")
        except Exception as e:
            self.status_label.config(text=f"Error typing: {e}", fg="red")
    
    def minimize_to_tray(self):
        """Minimize window to system tray"""
        self.root.withdraw()  # Hide window
        self.status_label.config(text="Minimized - Press Ctrl+Shift+V to toggle", fg="blue")
    
    def show_window(self):
        """Show window from system tray"""
        self.root.deiconify()
        self.root.lift()
        self.root.attributes('-topmost', True)
    
    def run(self):
        """Start the application"""
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.cleanup()
    
    def cleanup(self):
        """Clean up on exit"""
        self.is_listening = False
        self.root.destroy()

def main():
    try:
        app = BackgroundVoiceTyper()
        app.run()
    except Exception as e:
        print(f"Error running app: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()



