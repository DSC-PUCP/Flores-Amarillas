import petalosCayendo from '../../assets/gifs/plantilla-1/petalos-cayendo.gif';
import duoFloresAmarillas from '../../assets/images/plantilla-1/duo-flores-amarillas.png';
import duoRosas from '../../assets/images/plantilla-1/duo-rosas.png';
import ramoFlores from '../../assets/images/plantilla-1/ramo-flores.png';

export function Slide5Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Petals Background */}
      <img
        src={petalosCayendo}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-multiply"
      />

      {/* Decorative Border Frame */}
      <div className="absolute inset-0 border-[12px] border-pink-300/50 pointer-events-none" />

      {/* Floral Decorations - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-[12%] pointer-events-none flex flex-col justify-between py-8">
        <img src={ramoFlores} alt="" className="w-full object-contain" />
        <img
          src={duoFloresAmarillas}
          alt=""
          className="w-full object-contain"
        />
        <img src={ramoFlores} alt="" className="w-full object-contain" />
      </div>

      {/* Floral Decorations - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 w-[12%] pointer-events-none flex flex-col justify-between py-8">
        <img src={duoRosas} alt="" className="w-full object-contain" />
        <img
          src={ramoFlores}
          alt=""
          className="w-full object-contain scale-x-[-1]"
        />
        <img
          src={duoFloresAmarillas}
          alt=""
          className="w-full object-contain scale-x-[-1]"
        />
      </div>
    </div>
  );
}
