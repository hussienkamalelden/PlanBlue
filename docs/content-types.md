# Content-types blueprint (not implemented yet)

Planned Strapi collection types for PlanBlue.

## Product

| Field | Type | Notes |
|-------|------|-------|
| title | string | |
| slug | uid | from title |
| description | richtext | |
| price | decimal | |
| images | media (multiple) | stored on R2 |
| category | relation | many-to-one → Category |
| viewCount | integer | default 0 |
| publishedAt | datetime | draft & publish |

## Category

| Field | Type |
|-------|------|
| name | string |
| slug | uid |
| products | relation (one-to-many) |

## Order

| Field | Type | Notes |
|-------|------|-------|
| orderNumber | string | unique |
| customerName | string | guest checkout |
| customerPhone | string | |
| customerEmail | email | |
| items | component/relation | product refs + qty |
| subtotal | decimal | |
| discount | decimal | optional |
| total | decimal | |
| promocode | relation | optional |
| marketer | relation | from promocode |
| commissionAmount | decimal | calculated |
| status | enum | pending, confirmed, shipped, cancelled |

## Marketer (Affiliate)

| Field | Type |
|-------|------|
| name | string |
| phone | string |
| email | email |
| commissionPercent | decimal |
| promocodes | relation (one-to-many) |
| active | boolean |

## Promocode

| Field | Type |
|-------|------|
| code | string (unique) |
| marketer | relation → Marketer |
| discountType | enum | percent, fixed |
| discountValue | decimal |
| validFrom / validUntil | datetime |
| usageLimit | integer |
| usageCount | integer |
