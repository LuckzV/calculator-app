
# 
# calculator Lucky 2025.09.12 calculator-20250912-592E04A6 1.0 not bad right!?
# 
# Working Voice Typer - No immediate microphone access
import speech_recognition as sr
import pyautogui
import tkinter as tk
from tkinter import messagebox
import threading

class WorkingVoiceTyper:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Voice Typer")
        self.root.geometry("400x300")
        
        self.is_listening = False
        self.recognizer = None
        self.microphone = None
        
        # Create GUI first
        self.create_gui()
        
        # Initialize microphone when first used
        self.mic_initialized = False
    
    def create_gui(self):
        # Title
        title = tk.Label(self.root, text="Voice Typer", font=("Arial", 16, "bold"))
        title.pack(pady=10)
        
        # Instructions
        instructions = tk.Label(self.root, text="Click 'Start Listening' to begin.\nSpeak clearly into your microphone.", 
                               font=("Arial", 10))
        instructions.pack(pady=5)
        
        # Status
        self.status_label = tk.Label(self.root, text="Ready! Click Start to begin.", fg="green")
        self.status_label.pack(pady=5)
        
        # Text area
        self.text_area = tk.Text(self.root, height=8, width=50, wrap=tk.WORD)
        self.text_area.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
        
        # Buttons
        button_frame = tk.Frame(self.root)
        button_frame.pack(pady=10)
        
        self.start_btn = tk.Button(button_frame, text="Start Listening", 
                                 command=self.start_listening, bg="green", fg="white",
                                 font=("Arial", 12))
        self.start_btn.pack(side=tk.LEFT, padx=5)
        
        self.type_btn = tk.Button(button_frame, text="Type Text", 
                                command=self.type_text, bg="blue", fg="white",
                                font=("Arial", 12))
        self.type_btn.pack(side=tk.LEFT, padx=5)
        
        self.clear_btn = tk.Button(button_frame, text="Clear", 
                                 command=self.clear_text, bg="red", fg="white",
                                 font=("Arial", 12))
        self.clear_btn.pack(side=tk.LEFT, padx=5)
    
    def init_microphone(self):
        """Initialize microphone only when needed"""
        if not self.mic_initialized:
            try:
                self.recognizer = sr.Recognizer()
                self.microphone = sr.Microphone()
                self.mic_initialized = True
                self.status_label.config(text="Microphone ready!", fg="green")
                return True
            except Exception as e:
                self.status_label.config(text=f"Microphone error: {e}", fg="red")
                return False
        return True
    
    def start_listening(self):
        if not self.is_listening:
            # Initialize microphone if needed
            if not self.init_microphone():
                return
                
            self.is_listening = True
            self.start_btn.config(text="Stop", bg="red")
            self.status_label.config(text="Listening... Speak now!", fg="red")
            
            # Start listening in thread
            thread = threading.Thread(target=self.listen)
            thread.daemon = True
            thread.start()
        else:
            self.is_listening = False
            self.start_btn.config(text="Start Listening", bg="green")
            self.status_label.config(text="Stopped", fg="blue")
    
    def listen(self):
        try:
            with self.microphone as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=3, phrase_time_limit=10)
            
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
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = WorkingVoiceTyper()
    app.run()



