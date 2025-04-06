
export class OpenAPI {
  title: string;
  description: string;
  version: string;
  servers: any[];
  tags: any[];
  paths: any;
  components: any;
  constructor(title: string, description: string, server: string, version: string) {
    this.title = title
    this.version = version
    this.description = description
    this.servers = [{ url: server }]
    this.tags = []
    this.paths = {}
    this.components = {
      schemas: {}
    }
  }
  add_tag(name: string, description: string) {
    this.tags.push({ name, description })
  }
  add_path(name: string, opts: any) {
    this.paths[name] = opts
  }
  add_schema(name: string, schema: any) {
    this.components.schemas[name] = schema
  }
  add(defn: any) {
    for (const tag of defn.tags) {
      this.add_tag(tag.name, tag.description)
    }
    for (const [path, op] of Object.entries(defn.paths)) {
      this.add_path(path, op)
    }
    for (const [name, schema] of Object.entries(defn.schemas)) {
      this.add_schema(name, schema)
    }
  }
  static page(schema: string) {
    return {
      type: "object",
      properties: {
        items: { type: "array", items: { "$ref": `#/components/schemas/${schema}` } },
        page: { type: "integer" },
        total_pages: { type: "integer" },
        total_items: { type: "integer" },
        items_per_page: { type: "integer" },
      }
    }
  }
  json() {
    let info = { title: this.title, version: this.version, description: this.description }
    return {
      openapi: "3.0.4", info, servers: this.servers, tags: this.tags, paths: this.paths,
      components: this.components
    }
  }
  static ok_json(schema: string) {
    return {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              "$ref": `#/components/schemas/${schema}`
            }
          }
        }
      }
    }
  }
}
