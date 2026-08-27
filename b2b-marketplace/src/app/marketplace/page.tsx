import { Filter, Search, MapPin, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function getResources() {
  const res = await fetch('http://localhost:8000/api/resources', { cache: 'no-store' });
  return res.json();
}

async function getCompanies() {
  const res = await fetch('http://localhost:8000/api/companies', { cache: 'no-store' });
  return res.json();
}

export default async function Marketplace() {
  const [resources, companies] = await Promise.all([
    getResources(), getCompanies()
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resource Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover industrial byproducts available for circular reuse.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="pl-9 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {resources.map((resource: any) => {
          const company = companies.find((c: any) => c.id === resource.companyId);
          return (
            <div key={resource.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
              <div className="h-40 bg-slate-100 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                  <Package className="w-16 h-16 text-green-200" />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-sm">
                  {resource.quantity} {resource.unit}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{resource.name}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md">
                    {resource.price === 0 ? 'Free' : `₹${resource.price}/${resource.unit}`}
                  </span>
                </div>
                
                <div className="space-y-2 mt-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{resource.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">Q</div>
                    <span>Grade: {resource.quality}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs">Supplier</p>
                    <p className="font-medium text-slate-800 truncate max-w-[150px]">{company?.name}</p>
                  </div>
                  <Link href={`/matches`} className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
