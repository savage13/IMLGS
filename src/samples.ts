
import express from 'express'
import { db } from './db'
import { OpenAPI } from './openapi'
import { Page, build_where } from './page'

const TABLE = "samples"
const ITEMS_PER_PAGE = 500

function samples_count(where = "", values = {}) {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE} ${where}`);
  let row = stmt.get(values)
  return row.count
}

const samples_query = {

}

export const samples = (app) => {
  app.get("/summary", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, samples_query)

    let page = new Page(req, samples_count(where, values), ITEMS_PER_PAGE);
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${SampleSummary} from ${TABLE} ${where} ORDER BY id ${limit} `)
    const rows = stmt.all(pars).map(SampleSummaryMap)
    res.status(200);
    res.send(page.wrap(rows))
  });

  app.get("/detail", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, samples_query)

    let page = new Page(req, samples_count(where, values), ITEMS_PER_PAGE);
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${SampleDetail} from ${TABLE} ${where} ORDER BY id ${limit} `)
    const rows = stmt.all(pars).map(SampleDetailMap)
    res.status(200);
    res.send(page.wrap(rows))
  });
  app.get("/detail/:id", (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id)
    const stmt = db.prepare(`SELECT ${SampleDetailLink} from ${TABLE} where id = $id LIMIT 1`)
    const row = stmt.all({ id }).map(SampleDetailLinkMap).at(0)
    res.status(200);
    res.send(row);
  });
  app.get("/csv", (req: express.Request, res: express.Response) => {
    res.status(200);
    res.send("csv unimplemented");
  });
  app.get("/count", (_req: express.Request, res: express.Response) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM samples');
    const row = stmt.get();
    res.status(200);
    res.send(row);
  });
  return app;

}

export const SamplesAPI = {
  tags: [{ name: "samples", description: "Sample Information" }],
  paths: {
    "/samples/summary": {
      get: {
        tags: ["samples"],
        summary: "Get sample summary",
        description: "Get minimal samples information",
        operationId: "samplesSummary",
        parameters: [
          //{ name: "year", in: "query", description: "Cruise year", required: false, schema: { type: "integer" } },
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("SampleSummaryPage"),
      }
    },
    "/samples/count": {
      get: {
        tags: ["samples"],
        summary: "Get sample count",
        description: "Get samples count",
        operationId: "samplesCount",
        parameters: [
        ],
        responses: OpenAPI.ok_json("SampleCount"),
      }
    },
    "/samples/detail": {
      get: {
        tags: ["samples"],
        summary: "Get sample details",
        description: "Get samples details",
        operationId: "samplesDetails",
        parameters: [
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("SampleDetailPage"),
      }
    },
    "/samples/detail{id}": {
      get: {
        tags: ["samples"],
        summary: "Get sample details",
        description: "Get samples details",
        operationId: "samplesDetailsId",
        parameters: [
          { name: "id", in: "path", description: "Sample id", required: true, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("SampleDetailLink"),
      }
    },
  },
  schemas: {
    SampleSummary: {
      type: "object",
      properties: {
        facility: { "$ref": "#/components/schemas/FacilityName" },
        cruise: { type: "string" },
        igsn: { type: "string" },
        sample: { type: "string" },
        platform: { type: "string" },
        device: { type: "string" },
        imlgs: { type: "string" },
        leg: { type: "string" },
        storage_meth: { type: "string" },
        begin_date: { type: "string" },
        lat: { type: "real" },
        lon: { type: "real" },
        water_depth: { type: "integer" },
        cored_length: { type: "integer" },
      }
    },
    SampleDetail: {
      type: "object",
      properties: {
        facility: { "$ref": "#/components/schemas/FacilityName" },
        cruise: { type: "string" },
        igsn: { type: "string" },
        sample: { type: "string" },
        platform: { type: "string" },
        device: { type: "string" },
        imlgs: { type: "string" },
        leg: { type: "string" },
        storage_meth: { type: "string" },
        begin_date: { type: "string" },
        lat: { type: "real" },
        lon: { type: "real" },
        water_depth: { type: "integer" },
        cored_length: { type: "integer" },
        latlon_orig: { type: "string" },
        lake: { type: "string" },
        publish: { type: "string" },
        province: { type: "string" },
        end_date: { type: "string" },
        end_lat: { type: "real" },
        end_lon: { type: "real" },
        end_water_depth: { type: "integer" },
        cored_length_mm: { type: "integer" },
        cored_diam: { type: "integer" },
        cored_diam_mm: { type: "integer" },
        pi: { type: "string" },
        other_link: { type: "string" },
        last_update: { type: "string" },
        sample_comments: { type: "string" },
        show_sampl: { type: "string" },
        ship_code: { type: "string" },
      }
    },
    SampleDetailLink: {
      type: "object",
      properties: {
        //facility: { "$ref": "#/components/schemas/RepositoryName" },
        facility: { type: "string" }, // Different between Arc and regular db
        //intervals: { "$ref": "#/components/schamas/Interval" },
        //cruise: { "$ref": "#/components/schamas/CruiseLink" },
        igsn: { type: "string" },
        sample: { type: "string" },
        platform: { type: "string" },
        device: { type: "string" },
        imlgs: { type: "string" },
        leg: { type: "string" },
        storage_meth: { type: "string" },
        begin_date: { type: "string" },
        lat: { type: "real" },
        lon: { type: "real" },
        water_depth: { type: "integer" },
        cored_length: { type: "integer" },
        latlon_orig: { type: "string" },
        lake: { type: "string" },
        publish: { type: "string" },
        province: { type: "string" },
        end_date: { type: "string" },
        end_lat: { type: "real" },
        end_lon: { type: "real" },
        end_water_depth: { type: "integer" },
        cored_length_mm: { type: "integer" },
        cored_diam: { type: "integer" },
        cored_diam_mm: { type: "integer" },
        pi: { type: "string" },
        other_link: { type: "string" },
        last_update: { type: "string" },
        sample_comments: { type: "string" },
        show_sampl: { type: "string" },
        ship_code: { type: "string" },
        links: { "$ref": "#components/schemas/Link" }
      }
    },
    SampleCount: {
      type: "object",
      properties: {
        count: { type: "integer" }
      }
    },
    SampleSummaryPage: OpenAPI.page("SampleSummary"),
    SampleDetailPage: OpenAPI.page("SampleDetail"),
  }
}

function is_complex(t: string) {
  return (t == undefined || t == "array")
}

const SampleSummarySchema: any = SamplesAPI.schemas.SampleSummary
const SampleSummaryKeys = Object.keys(SampleSummarySchema.properties)
const SampleSummary = SampleSummaryKeys.join(",")
const SampleSummaryJSON = SampleSummaryKeys.filter(k => is_complex(SampleSummarySchema.properties[k].type))
const SampleSummaryMap = (row: any) => {
  for (const key of SampleSummaryJSON) {
    row[key] = JSON.parse(row[key])
  }
  return row
}

const SampleDetailSchema: any = SamplesAPI.schemas.SampleDetail
const SampleDetailKeys = Object.keys(SampleDetailSchema.properties)
const SampleDetail = SampleDetailKeys.join(",")
const SampleDetailJSON = SampleDetailKeys.filter(k => is_complex(SampleDetailSchema.properties[k].type))
const SampleDetailMap = (row: any) => {
  for (const key of SampleDetailJSON) {
    row[key] = JSON.parse(row[key])
  }
  return row
}


const SampleDetailLinkSchema: any = SamplesAPI.schemas.SampleDetailLink
const SampleDetailLinkKeys = Object.keys(SampleDetailLinkSchema.properties)
const SampleDetailLink = SampleDetailLinkKeys.join(",")
const SampleDetailLinkJSON = SampleDetailLinkKeys.filter(k => is_complex(SampleDetailLinkSchema.properties[k].type))
const SampleDetailLinkMap = (row: any) => {
  for (const key of SampleDetailLinkJSON) {
    row[key] = JSON.parse(row[key])
  }
  return row
}

