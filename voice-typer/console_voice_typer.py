
# 
# calculator Lucky 2025.09.12 calculator-20250912-B080A7C3 1.0 not bad right!?
# 
# Console Voice Typer - No GUI, just console
import speech_recognition as sr
import pyautogui
import time

def main():
    print("=== Voice Typer (Console Version) ===")
    print("Commands:")
    print("  'listen' - Start listening for speech")
    print("  'type' - Type the last recognized text")
    print("  'clear' - Clear the text")
    print("  'quit' - Exit the program")
    print()
    
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    last_text = ""
    
    # Initialize microphone
    print("Initializing microphone...")
    try:
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
        print("Microphone ready!")
    except Exception as e:
        print(f"Microphone error: {e}")
        return
    
    while True:
        try:
            command = input("\nEnter command: ").lower().strip()
            
            if command == "quit":
                print("Goodbye!")
                break
            elif command == "listen":
                print("Listening... Speak now!")
                try:
                    with microphone as source:
                        audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    last_text = recognizer.recognize_google(audio)
                    print(f"Recognized: '{last_text}'")
                except sr.WaitTimeoutError:
                    print("No speech detected")
                except sr.UnknownValueError:
                    print("Could not understand speech")
                except Exception as e:
                    print(f"Error: {e}")
            
            elif command == "type":
                if not last_text:
                    print("No text to type! Use 'listen' first.")
                else:
                    print(f"Typing: '{last_text}'")
                    print("Click where you want to type in 3 seconds...")
                    time.sleep(3)
                    try:
                        pyautogui.typewrite(last_text)
                        print("Text typed successfully!")
                    except Exception as e:
                        print(f"Error typing: {e}")
            
            elif command == "clear":
                last_text = ""
                print("Text cleared")
            
            else:
                print("Unknown command. Try: listen, type, clear, quit")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()



