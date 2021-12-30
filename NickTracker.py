import os
import requests
import urllib.request
import time
from datetime import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from openpyxl import load_workbook
import pytz
from csv import writer

now = datetime.now(pytz.timezone("US/Central"))
if (
    now.strftime("%A") == "Monday"
    or now.strftime("%A") == "Tuesday"
    or now.strftime("%A") == "Wednesday"
    or now.strftime("%A") == "Thursday"
):
    if int(now.strftime("%H")) < 6:
        print("Nick is closed")
        exit()
if now.strftime("%A") == "Friday":
    if int(now.strftime("%H")) < 6 or int(now.strftime("%H")) > 22:
        print("Nick is closed")
        exit()
if now.strftime("%A") == "Saturday":
    if int(now.strftime("%H")) < 8 or int(now.strftime("%H")) > 22:
        print("Nick is closed")
        exit()
if now.strftime("%A") == "Sunday":
    if int(now.strftime("%H")) < 8:
        print("Nick is closed")
        exit()

driver = webdriver.Chrome()
driver.get("https://recwell.wisc.edu/locations/nick/")
time.sleep(1)
soup = BeautifulSoup(driver.page_source, "html.parser")


level1 = (soup.select("p")[9].text).partition(" ")[0]
level2 = (soup.select("p")[12].text).partition(" ")[0]
level3 = (soup.select("p")[15].text).partition(" ")[0]
ph = (soup.select("p")[18].text).partition(" ")[0]
track = (soup.select("p")[21].text).partition(" ")[0]
court12 = (soup.select("p")[24].text).partition(" ")[0]
court36 = (soup.select("p")[27].text).partition(" ")[0]
court78 = (soup.select("p")[30].text).partition(" ")[0]
courts = str(int(court12) + int(court36) + int(court78))
total = str(
    int(courts) + int(level1) + int(level2) + int(level3) + int(ph) + int(track)
)

with open("NickData.csv",'r') as f:
    with open("NickDataX.csv",'w') as f1:
        next(f)
        for line in f:
            f1.write(line)
os.remove("NickData.csv")
os.rename("NickDataX.csv", "NickData.csv")
data = [
    now.strftime("%m/%d/%Y"),
    now.strftime("%H:%M"),
    level1,
    level2,
    level3,
    ph,
    track,
    courts,
    total,
]
with open("NickData.csv", "a", newline="") as file:
    writer_object = writer(file)
    writer_object.writerow(data)
    file.close()


print(now.strftime("%m/%d/%Y"))
print(now.strftime("%H:%M"))
