import { sql } from "drizzle-orm";
import {
  bigint, boolean, customType, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

/** Raw bytes (Postgres bytea). Used for product photos until they move to object storage. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

/*
 * Money rule: every amount is an integer in MINOR units (kobo, cents) with an explicit
 * currency column. Never floats. NGN and USD are never summed together.
 */

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());
const money = (name: string) => bigint(name, { mode: "number" });

/* ───────────── businesses & membership (tenant boundary) ───────────── */

export const memberRole = pgEnum("member_role", ["owner", "admin", "staff"]);
export const businessStatus = pgEnum("business_status", ["draft", "building", "live", "suspended"]);

export const businesses = pgTable("businesses", {
  id: id(),
  name: text("name").notNull(),
  /** Free hosted subdomain: <slug>.<STOREFRONT_BASE_DOMAIN> */
  slug: text("slug").notNull(),
  status: businessStatus("status").notNull().default("draft"),
  category: text("category"),
  description: text("description"),
  country: text("country").notNull().default("NG"),
  currency: text("currency").notNull().default("NGN"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex("businesses_slug_uq").on(t.slug)]);

export const businessMembers = pgTable("business_members", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: memberRole("role").notNull().default("owner"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("business_members_uq").on(t.businessId, t.userId), index("business_members_user_idx").on(t.userId)]);

/** Structured, editable business memory (brand voice, policies, decisions). */
export const agentMemory = pgTable("agent_memory", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  source: text("source").notNull().default("agent"), // owner | agent | extracted
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex("agent_memory_uq").on(t.businessId, t.key)]);

/* ───────────── agent: conversations, tasks, approvals ───────────── */

export const agentConversations = pgTable("agent_conversations", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  title: text("title"),
  createdAt: createdAt(),
}, (t) => [index("agent_conversations_biz_idx").on(t.businessId)]);

export const agentMessages = pgTable("agent_messages", {
  id: id(),
  conversationId: uuid("conversation_id").notNull().references(() => agentConversations.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant | tool
  content: text("content").notNull(),
  toolRunId: uuid("tool_run_id"),
  createdAt: createdAt(),
}, (t) => [index("agent_messages_conv_idx").on(t.conversationId, t.createdAt)]);

export const taskStatus = pgEnum("task_status", [
  "created", "gathering_information", "preparing", "executing", "awaiting_approval",
  "awaiting_external", "verifying", "completed", "failed", "cancelled",
]);

export const agentTasks = pgTable("agent_tasks", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  status: taskStatus("status").notNull().default("created"),
  input: jsonb("input"),
  result: jsonb("result"),
  error: text("error"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("agent_tasks_biz_idx").on(t.businessId, t.status)]);

export const approvalStatus = pgEnum("approval_status", ["pending", "approved", "rejected", "expired", "consumed"]);

/**
 * An approval binds to ONE exact operation: action + target + amount + currency + destination,
 * hashed into `parameters_hash`. A different operation can never reuse it.
 */
export const agentApprovals = pgTable("agent_approvals", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => agentTasks.id),
  action: text("action").notNull(), // publish_store | purchase_domain | refund | wallet_grant ...
  targetType: text("target_type"),
  targetId: text("target_id"),
  amountMinor: money("amount_minor"),
  currency: text("currency"),
  destination: text("destination"),
  parameters: jsonb("parameters").notNull(),
  parametersHash: text("parameters_hash").notNull(),
  status: approvalStatus("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull().default("agent"),
  decidedBy: text("decided_by").references(() => user.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
}, (t) => [index("agent_approvals_biz_idx").on(t.businessId, t.status)]);

export const agentToolRuns = pgTable("agent_tool_runs", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => agentTasks.id),
  tool: text("tool").notNull(),
  input: jsonb("input").notNull(),
  /** completed | pending | awaiting_approval | failed | awaiting_external | needs_information */
  status: text("status").notNull(),
  result: jsonb("result"),
  evidence: jsonb("evidence"),
  errorCode: text("error_code"),
  createdAt: createdAt(),
});

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: id(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  userId: text("user_id"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  taskType: text("task_type").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  durationMs: integer("duration_ms"),
  estimatedCostMicroUsd: bigint("estimated_cost_micro_usd", { mode: "number" }),
  success: boolean("success").notNull(),
  createdAt: createdAt(),
});

/* ───────────── products & stock ───────────── */

export const productStatus = pgEnum("product_status", [
  "draft", "awaiting_owner_confirmation", "pending_review", "published", "rejected", "suspended", "archived",
]);

