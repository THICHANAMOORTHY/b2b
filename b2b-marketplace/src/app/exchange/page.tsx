import { CheckCircle2, Truck, FileText, CheckSquare, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Exchange() {
  const steps = [
    { id: 1, title: 'Match Found', status: 'completed', icon: CheckSquare },
    { id: 2, title: 'Negotiation', status: 'completed', icon: MessageSquare },
    { id: 3, title: 'Agreement Signed', status: 'current', icon: FileText },
    { id: 4, title: 'In Transit', status: 'upcoming', icon: Truck },
    { id: 5, title: 'Completed', status: 'upcoming', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exchange Workflow</h1>
        <p className="text-slate-500 mt-1">Transaction TR-8492 • Copper Scrap • 1,000 kg</p>
      </div>

      {/* Stepper */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 transition-all ${
                step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 
                step.status === 'current' ? 'bg-white border-amber-500 text-amber-500 ring-4 ring-amber-100' : 
                'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${
                step.status === 'completed' ? 'text-green-700' : 
                step.status === 'current' ? 'text-amber-700' : 
                'text-slate-400'
              }`}>{step.title}</span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`absolute top-6 left-[50%] w-full h-[2px] -z-10 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Action */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="bg-slate-50 p-6 md:w-1/3 border-r">
          <h3 className="font-semibold text-slate-900 mb-4">Transaction Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Supplier</p>
              <p className="font-medium text-slate-900">ABC Manufacturing</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Buyer</p>
              <p className="font-medium text-slate-900">XYZ Components</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Agreed Price</p>
              <p className="font-bold text-lg text-green-600">₹45,000</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 md:w-2/3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sign Agreement</h2>
              <p className="text-sm text-slate-500">Review and confirm the logistics arrangement.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Pickup</span>
              <span className="font-medium">Chennai North • Sept 5, 2026</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-3">
              <span className="text-slate-600 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Delivery</span>
              <span className="font-medium">Chennai South • Sept 5, 2026</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-3">
              <span className="text-slate-600">Transport Method</span>
              <span className="font-medium bg-slate-200 px-2 py-0.5 rounded text-xs">EV Truck (Low Emission)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-5 py-2 border rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">
              Decline
            </button>
            <Link href="/impact" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
              Sign & Schedule Logistics <Truck className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
