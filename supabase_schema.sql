-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    "verificationStatus" TEXT DEFAULT 'Unverified'
);

-- 2. Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    "companyId" TEXT REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    quality TEXT,
    location TEXT,
    availability TEXT,
    price NUMERIC NOT NULL
);

-- 3. Create requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY,
    "companyId" TEXT REFERENCES companies(id) ON DELETE SET NULL,
    "materialType" TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    quality TEXT,
    "requiredDate" TEXT,
    location TEXT
);

-- 4. Create matches table
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    "resourceId" TEXT,
    "requirementId" TEXT,
    "matchScore" NUMERIC,
    "distanceKm" NUMERIC,
    status TEXT DEFAULT 'MATCHED',
    "negotiatedPrice" NUMERIC,
    "negotiatedQuantity" NUMERIC,
    "chatHistory" TEXT
);

-- 5. Seed initial mock data
INSERT INTO companies (id, name, industry, location, "verificationStatus") VALUES
('c1', 'ABC Manufacturing', 'Manufacturing', 'Chennai', 'Verified'),
('c2', 'XYZ Components', 'Electronics', 'Chennai', 'Verified')
ON CONFLICT (id) DO NOTHING;

INSERT INTO resources (id, "companyId", name, "materialType", quantity, unit, quality, location, availability, price) VALUES
('res1', 'c1', 'Copper Scrap', 'Copper', 1000, 'kg', 'Industrial Grade', 'Chennai North', 'Immediate', 45),
('res2', 'c1', 'Aluminium Scrap', 'Aluminium', 500, 'kg', '6061', 'Chennai North', 'Immediate', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO requirements (id, "companyId", "materialType", quantity, unit, quality, "requiredDate", location) VALUES
('req1', 'c2', 'Copper', 800, 'kg', 'Industrial Grade', '2026-09-10', 'Chennai South')
ON CONFLICT (id) DO NOTHING;
