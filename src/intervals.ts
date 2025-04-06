
import express from 'express'
import { db } from './db'
import { OpenAPI } from './openapi'
import { Page, build_where } from './page'

const TABLE = "intervals"
const ITEMS_PER_PAGE = 500

function intervals_count(where = "", values = {}) {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE} ${where}`);
  let row = stmt.get(values)
  return row.count
}

const intervals_query = {

}

export const intervals = (app) => {
  app.get("/detail", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, intervals_query)

    let page = new Page(req, intervals_count(where, values), ITEMS_PER_PAGE);
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${Interval} from ${TABLE} ${where} ORDER BY id ${limit} `)
    const rows = stmt.all(pars).map(IntervalMap)
    res.status(200);
    res.send(page.wrap(rows))
  });
  app.get("/detail/:id", (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id)
    const stmt = db.prepare(`SELECT ${Interval} from ${TABLE} where id = $id LIMIT 1`)
    const row = stmt.all({ id }).map(IntervalMap).at(0)
    res.status(200);
    res.send(row);
  });
  app.get("/count", (_req: express.Request, res: express.Response) => {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE}`);
    const row = stmt.get();
    res.status(200);
    res.send(row);
  });
  app.get("/csv", (_req: express.Request, res: express.Response) => {
    res.status(200);
    res.send("csv unimplemented");
  });
  return app;
}

export const IntervalsAPI = {
  tags: [{ name: "intervals", description: "Interval Information" }],
  paths: {
    "/intervals/count": {
      get: {
        tags: ["intervals"],
        summary: "Get interval count",
        description: "Get interval count",
        operationId: "intervalsCount",
        parameters: [
        ],
        responses: OpenAPI.ok_json("IntervalCount"),
      }
    },
    "/intervals/detail": {
      get: {
        tags: ["intervals"],
        summary: "Get interval details",
        description: "Get interval details",
        operationId: "intervalDetail",
        parameters: [
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("IntervalPage"),
      }
    },
    "/intervals/detail/{id}": {
      get: {
        tags: ["intervals"],
        summary: "Get Interval details",
        description: "Get interval details",
        operationId: "intervalDetaislId",
        parameters: [
          { name: "id", in: "path", description: "Sample id", required: true, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("Interval"),
      }
    },
  },
  schemas: {
    Interval: {
      type: "object",
      properties: {
        id: { type: "integer" },
        facility: { "$ref": "#/components/schemas/FacilityName" },
        platform: { type: "string" },
        cruise: { type: "string" },
        sample: { type: "string" },
        decive: { type: "string" },
        interval: { type: "integer" },
        depth_top: { type: "integer" },
        depth_bot: { type: "integer" },
        lith1: { type: "string" },
        lith2: { type: "string" },
        text1: { type: "string" },
        text2: { type: "string" },
        comp1: { type: "string" },
        comp2: { type: "string" },
        comp3: { type: "string" },
        comp4: { type: "string" },
        comp5: { type: "string" },
        comp6: { type: "string" },
        description: { type: "string" },
        ages: { type: "array", items: { type: "string" } },
        absolute_age_top: { type: "string" },
        absolute_age_bot: { type: "string" },
        weight: { type: "real" },
        rock_lith: { type: "string" },
        rock_min: { type: "string" },
        weath_meta: { type: "string" },
        remark: { type: "string" },
        munsell_code: { type: "string" },
        exhaust_code: { type: "string" },
        photo_link: { type: "string" },
        lake: { type: "string" },
        int_comments: { type: "string" },
        igsn: { type: "string" },
        imlgs: { type: "string" },
      }
    },
    IntervalCount: {
      type: "object",
      properties: {
        count: { type: "integer" }
      }
    },
    IntervalPage: OpenAPI.page("Interval"),
  }
}

function is_complex(t: string) {
  return (t == undefined || t == "array")
}

const IntervalSchema: any = IntervalsAPI.schemas.Interval
const IntervalKeys = Object.keys(IntervalSchema.properties)
const Interval = IntervalKeys.join(",")
const IntervalJSON = IntervalKeys.filter(k => is_complex(IntervalSchema.properties[k].type))
const IntervalMap = (row: any) => {
  for (const key of IntervalJSON) {
    row[key] = JSON.parse(row[key])
  }
  return row
}
