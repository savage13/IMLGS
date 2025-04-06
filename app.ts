
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs'
import Database from 'better-sqlite3';
import { db, db_init } from './src/db'
import { OpenAPI } from './src/openapi'

import { cruises, CruiseAPI } from './src/cruises'
import { repositories, RepositoriesAPI } from './src/repositories'
import { samples, SamplesAPI } from './src/samples'
import { intervals, IntervalsAPI } from './src/intervals'

db_init()

// Check all tables for data
for (const table of ["samples", "cruises", "repositories", "intervals"]) {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  if (row.count == 0) {
    console.log(table, row.count)
  }
}

const app = express();

const repos = repositories(express.Router())
const inter = intervals(express.Router())
const sample = samples(express.Router())
const cruise = cruises(express.Router())

app.use('/api/repositories', repos)
app.use('/api/intervals', inter)
app.use('/api/samples', sample)
app.use('/api/cruises', cruise)


// Documentation for the API

const server = "http://localhost:3000/api"
const description = "This is a mirror of the Index to Marine and Lacustrine Geological Samples (IMLGS). The orignal was at \n  [https://www.ncei.noaa.gov/products/index-marine-lacustrine-samples](https://www.ncei.noaa.gov/products/index-marine-lacustrine-samples) and data access at [https://www.ncei.noaa.gov/maps/imlgs/samples](https://www.ncei.noaa.gov/maps/imlgs/samples). "
const api = new OpenAPI("IMLGS Mirror", description, server, "1.0.0")

api.add(CruiseAPI)
api.add(RepositoriesAPI)
api.add(SamplesAPI)
api.add(IntervalsAPI)

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(api.json(), {})
);

console.log("http://localhost:3000")
console.log("http://localhost:3000/api-docs")
app.listen(3000);

