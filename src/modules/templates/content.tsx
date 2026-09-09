import { useNavigate } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { useState } from 'react'
import { usePlans } from '../landing/hooks/usePlans';
import { useTemplates } from './hooks/useTemplate';

export function TemplateContent() {
  const { data: templates = [], isLoading, error } = useTemplates();
  const { data: plans = [] } = usePlans();
  const [selectedPlan,setSelectedPlan]=useState("Todos");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
        <div className="text-center">Cargando plantillas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 py-12 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ maxWidth: '100vw' }}></div>
      <div className="relative z-10 inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 px-4 py-1.5 rounded-full mb-8">
        <Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 fill-rose-500 dark:fill-rose-400" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-rose-600 dark:text-rose-300 uppercase">
          Colección San Valentín
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center tracking-tight text-slate-900 dark:text-white">
        Detalles que{' '}
        <span className="italic text-rose-500 font-serif ml-1">enamoran</span>
      </h1>

      <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light mb-16 text-center opacity-80">
        Desliza hacia abajo para ver todas las opciones
      </p>

      <div className="relative z-10 w-full px-2 mb-16">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-300/30 dark:border-slate-700/30 w-fit mx-auto max-w-full">
          <button onClick={()=>setSelectedPlan("Todos")} type='button' className={`px-4 sm:px-6 py-2 rounded-xl transition-all font-medium text-sm sm:text-base whitespace-nowrap ${selectedPlan==='Todos'?'bg-white dark:bg-slate-800 text-rose-500 shadow-sm border border-slate-200 dark:border-slate-700/50':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            Todos
          </button>
          {
            plans.map(plan=>plan.name).map((plan_name,index)=>(
              <button key={index} onClick={()=>setSelectedPlan(plan_name)} type='button' className={`px-4 sm:px-6 py-2 rounded-xl transition-all font-medium text-sm sm:text-base whitespace-nowrap ${selectedPlan===plan_name?'bg-white dark:bg-slate-800 text-rose-500 shadow-sm border border-slate-200 dark:border-slate-700/50':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {plan_name}
          </button>
            ))
          }
        </div>
      </div>


<div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {templates
          .filter((template)=>{
            if(selectedPlan==="Todos") return true
            return template.tipoPlan===selectedPlan
          })
          .filter((template)=>(template.isVisible)).map((template) => (
          <div
            key={template.id}
            className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 flex flex-col overflow-hidden transition-colors duration-300 relative h-full"
          >
            {template.tipoPlan && (
              <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                {template.tipoPlan}
              </div>
            )}
            <div className="h-48 w-full overflow-hidden">
              <img
                src={template.previewImageUrl}
                alt={template.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors duration-300 group-hover:text-rose-500">
                {template.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                {template.description}
              </p>
              <button
                type="button"
                className="mt-auto w-full py-2.5 rounded-full font-bold border-2 transition-all duration-300
                  border-slate-300 text-slate-900 
                  dark:border-slate-700 dark:text-slate-300 bg-transparent
                  group-hover:bg-rose-500 group-hover:border-rose-500 group-hover:text-white"
                onClick={() => navigate({ to: `/template/${template.id}` })}
              >
                Crear Dedicatoria
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
