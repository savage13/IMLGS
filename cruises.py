#!/usr/bin/env python3

import json
import requests
from pathlib import Path
import time

p = Path("meta")
API = "https://www.ngdc.noaa.gov/geosamples-api/api/"

cruises_min = []
for file in p.glob("cruises*json"):
    #print(file)
    c = json.load(open(file, "r"))
    cruises_min.extend(c['items'])

cruises = []
for c in cruises_min:
    print(c['id'])
    data = requests.get(f"{API}/cruises/detail/{c['id']}").json()
    cruises.append(data)
    time.sleep(0.5)
json.dump(cruises, open("cruises.json","w"))
