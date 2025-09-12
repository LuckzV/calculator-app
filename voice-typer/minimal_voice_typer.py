
# 
# calculator Lucky 2025.09.12 calculator-20250912-FC5A86A4 1.0 not bad right!?
# 
# Minimal Voice Typer - Ultra simple version
import speech_recognition as sr
import pyautogui
import tkinter as tk
from tkinter import messagebox
import threading

def main():
    # Create main window
    root = tk.Tk()
    root.title("Voice Typer")
    root.geometry("400x300")
    
    # Variables
    is_listening = False
    recognizer = None
    microphone = None
    
    # Status label
    status_label = tk.Label(root, text="Ready", fg="green", font=("Arial", 12))
    status_label.pack(pady=10)
    
    # Text area
    text_area = tk.Text(root, height=10, width=50, wrap=tk.WORD)
    text_area.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
    
    def init_mic():
        nonlocal recognizer, microphone
        try:
            recognizer = sr.Recognizer()
            microphone = sr.Microphone()
            status_label.config(text="Microphone ready", fg="green")
            return True
        except Exception as e:
            status_label.config(text=f"Mic error: {e}", fg="red")
            return False
    
    def listen():
        nonlocal is_listening
        try:
            with microphone as source:
                audio = recognizer.listen(source, timeout=3, phrase_time_limit=10)
            text = recognizer.recognize_google(audio)
            
            # Add text to area
            current = text_area.get("1.0", tk.END).strip()
            if current:
                text_area.insert(tk.END, " " + text)
            else:
                text_area.insert(tk.END, text)
            
            status_label.config(text="Text added!", fg="green")
            
        except Exception as e:
            status_label.config(text=f"Error: {e}", fg="red")
        finally:
            is_listening = False
            start_btn.config(text="Start", bg="green")
    
    def start_listening():
        nonlocal is_listening
        if not is_listening:
            if not recognizer:
                if not init_mic():
                    return
            
            is_listening = True
            start_btn.config(text="Listening...", bg="red")
            status_label.config(text="Listening...", fg="red")
            
            thread = threading.Thread(target=listen, daemon=True)
            thread.start()
    
    def type_text():
        text = text_area.get("1.0", tk.END).strip()
        if not text:
            messagebox.showwarning("Warning", "No text to type!")
            return
        
        status_label.config(text="Click where you want to type in 3 seconds...", fg="orange")
        root.after(3000, lambda: do_type(text))
    
    def do_type(text):
        try:
            pyautogui.typewrite(text)
            status_label.config(text="Text typed!", fg="green")
        except Exception as e:
            status_label.config(text=f"Error: {e}", fg="red")
    
    def clear_text():
        text_area.delete("1.0", tk.END)
        status_label.config(text="Cleared", fg="blue")
    
    # Buttons
    button_frame = tk.Frame(root)
    button_frame.pack(pady=10)
    
    start_btn = tk.Button(button_frame, text="Start", command=start_listening, 
                         bg="green", fg="white", font=("Arial", 12))
    start_btn.pack(side=tk.LEFT, padx=5)
    
    type_btn = tk.Button(button_frame, text="Type Text", command=type_text, 
                        bg="blue", fg="white", font=("Arial", 12))
    type_btn.pack(side=tk.LEFT, padx=5)
    
    clear_btn = tk.Button(button_frame, text="Clear", command=clear_text, 
                         bg="red", fg="white", font=("Arial", 12))
    clear_btn.pack(side=tk.LEFT, padx=5)
    
    # Start the app
    root.mainloop()

if __name__ == "__main__":
    main()



