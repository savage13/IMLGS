#!/usr/bin/env python3

import json
import requests
from pathlib import Path
import time

API = "https://www.ngdc.noaa.gov/geosamples-api/api/intervals/detail"

rows = []
total_items = None
total_pages = None
page = 1
while True:
    print("Page: ", page, total_pages)
    data = requests.get(f"{API}/?page={page}&items_per_page=500").json()
    if total_items is None:
        total_items = data['total_items']
    if total_pages is None:
        total_pages = data['total_pages']
    rows.append(data['items'])
    page += 1
    if page > total_pages:
        break
    time.sleep(0.5)
json.dump(rows, open("intervals.json","w"))
