import { Filter, Search, MapPin, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fetchResources, fetchCompanies } from '@/lib/api';

export default async function Marketplace() {
  const [resources, companies] = await Promise.all([
    fetchResources(),
    fetchCompanies(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resource Marketplace</h1>
          <p className="text-slate-500 mt-1">
            Discover industrial byproducts available for circular reuse.{' '}
            <span className="font-semibold text-green-600">{resources.length} listings</span> available.
          </p>
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
        {resources.map((resource) => {
          const company = companies.find((c) => c.id === resource.companyId);
          return (
            <div
              key={resource.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col card-hover"
            >
              <div className="h-40 bg-slate-100 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                  <Package className="w-16 h-16 text-green-200" />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-sm">
                  {resource.quantity} {resource.unit}
                </div>
                {resource.price === 0 && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                    FREE
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{resource.name}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md shrink-0 ml-2">
                    {resource.price === 0 ? 'Free' : `₹${resource.price}/${resource.unit}`}
                  </span>
                </div>

                <div className="space-y-2 mt-2 mb-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{resource.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">Q</span>
                    <span>Grade: {resource.quality}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600 shrink-0">M</span>
                    <span>{resource.materialType}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs">Supplier</p>
                    <p className="font-medium text-slate-800 truncate max-w-[160px]">{company?.name ?? '—'}</p>
                  </div>
                  <Link
                    href="/matches"
                    className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No resources in the marketplace yet.</p>
            <p className="text-slate-400 text-sm mt-1">Add a resource from your dashboard to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
