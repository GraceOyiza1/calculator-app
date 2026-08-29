# Pack-IQ Calculator - Technical Documentation

This document outlines the database architecture and API integration for the Pack-IQ Calculator. The application uses a secure server-side architecture to protect proprietary pricing formulas and materials data.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod

---

## 1. Database Architecture

The PostgreSQL database is managed via Prisma. The schema is defined in `prisma/schema.prisma`.

### `Lead` Table
Stores contact information for users accessing the gated calculator.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the lead |
| `name` | String | Not Null | Full name of the user |
| `email` | String | Not Null | Work email address |
| `company` | String | Nullable | Optional company name |
| `createdAt` | DateTime | Default `now()` | Timestamp of lead capture |

### `PackagingSpec` Table
Stores the proprietary reference data used for cost and weight calculations. This table is securely maintained on the server and is **never** exposed to the frontend.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the spec |
| `materialType` | String | Unique, Not Null | Name of the material (e.g., Cardboard) |
| `costPerSqFt` | Float | Not Null | Proprietary base cost per square foot |
| `dimensionalDivisor`| Float | Not Null | Proprietary divisor for volumetric weight |
| `updatedAt` | DateTime | Default `now()` | Last update timestamp |

---

## 2. API Routes

All API endpoints are located within the Next.js `app/api` directory and run securely on the backend.

### 2.1 Lead Capture API
**Endpoint:** `POST /api/leads`

Validates user input and creates a new record in the `Lead` table.

**Request Payload (JSON):**
```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Corp" // optional
}
```

**Success Response (201 Created):**
```json
{
  "leadId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Responses:**
- `400 Bad Request`: Zod validation failure (e.g., invalid email).
- `500 Internal Server Error`: Database connection failure.

---

### 2.2 Calculator Engine API
**Endpoint:** `POST /api/calculators/pack-iq`

Performs server-side volumetric and cost calculations. It requires a valid `leadId` to execute, acting as an authorization gate.

**Request Payload (JSON):**
```json
{
  "leadId": "123e4567-e89b-12d3-a456-426614174000",
  "length": 12.5,
  "width": 10.0,
  "height": 8.0,
  "materialType": "Cardboard"
}
```

**Server-Side Execution Flow:**
1. **Authorization:** Verifies the `leadId` exists in the `Lead` table.
2. **Data Fetch:** Retrieves the `costPerSqFt` and `dimensionalDivisor` for the requested `materialType` from the `PackagingSpec` table.
3. **Computation:** 
   - *Volume* = Length × Width × Height
   - *Dimensional Weight* = Volume ÷ Dimensional Divisor
   - *Blank Area* = Surface Area of the box in square feet
   - *Estimated Material Cost* = Blank Area × Cost Per Square Foot

**Success Response (200 OK):**
```json
{
  "dimWeightLbs": "7.19",
  "estimatedMaterialCost": "0.64",
  "blankAreaSqFt": "4.24"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid dimensional inputs (e.g., negative numbers).
- `403 Forbidden`: Lead ID does not exist (unauthorized access).
- `404 Not Found`: Material type not found in the database.
- `500 Internal Server Error`: Computation or database error.

---

## 3. Database Management

### Migrations
When making changes to `prisma/schema.prisma`, sync the changes to the database using:
```bash
npx prisma db push
```

### Seeding
Initial packaging specifications can be seeded into the database by running:
```bash
npx tsx prisma/seed.ts
```
