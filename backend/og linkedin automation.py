import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up Chrome options
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
# Uncomment the next line to run in headless mode
# chrome_options.add_argument("--headless")

# Set up the WebDriver
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()), options=chrome_options
)


# Function to log in to LinkedIn
def linkedin_login():
    username = os.getenv("LINKEDIN_USERNAME")
    password = os.getenv("LINKEDIN_PASSWORD")
    driver.get("https://www.linkedin.com/login")
    time.sleep(1)
    username_field = driver.find_element(By.ID, "username")
    password_field = driver.find_element(By.ID, "password")
    username_field.send_keys(username)
    password_field.send_keys(password)
    password_field.send_keys(Keys.RETURN)
    time.sleep(1)
    print("Logged into LinkedIn.")


# Function to send a connection request with a note
def send_connection_request(profile_url, message):
    try:
        driver.get(profile_url)
        print(f"Navigated to {profile_url}")
        time.sleep(2)  # Increase sleep time to ensure the page loads completely

        # Use the specific class name to find the "Connect" button
        connect_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[@class='artdeco-button artdeco-button--2 artdeco-button--primary ember-view pvs-profile-actions__action' and contains(@aria-label, 'Invite')]",
                )
            )
        )
        connect_button.click()
        print("Clicked on Connect button.")

        # Wait until the "Add a note" button is clickable
        add_note_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(@aria-label, 'Add a note')]")
            )
        )
        add_note_button.click()
        print("Clicked on Add a note button.")

        # Wait until the message textarea is present
        message_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "textarea"))
        )
        message_field.send_keys(message)
        print("Entered the message.")

        # Wait until the "Send" button is enabled and clickable
        send_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[contains(@aria-label, 'Send invitation') and not(@disabled)]",
                )
            )
        )
        send_button.click()
        time.sleep(1)
        print("Connection request sent successfully.")
    except Exception as e:
        print(f"Error sending connection request: {e}")
        driver.save_screenshot(
            "/mnt/data/error_screenshot.png"
        )  # Save screenshot for debugging
        print("Screenshot saved as 'error_screenshot.png'.")


# Example usage
if __name__ == "__main__":
    # Replace with the target profile details
    target_profile_url = "https://www.linkedin.com/in/ashton-mathew-63aa06202/"
    personalized_message = "flyingryan"

    linkedin_login()
    send_connection_request(target_profile_url, personalized_message)

    # Close the driver
    driver.quit()
