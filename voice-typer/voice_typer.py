
# 
# calculator Lucky 2025.09.12 calculator-20250912-0607931F 1.0 not bad right!?
# 
# Voice Typer - Simple voice-to-text desktop app
# This app listens to your voice and types what you say

import speech_recognition as sr
import pyautogui
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time

class VoiceTyper:
    def __init__(self):
        # Create the main window
        self.root = tk.Tk()
        self.root.title("Voice Typer")
        self.root.geometry("400x300")
        
        # Variables to track state
        self.is_listening = False
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Create the GUI
        self.create_widgets()
        
        # Adjust for ambient noise (helps with accuracy)
        print("Adjusting for ambient noise...")
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        print("Ready!")
    
    def create_widgets(self):
        """Create all the buttons and labels for the GUI"""
        
        # Title
        title_label = tk.Label(self.root, text="Voice Typer", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # Instructions
        instructions = tk.Label(self.root, text="Click 'Start Listening' then speak.\nClick 'Type Text' to paste what you said.", 
                               font=("Arial", 10))
        instructions.pack(pady=5)
        
        # Status label
        self.status_label = tk.Label(self.root, text="Ready to listen", fg="blue")
        self.status_label.pack(pady=5)
        
        # Text display area
        self.text_display = tk.Text(self.root, height=8, width=45, wrap=tk.WORD)
        self.text_display.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
        
        # Buttons frame
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=10)
        
        # Start/Stop listening button
        self.listen_button = tk.Button(button_frame, text="Start Listening", 
                                     command=self.toggle_listening, 
                                     bg="green", fg="white", font=("Arial", 12))
        self.listen_button.pack(side=tk.LEFT, padx=5)
        
        # Type text button
        self.type_button = tk.Button(button_frame, text="Type Text", 
                                   command=self.type_text, 
                                   bg="blue", fg="white", font=("Arial", 12))
        self.type_button.pack(side=tk.LEFT, padx=5)
        
        # Clear button
        self.clear_button = tk.Button(button_frame, text="Clear", 
                                    command=self.clear_text, 
                                    bg="red", fg="white", font=("Arial", 12))
        self.clear_button.pack(side=tk.LEFT, padx=5)
    
    def toggle_listening(self):
        """Start or stop listening for voice input"""
        if not self.is_listening:
            self.start_listening()
        else:
            self.stop_listening()
    
    def start_listening(self):
        """Start listening for voice input"""
        self.is_listening = True
        self.listen_button.config(text="Stop Listening", bg="red")
        self.status_label.config(text="Listening... Speak now!", fg="red")
        
        # Start listening in a separate thread so GUI doesn't freeze
        thread = threading.Thread(target=self.listen_for_speech)
        thread.daemon = True
        thread.start()
    
    def stop_listening(self):
        """Stop listening for voice input"""
        self.is_listening = False
        self.listen_button.config(text="Start Listening", bg="green")
        self.status_label.config(text="Stopped listening", fg="blue")
    
    def listen_for_speech(self):
        """Listen for speech and convert to text"""
        try:
            with self.microphone as source:
                # Listen for audio with timeout
                audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
            
            # Convert speech to text
            text = self.recognizer.recognize_google(audio)
            
            # Update the text display
            self.root.after(0, self.update_text_display, text)
            
        except sr.WaitTimeoutError:
            # No speech detected within timeout
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text="No speech detected. Try again.", fg="orange"))
        except sr.UnknownValueError:
            # Speech was unintelligible
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text="Could not understand speech. Try again.", fg="orange"))
        except sr.RequestError as e:
            # API was unreachable
            if self.is_listening:
                self.root.after(0, lambda: self.status_label.config(text=f"Error: {e}", fg="red"))
    
    def update_text_display(self, text):
        """Update the text display with recognized speech"""
        current_text = self.text_display.get("1.0", tk.END).strip()
        if current_text:
            self.text_display.insert(tk.END, " " + text)
        else:
            self.text_display.insert(tk.END, text)
        
        self.status_label.config(text="Text recognized! Click 'Type Text' to paste.", fg="green")
    
    def type_text(self):
        """Type the recognized text wherever the cursor is"""
        text_to_type = self.text_display.get("1.0", tk.END).strip()
        
        if not text_to_type:
            messagebox.showwarning("Warning", "No text to type!")
            return
        
        # Give user 3 seconds to click where they want to type
        self.status_label.config(text="Click where you want to type in 3 seconds...", fg="orange")
        self.root.after(3000, self.do_type_text, text_to_type)
    
    def do_type_text(self, text):
        """Actually type the text"""
        try:
            # Type the text
            pyautogui.typewrite(text)
            self.status_label.config(text="Text typed successfully!", fg="green")
        except Exception as e:
            self.status_label.config(text=f"Error typing: {e}", fg="red")
    
    def clear_text(self):
        """Clear the text display"""
        self.text_display.delete("1.0", tk.END)
        self.status_label.config(text="Text cleared", fg="blue")
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

# Run the app
if __name__ == "__main__":
    app = VoiceTyper()
    app.run()