export const products = pgTable("products", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  productType: text("product_type").notNull().default("physical"), // physical | digital
  priceMinor: money("price_minor"),
  currency: text("currency").notNull().default("NGN"),
  /** Cached; the source of truth is product_stock_movements. */
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(3),
  sku: text("sku"),
  status: productStatus("status").notNull().default("draft"),
  ownerConfirmed: boolean("owner_confirmed").notNull().default(false),
  /** Internal indicator only — not a claim that the information is true. */
  extractionConfidence: integer("extraction_confidence"),
  missingFields: jsonb("missing_fields").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  /** Which facts are merchant-provided vs AI-inferred. */
  provenance: jsonb("provenance").$type<Record<string, "merchant" | "ai_inferred" | "verified">>().notNull().default(sql`'{}'::jsonb`),
  attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("products_biz_idx").on(t.businessId, t.status)]);

export const productVariants = pgTable("product_variants", {
  id: id(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  priceMinor: money("price_minor"),
  sku: text("sku"),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
});

export const productAssets = pgTable("product_assets", {
  id: id(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  /** "db:<id>" while bytes live in `data`; becomes an object-storage key if/when we move to R2. */
  storageKey: text("storage_key").notNull(),
  data: bytea("data"),
  sortOrder: integer("sort_order").notNull().default(0),
  derivatives: jsonb("derivatives").$type<Record<string, string>>().notNull().default(sql`'{}'::jsonb`),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  qualityNotes: jsonb("quality_notes"),
  createdAt: createdAt(),
});

export const productStockMovements = pgTable("product_stock_movements", {
  id: id(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(), // initial | received | sold | adjustment | refund
  orderId: uuid("order_id"),
  /** Prevents double-applying the same payment/webhook event. */
  idempotencyKey: text("idempotency_key"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("stock_movements_idem_uq").on(t.businessId, t.idempotencyKey)]);

/* ───────────── orders (order requests; payments are added later) ───────────── */

export const orderStatus = pgEnum("order_status", ["new", "contacted", "fulfilled", "cancelled"]);

/**
 * A customer's request to buy. Prices are copied from the products at the moment of the request
 * (computed on the server, never taken from the browser). Stock is only deducted when the seller
 * marks the order fulfilled.
 */
export const orders = pgTable("orders", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  /** Short, hard-to-guess code the customer keeps (also their confirmation link). */
  code: text("code").notNull(),
  status: orderStatus("status").notNull().default("new"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  note: text("note"),
  totalMinor: money("total_minor").notNull(),
  currency: text("currency").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex("orders_code_uq").on(t.code), index("orders_biz_idx").on(t.businessId, t.createdAt)]);

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  /** Kept as a link while the product exists; the name and price below are the permanent record. */
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  unitPriceMinor: money("unit_price_minor").notNull(),
  quantity: integer("quantity").notNull(),
}, (t) => [index("order_items_order_idx").on(t.orderId)]);

/* ───────────── security & hackathon evidence ───────────── */

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  actorType: text("actor_type").notNull(), // user | agent | system
  actorId: text("actor_id"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: createdAt(),
}, (t) => [index("audit_logs_biz_idx").on(t.businessId, t.createdAt)]);

/** ERC-8004 identity of the Launchmate agent. Only filled once a registration tx is CONFIRMED. */
export const agentIdentity = pgTable("agent_identity", {
  id: id(),
  chainId: integer("chain_id").notNull(), // 42220 = Celo mainnet
  walletAddress: text("wallet_address").notNull(),
  registry: text("registry"),
  agentId: text("agent_id"),
  registrationTxHash: text("registration_tx_hash"),
  metadataUri: text("metadata_uri"),
  status: text("status").notNull().default("not_registered"), // not_registered | submitted | confirmed | verified
  selfAgentIdStatus: text("self_agent_id_status").notNull().default("not_registered"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** One row per important sponsor/onchain operation (see docs/hackathon). */
export const hackathonEvidence = pgTable("hackathon_evidence", {
  id: id(),
  track: text("track").notNull(), // self_agent_id | agent_vault | altana | textile_fx | erc8004 | x402 | buy
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  task: text("task").notNull(),
  integration: text("integration").notNull(),
  chainId: integer("chain_id"),
  walletAddress: text("wallet_address"),
  txHash: text("tx_hash"),
  providerConfirmation: text("provider_confirmation"),
  outcome: text("outcome").notNull(),
  evidenceUrl: text("evidence_url"),
  attributionTagged: boolean("attribution_tagged").notNull().default(false),
  eligibleToCount: boolean("eligible_to_count").notNull().default(false),
  createdAt: createdAt(),
});
