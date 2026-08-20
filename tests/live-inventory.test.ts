import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildLiveInventoryResult, describeLiveProduct } from "@/lib/live-inventory";

const products = [
  {
    id: "p1",
    name: "IKE BRAS هودي مخطط",
    price: 500,
    variants: [
      { color: "أحمر", size: "M", stock: 2 },
      { color: "أخضر", size: "M", stock: 0 },
    ],
  },
  { id: "p2", name: "تيشرت سادة", price: 200, variants: [{ color: "أبيض", size: "L", stock: 0 }] },
];

describe("live inventory tool", () => {
  it("splits live stock from sold-out lines", () => {
    const d = describeLiveProduct(products[0]!);
    expect(d.status).toBe("in_stock");
    expect(d.total_quantity).toBe(2);
    expect(d.in_stock).toHaveLength(1);
    expect(d.sold_out).toEqual([{ color: "أخضر", size: "M" }]);
  });

  it("marks a fully sold-out product", () => {
    expect(describeLiveProduct(products[1]!).status).toBe("sold_out");
  });

  it("matches the customer's loose wording to one product", () => {
    const r = buildLiveInventoryResult(products, { product_name: "هودي مخطط" });
    expect(r.matched).toBe(1);
    expect(r.products[0]!.product_id).toBe("p1");
  });

  it("returns the whole catalogue with no query", () => {
    expect(buildLiveInventoryResult(products).matched).toBe(2);
  });

  it("is exposed to the agent and re-reads the database on call", () => {
    const source = readFileSync("src/routes/api/chat-ai.ts", "utf8");
    expect(source).toContain("checkLiveInventoryTool");
    expect(source).toContain('fnName === "check_live_inventory"');
    expect(source).toContain("buildLiveInventoryResult");
  });
});
