import mariadb
import sys
from datetime import datetime
import pytz
from selenium import webdriver
# from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
import os
from dotenv import main

main.load_dotenv()

# print(os.getenv('USERNAME'))
# print(os.getenv('PASSWORD'))
# print(os.getenv('DATABASE'))
# print(os.getenv('HOST'))
# exit()


# check for necessary fetch
now = datetime.now(pytz.timezone("US/Central"))
if int(now.strftime("%H")) < 6:
    print("Shell is closed.")
    exit()

# establish site connection
options = Options()
options.BinaryLocation = "/usr/bin/chromium-browser"
driver_path = "/usr/bin/chromedriver"
driver = webdriver.Chrome(options=options, service=Service(driver_path))
# driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://recwell.wisc.edu/locations/shell/")
time.sleep(10)
soup = BeautifulSoup(driver.page_source, "html.parser")

# parse html
content = soup.find_all("span", class_="tracker-current-count")
data = []
for el in content:
    data.append(int(el.getText()))
    print(el.getText())

# vars
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
    cur.execute("SELECT * FROM `ShellData` LIMIT 149, 1")
    for row in cur:
        last_row = row
    check = []
    for entry in last_row:
        check.append(entry)
    if (check[5] == total and check[2:5] == data[0:3]):
        print(f"No new data. [{date} at {time}]")
        exit()
    elif total == 0:
        print(f"Data fetched incorrectly. [{date} at {time}]")
        exit()

    # insert new data
    cur.execute(f"""INSERT INTO ShellData 
    (Date,Time,Weights,Track,Cardio,Total) 
    VALUES ('{date}','{time}',{data[0]},{data[1]},{data[2]},
    {total})""")
    # remove oldest entry
    cur.execute("DELETE FROM ShellData LIMIT 1")
    conn.commit()
    print(f"Data logged. [{date} at {time}]")
except:
    pass

conn.close()
