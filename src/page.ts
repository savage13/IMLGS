
import express from 'express';

function clamp(value: number, min: number, max: number) {
  if (value <= min)
    return min
  if (value >= max)
    value = max
  return value
}

export class Page {
  total_items: number;
  page: number;
  items_per_page: number;
  max_items_per_page: number;
  total_pages: number;
  offset: number;
  constructor(req: express.Request, total_items: number, max_items_per_page: number) {
    let items_per_page = parseInt(req.query.items_per_page || max_items_per_page)
    items_per_page = clamp(items_per_page, 1, max_items_per_page)
    let page = parseInt(req.query.page || 1)
    page = Math.max(1, page)

    this.page = page
    this.total_items = total_items
    this.max_items_per_page = max_items_per_page
    this.items_per_page = items_per_page

    this.total_pages = Math.ceil(this.total_items / this.items_per_page)
    this.offset = (page - 1) * items_per_page
  }
  limits() {
    return {
      offset: this.offset,
      items_per_page: this.items_per_page,
      limit: "LIMIT $offset, $items_per_page"
    }
  }
  wrap(items: any): any {
    return {
      items,
      page: this.page,
      total_pages: this.total_pages,
      total_items: this.total_items,
      items_per_page: this.items_per_page,
    }
  }
}


export function build_where(req: express.Request, defn: any) {
  let where: any = []
  let values: any = {}
  const pass = (x: any) => { return x }
  for (const key of Object.keys(defn)) {
    if (req.query[key] !== undefined) {
      let value = req.query[key]
      where.push(`${key} = $${key}`)
      let convert = defn[key].convert || pass;
      values[key] = convert(value)
    }
  }
  if (where.length == 0)
    return { where: "", values }
  return { where: "WHERE " + where.join(" AND "), values }
}
