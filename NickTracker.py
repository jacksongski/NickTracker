import mariadb
import sys
from datetime import datetime
import pytz
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
import os
from dotenv import main

main.load_dotenv()


# check for necessary fetch
now = datetime.now(pytz.timezone("US/Central"))
if int(now.strftime("%H")) < 6:
    print("Nick is closed.")
    exit()

# establish site connection
options = Options()
options.BinaryLocation = "/usr/bin/chromium-browser"
driver_path = "/usr/bin/chromedriver"
driver = webdriver.Chrome(options=options, service=Service(driver_path))
driver.get("https://recwell.wisc.edu/locations/nick/")
time.sleep(5)
soup = BeautifulSoup(driver.page_source, "html.parser")

# parse html
content = soup.find_all("span", class_="tracker-current-count")
data = []
for el in content:
    data.append(int(el.getText()))

# vars
courts = sum(data[5:8])
total = sum(data[:])
date = datetime.now().strftime("%Y-%m-%d")
time = datetime.now().strftime("%H:%M:%S")

# connect to server
try:
    conn = mariadb.connect(
        user=os.getenv('USER_TOKEN'),
        password=os.getenv('PASSWORD'),
        host=os.getenv('HOST'),
        port=3306,
        database=os.getenv('DATABASE')
)
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)

# rewrite database
cur = conn.cursor()
try:

    # check for duplicate data
    cur.execute("SELECT * FROM `NickData` LIMIT 149, 1")
    for row in cur:
        last_row = row
    check = []
    for entry in last_row:
        check.append(entry)
    if (check[8] == total and check[2:7] == data[0:5]):
        print(f"No new data. [{date} at {time}]")
        exit()
    elif total == 0 and courts == 0:
        print(f"Data fetched incorrectly. [{date} at {time}]")
        exit()

    # insert new data
    cur.execute(f"""INSERT INTO NickData 
    (Date,Time,Level1,Level2,Level3,
    PowerHouse,Track,Courts,Total) 
    VALUES ('{date}','{time}',{data[0]},{data[1]},{data[2]},
    {data[3]},{data[4]},{courts},{total})""")
    # remove oldest entry
    cur.execute("DELETE FROM NickData LIMIT 1")
    conn.commit()
    print(f"Data logged. [{date} at {time}]")
except:
    pass

conn.close()
