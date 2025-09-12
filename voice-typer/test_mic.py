
# 
# calculator Lucky 2025.09.12 calculator-20250912-B9F02469 1.0 not bad right!?
# 
# Test microphone and speech recognition
import speech_recognition as sr

print("Testing microphone...")

try:
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    
    print("Microphone found!")
    
    with microphone as source:
        print("Adjusting for ambient noise...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
    
    print("Ready! Say something...")
    
    with microphone as source:
        audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
    
    text = recognizer.recognize_google(audio)
    print(f"You said: '{text}'")
    
except Exception as e:
    print(f"Error: {e}")

input("Press Enter to exit...")



