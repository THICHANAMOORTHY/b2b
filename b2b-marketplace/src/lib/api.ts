export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

import { supabase } from './supabase';

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  verificationStatus: string;
}

export interface Resource {
  id: string;
  companyId: string;
  name: string;
  materialType: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  availability: string;
  price: number;
}

export interface Requirement {
  id: string;
  companyId: string;
  materialType: string;
  quantity: number;
  unit: string;
  quality: string;
  requiredDate: string;
  location: string;
}

export interface Match {
  id: string;
  resourceId: string;
  requirementId: string;
  matchScore: number;
  distanceKm: number;
  status: string;
}

export interface Impact {
  wasteDiverted: number;
  co2eAvoided: number;
  waterSaved: number;
  resourcesReused: number;
  disposalCostAvoided: number;
}

// ─── Direct Supabase Queries with Seamless Backend Fallback ───────────────────

export async function fetchCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase.from('companies').select('*');
    if (!error && data && data.length > 0) {
      return data as Company[];
    }
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/companies`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

export async function createCompany(data: Omit<Company, 'id'> & { id?: string }): Promise<Company> {
  const companyId = data.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const payload: Company = {
    id: companyId,
    name: data.name.trim(),
    industry: data.industry?.trim() || 'Manufacturing',
    location: data.location?.trim() || 'Chennai',
    verificationStatus: data.verificationStatus || 'Verified',
  };

  // 1. Try writing to Supabase
  try {
    const { data: inserted, error } = await supabase.from('companies').insert(payload).select().single();
    if (!error && inserted) {
      try {
        await fetch(`${API_BASE_URL}/api/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
      return inserted as Company;
    }
  } catch (e) {}

  // 2. Fallback to local FastAPI backend
  const res = await fetch(`${API_BASE_URL}/api/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create company');
  return res.json();
}

export async function createCompaniesBulk(companies: (Omit<Company, 'id'> & { id?: string })[]): Promise<Company[]> {
  const payload: Company[] = companies.map((c, index) => ({
    id: c.id || `c_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    name: c.name.trim(),
    industry: c.industry?.trim() || 'Manufacturing',
    location: c.location?.trim() || 'Chennai',
    verificationStatus: c.verificationStatus || 'Verified',
  }));

  // 1. Try writing to Supabase in bulk
  try {
    const { data: inserted, error } = await supabase.from('companies').insert(payload).select();
    if (!error && inserted && inserted.length > 0) {
      try {
        await fetch(`${API_BASE_URL}/api/companies/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
      return inserted as Company[];
    }
  } catch (e) {}

  // 2. Fallback to local FastAPI bulk endpoint
  const res = await fetch(`${API_BASE_URL}/api/companies/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create companies in bulk');
  return res.json();
}

export async function deleteCompany(companyId: string): Promise<void> {
  // 1. Try deleting from Supabase
  try {
    await supabase.from('companies').delete().eq('id', companyId);
  } catch (e) {}

  // 2. Local backend fallback
  try {
    await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

export async function fetchResources(): Promise<Resource[]> {
  try {
    // 1. Check 'listing datas' table
    const { data: ldData, error: ldErr } = await supabase.from('listing datas').select('*');
    if (!ldErr && ldData && ldData.length > 0) {
      const valid = ldData
        .filter((r) => r.name)
        .map((r) => ({
          ...r,
          id: String(r.id),
        })) as Resource[];
      if (valid.length > 0) return valid;
    }

    // 2. Check 'resources' table
    const { data, error } = await supabase.from('resources').select('*');
    if (!error && data && data.length > 0) {
      return data.map((r) => ({ ...r, id: String(r.id) })) as Resource[];
    }
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/resources`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

export async function fetchRequirements(): Promise<Requirement[]> {
  try {
    const { data, error } = await supabase.from('requirements').select('*');
    if (!error && data && data.length > 0) {
      return data.map((r) => ({ ...r, id: String(r.id) })) as Requirement[];
    }
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/requirements`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

export async function fetchMatches(): Promise<Match[]> {
  try {
    const { data, error } = await supabase.from('matches').select('*');
    if (!error && data && data.length > 0) {
      return data.map((r) => ({ ...r, id: String(r.id) })) as Match[];
    }
  } catch (e) {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/matches`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

export const API_BASE = API_BASE_URL;

export async function getMatches(requirementId: string | number) {
  const res = await fetch(`${API_BASE}/matches/${requirementId}`);
  if (!res.ok) {
    const altRes = await fetch(`${API_BASE}/api/matches/${requirementId}`);
    if (!altRes.ok) throw new Error("Failed to fetch matches");
    return altRes.json();
  }
  return res.json();
}

export async function createResource(data: Omit<Resource, 'id'>): Promise<Resource> {
  const numericId = Math.floor(Math.random() * 900000) + 100000;
  const stringId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}`;
  
  // 1. Try writing to 'listing datas' in Supabase
  try {
    const { data: insertedLd, error: errLd } = await supabase
      .from('listing datas')
      .insert({ id: numericId, ...data })
      .select()
      .single();

    if (!errLd && insertedLd) {
      try {
        await fetch(`${API_BASE_URL}/api/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: String(insertedLd.id), ...data }),
        });
      } catch (e) {}
      return { ...insertedLd, id: String(insertedLd.id) } as Resource;
    }
  } catch (e) {}

  // 2. Try writing to 'resources' in Supabase
  try {
    const { data: inserted, error } = await supabase
      .from('resources')
      .insert({ id: stringId, ...data })
      .select()
      .single();

    if (!error && inserted) {
      try {
        await fetch(`${API_BASE_URL}/api/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inserted),
        });
      } catch (e) {}
      return { ...inserted, id: String(inserted.id) } as Resource;
    }
  } catch (e) {}

  // 3. Fallback to local FastAPI backend
  const res = await fetch(`${API_BASE_URL}/api/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: stringId, ...data }),
  });
  if (!res.ok) throw new Error('Failed to create resource');
  return res.json();
}

export async function createRequirement(data: Omit<Requirement, 'id'>): Promise<Requirement> {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`;
  const payload = { id: newId, ...data };

  // 1. Try writing to Supabase
  try {
    const { data: inserted, error } = await supabase.from('requirements').insert(payload).select().single();
    if (!error && inserted) {
      try {
        await fetch(`${API_BASE_URL}/api/requirements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
      return inserted as Requirement;
    }
  } catch (e) {}

  // 2. Fallback to local FastAPI backend
  const res = await fetch(`${API_BASE_URL}/api/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create requirement');
  return res.json();
}

export async function deleteResource(resourceId: string): Promise<void> {
  // 1. Try deleting from Supabase
  try {
    await supabase.from('resources').delete().eq('id', resourceId);
    if (!isNaN(Number(resourceId))) {
      await supabase.from('listing datas').delete().eq('id', Number(resourceId));
    } else {
      await supabase.from('listing datas').delete().eq('id', resourceId);
    }
  } catch (e) {}

  // 2. Call FastAPI backend delete
  try {
    await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

export async function deleteRequirement(requirementId: string): Promise<void> {
  // 1. Try deleting from Supabase
  try {
    await supabase.from('requirements').delete().eq('id', requirementId);
  } catch (e) {}

  // 2. Call FastAPI backend delete
  try {
    await fetch(`${API_BASE_URL}/api/requirements/${requirementId}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

export async function updateMatchStatus(matchId: string, status: string): Promise<void> {
  try {
    await supabase.from('matches').update({ status }).eq('id', matchId);
  } catch (e) {}

  try {
    await fetch(`${API_BASE_URL}/api/matches/${matchId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (e) {}
}

export async function fetchImpact(): Promise<Impact> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/impact`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}

  return {
    wasteDiverted: 1500,
    co2eAvoided: 15750,
    waterSaved: 21000,
    resourcesReused: 2,
    disposalCostAvoided: 27000,
  };
}

export async function generateMatches(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/generate-matches`, { method: 'POST' });
  } catch (e) {}
}

