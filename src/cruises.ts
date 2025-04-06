
import express from 'express'
import { db } from './db'
import { Page, build_where } from './page'
import { OpenAPI } from './openapi'

const TABLE = "cruises"
const ITEMS_PER_PAGE = 500

const CruiseNameView = ["id", "cruise", "year", "legs"].join(",")
const CruiseNameViewMap = (row: any) => {
  row.legs = JSON.parse(row.legs)
  return row
}

const Cruise = ["id", "cruise", "year", "legs", "facilities", "platforms"].join(",")
const CruiseMap = (row: any) => {
  for (const key of ["legs", "facilities", "platforms"]) {
    row[key] = JSON.parse(row[key])
  }
  return row
}

const CruiseLinkDetail = ["id", "cruise", "year", "legs", "facilities", "platforms", "links"].join(",")
const CruiseLinkDetailMap = (row: any) => {
  for (const key of ["legs", "facilities", "platforms", "links"]) {
    row[key] = JSON.parse(row[key])
  }
  return row
}

function cruise_count(where = "", values = {}) {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE} ${where}`);
  let row = stmt.get(values)
  return row.count
}

const cruise_query = {
  year: { convert: parseInt }
}

export const cruises = (app: express.Router) => {

  app.get("/name", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, cruise_query)

    let page = new Page(req, cruise_count(where, values), ITEMS_PER_PAGE)
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${CruiseNameView} from ${TABLE} ${where} ORDER BY id ${limit} `)
    const rows = stmt.all(pars).map(CruiseNameViewMap)
    res.status(200);
    res.send(page.wrap(rows))
  });

  app.get("/detail", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, cruise_query)

    let page = new Page(req, cruise_count(where, values), ITEMS_PER_PAGE)
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${Cruise} from ${TABLE} ${where} ORDER BY id ${limit}`)
    const rows = stmt.all(pars).map(CruiseMap)
    res.status(200);
    res.send(page.wrap(rows));
  });

  app.get("/detail/:id", (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id)
    const stmt = db.prepare(`SELECT ${CruiseLinkDetail} from ${TABLE} where id = $id LIMIT 1`)
    const row = stmt.all({ id }).map(CruiseLinkDetailMap).at(0)
    res.status(200);
    res.send(row);
  });
  app.get("/count", (_req: express.Request, res: express.Response) => {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE}`);
    const row = stmt.get();
    res.status(200);
    res.send(row);
  });
  return app;
}

// OpenAPI
export const CruiseAPI = {
  tags: [{ name: "cruises", description: "Cruise Information" }],
  paths: {
    "/cruises/name": {
      get: {
        tags: ["cruises"],
        summary: "Get cruise names",
        description: "Get minimal cruise information",
        operationId: "cruiseName",
        parameters: [
          { name: "year", in: "query", description: "Cruise year", required: false, schema: { type: "integer" } },
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("CruiseNamePage"),
      }
    },
    "/cruises/detail": {
      get: {
        tags: ["cruises"],
        summary: "Get cruise details",
        description: "Get details cruise information",
        operationId: "cruiseDetail",
        parameters: [
          { name: "year", in: "query", description: "Cruise year", required: false, schema: { type: "integer" } },
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("CruisePage"),
      },
    },
    "/cruises/detail/{id}": {
      get: {
        tags: ["cruises"],
        summary: "Get single cruise details",
        description: "Get details cruise information",
        operationId: "cruiseDetailId",
        parameters: [
          { name: "id", in: "path", description: "Repository id", required: true, schema: { type: "integer" } }
        ],
        responses: OpenAPI.ok_json("CruiseLinkDetail"),
      },
    },
    "/cruises/count": {
      get: {
        tags: ["cruises"],
        summary: "Get cruise count",
        description: "Get cruise count",
        operationId: "cruiseCount",
        parameters: [
        ],
        responses: OpenAPI.ok_json("CruiseCount"),
      },
    }

  },
  schemas: {
    CruiseName: {
      type: "object",
      properties: {
        id: { type: "integer" },
        cruise: { type: "string" },
        year: { type: "integer" },
        legs: { type: "array", items: { type: "string" } },
      }
    },
    Cruise: {
      type: "object",
      properties: {
        id: { type: "integer" },
        cruise: { type: "string" },
        year: { type: "integer" },
        legs: { type: "array", items: { type: "string" } },
        facilities: { type: "array", items: { "$ref": "#/components/schemas/FacilityName" } },
        platforms: { type: "array", items: { "$ref": "#/components/schemas/PlatformName" } },
      }
    },
    CruiseLink: {
      type: "object",
      properties: {
        id: { type: "integer" },
        cruise: { type: "string" },
        links: { type: "array", items: { "$ref": "#/components/schemas/Link" } },
      }
    },
    CruiseLinkDetail: {
      type: "object",
      properties: {
        id: { type: "integer" },
        cruise: { type: "string" },
        year: { type: "integer" },
        legs: { type: "array", items: { type: "string" } },
        facilities: { type: "array", items: { "$ref": "#/components/schemas/FacilityName" } },
        platforms: { type: "array", items: { "$ref": "#/components/schemas/PlatformName" } },
        links: { type: "array", items: { "$ref": "#/components/schemas/Link" } },
      }
    },
    Link: {
      type: "object",
      properties: {
        link: { type: "string" },
        link_level: { type: "string" },
        link_source: { type: "string" },
        type: { type: "string" },
      }
    },
    FacilityName: {
      type: "object",
      properties: {
        id: { type: "integer" },
        facility: { type: "string" },
        facility_code: { type: "integer" },
        other_link: { type: "string" },
      }
    },
    PlatformName: {
      type: "object",
      properties: {
        id: { type: "integer" },
        platform: { type: "string" },
      }
    },
    CruiseCount: {
      type: "object",
      properties: {
        count: { type: "integer" },
      }
    },
    CruisePage: OpenAPI.page("Cruise"),
    CruiseNamePage: OpenAPI.page("CruiseName"),
  }
}
