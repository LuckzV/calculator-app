
# 
# calculator Lucky 2025.09.12 calculator-20250912-F8D7CAA6 1.0 not bad right!?
# 
# Simple Console Voice Typer
import speech_recognition as sr
import pyautogui
import time

print("=== Simple Voice Typer ===")
print("This will listen for 5 seconds, then type what you said.")
print("Press Ctrl+C to exit")
print()

# Initialize
recognizer = sr.Recognizer()
microphone = sr.Microphone()

try:
    with microphone as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
    print("Microphone ready!")
except Exception as e:
    print(f"Microphone error: {e}")
    input("Press Enter to exit...")
    exit()

while True:
    try:
        input("Press Enter to start listening (or Ctrl+C to exit)...")
        
        print("Listening for 5 seconds... Speak now!")
        
        with microphone as source:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
        
        text = recognizer.recognize_google(audio)
        print(f"You said: '{text}'")
        
        print("Click where you want to type in 3 seconds...")
        time.sleep(3)
        
        pyautogui.typewrite(text)
        print("Text typed!")
        print()
        
    except sr.WaitTimeoutError:
        print("No speech detected. Try again.")
    except sr.UnknownValueError:
        print("Could not understand speech. Try again.")
    except KeyboardInterrupt:
        print("\nGoodbye!")
        break
    except Exception as e:
        print(f"Error: {e}")
        print("Try again...")



