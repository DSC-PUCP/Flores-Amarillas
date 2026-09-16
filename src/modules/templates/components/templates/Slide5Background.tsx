import { assets } from '../../assets/plantilla-1';

export function Slide5Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Petals Background */}
      <img
        src={assets.petalosCayendo}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-multiply"
      />

      {/* Decorative Border Frame */}
      <div className="absolute inset-0 border-[12px] border-pink-300/50 pointer-events-none" />

      {/* Floral Decorations - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-[12%] pointer-events-none flex flex-col justify-between py-8">
        <img src={assets.ramoFlores} alt="" className="w-full object-contain" />
        <img
          src={assets.duoFloresAmarillas}
          alt=""
          className="w-full object-contain"
        />
        <img src={assets.ramoFlores} alt="" className="w-full object-contain" />
      </div>

      {/* Floral Decorations - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 w-[12%] pointer-events-none flex flex-col justify-between py-8">
        <img src={assets.duoRosas} alt="" className="w-full object-contain" />
        <img
          src={assets.ramoFlores}
          alt=""
          className="w-full object-contain scale-x-[-1]"
        />
        <img
          src={assets.duoFloresAmarillas}
          alt=""
          className="w-full object-contain scale-x-[-1]"
        />
      </div>
    </div>
  );
}
