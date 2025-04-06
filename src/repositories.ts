
import express from 'express'
import { db } from './db'
import { Page, build_where } from './page'
import { OpenAPI } from './openapi'

const TABLE = "repositories"
const ITEMS_PER_PAGE = 500

const FacilityDisplay = [
  "id", "facility", "facility_code",
  "other_link", "sample_count", "facility_comment"
].join(",")
const FacilityDisplayMap = (row: any) => { return row }

const FacilityName = ["id", "facility", "facility_code", "other_link"].join(",")
const FacilityNameMap = (row: any) => { return row }

const FacilityDetail = [
  "id", "facility", "facility_code", "other_link",
  "sample_count", "facility_comment", "inst_code",
  "addr1", "addr2", "addr3", "addr4",
  "contact1", "contact2", "contact3",
  "email_link", "url_link", "ftp_link"
].join(",")
const FacilityDetailMap = (row: any) => { return row }

const repositories_query = {
}

function repositories_count(where = "", values = {}) {
  const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE} ${where}`);
  let row = stmt.get(values)
  return row.count
}

export const repositories = (app: express.Router) => {
  app.get("/summary", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, repositories_query)

    let page = new Page(req, repositories_count(where, values), ITEMS_PER_PAGE)
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${FacilityDisplay} from ${TABLE} ${where} ORDER BY id ${limit}`)
    const rows = stmt.all(pars).map(FacilityDisplayMap)

    res.status(200);
    res.send(page.wrap(rows));
  });
  app.get("/name", (req: express.Request, res: express.Response) => {
    let { where, values } = build_where(req, repositories_query)

    let page = new Page(req, repositories_count(where, values), ITEMS_PER_PAGE)
    let { offset, items_per_page, limit } = page.limits()

    let pars = { ...values, offset, items_per_page }

    const stmt = db.prepare(`SELECT ${FacilityName} from ${TABLE} ${where} ORDER BY id ${limit}`)
    const rows = stmt.all(pars).map(FacilityNameMap)

    res.status(200);
    res.send(page.wrap(rows));
  });
  app.get("/count", (_req: express.Request, res: express.Response) => {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE}`);
    const row = stmt.get();
    res.status(200);
    res.send(row);
  });
  app.get("/detail/:id", (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id)
    const stmt = db.prepare(`SELECT ${FacilityDetail} from ${TABLE} where id = $id LIMIT 1`)
    const row = stmt.all({ id }).map(FacilityDetailMap).at(0)
    res.status(200);
    res.send(row);
  });
  return app;
}

// OpenAPI
export const RepositoriesAPI = {
  tags: [{ name: "repositories", description: "Repository Information" }],
  paths: {
    "/repositories/summary": {
      get: {
        tags: ["repositories"],
        summary: "Get Repository summary",
        description: "Get minimal repository information",
        operationId: "repositoriesSummary",
        parameters: [
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("RepositoryDisplayPage"),
      }
    },
    "/repositories/name": {
      get: {
        tags: ["repositories"],
        summary: "Get Repository name",
        description: "Get minimal repository information",
        operationId: "repositoriesName",
        parameters: [
          { name: "page", in: "query", description: "Page number staring at 1", required: false, schema: { type: "integer" } },
          { name: "items_per_page", in: "query", description: "Items per page", required: false, schema: { type: "integer" } },
        ],
        responses: OpenAPI.ok_json("RepositoryNamePage"),
      }
    },
    "/repositories/count": {
      get: {
        tags: ["repositories"],
        summary: "Get Repository count",
        description: "Get repository count",
        operationId: "repositoriesCount",
        parameters: [
        ],
        responses: OpenAPI.ok_json("RepositoriesCount"),
      }
    },
    "/repositories/detail/{id}": {
      get: {
        tags: ["repositories"],
        summary: "Get Repository count",
        description: "Get repository count",
        operationId: "repositoriesDetailId",
        parameters: [
          { name: "id", in: "path", description: "Repository id", required: true, schema: { type: "integer" } }
        ],
        responses: OpenAPI.ok_json("RepositoryDetail"),
      }
    },
  },
  schemas: {
    RepositoryDetail: {
      type: "object",
      properties: {
        id: { type: "integer" },
        facility: { type: "string" },
        facility_code: { type: "integer" },
        other_links: { type: "string" },
        sample_count: { type: "integer" },
        facility_comment: { type: "string" },
        inst_code: { type: "string" },
        addr1: { type: "string" },
        addr2: { type: "string" },
        addr3: { type: "string" },
        addr4: { type: "string" },
        contact1: { type: "string" },
        contact2: { type: "string" },
        contact3: { type: "string" },
        email_link: { type: "string" },
        url_link: { type: "string" },
        ftp_link: { type: "string" },
      }
    },
    RepositoryDisplay: {
      type: "object",
      properties: {
        id: { type: "integer" },
        facility: { type: "string" },
        facility_code: { type: "integer" },
        other_links: { type: "string" },
        sample_count: { type: "integer" },
        facility_comment: { type: "string" },
      }
    },
    RepositoryName: {
      type: "object",
      properties: {
        id: { type: "integer" },
        facility: { type: "string" },
        facility_code: { type: "integer" },
        other_links: { type: "string" },
      }
    },
    RepositoriesCount: {
      type: "object",
      properties: {
        count: { type: "integer" },
      }
    },
    RepositoryDisplayPage: OpenAPI.page("RepositoryDisplay"),
  }
}

