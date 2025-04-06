#!/usr/bin/env python3

import json
import requests
from pathlib import Path
import time

p = Path("meta")
API = "https://www.ngdc.noaa.gov/geosamples-api/api/"

repos_min = []
for file in p.glob("repos*json"):
    #print(file)
    c = json.load(open(file, "r"))
    repos_min.extend(c['items'])

repos = []
for c in repos_min:
    print(c['id'])
    data = requests.get(f"{API}/repositories/detail/{c['id']}").json()
    repos.append(data)
    time.sleep(0.5)
json.dump(repos, open("repositories.json","w"))
