import petalosCayendo from '../../assets/gifs/plantilla-1/petalos-cayendo.gif';
import rosasAbajo from '../../assets/images/plantilla-1/rosas-abajo.png';
import rosasArriba from '../../assets/images/plantilla-1/rosas-arriba.png';

export function Slide1Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle, rgba(252, 239, 220, 1) 60%, rgba(240, 173, 194, 1) 100%)',
        }}
      />

      {/* Petals Overlay */}
      <img
        src={petalosCayendo}
        alt=""
        className="absolute inset-0 z-100 w-[150px] h-[150px] left-1/4 top-[30%] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none mix-blend-multiply scale-x-[-1]"
      />
      <img
        src={petalosCayendo}
        alt=""
        className="absolute inset-0 z-100 w-[150px] h-[150px] left-1/6 top-[50%] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none mix-blend-multiply scale-x-[-1]"
      />
      <img
        src={petalosCayendo}
        alt=""
        className="absolute z-100 w-[150px] h-[150px] right-1/6 top-[30%] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none mix-blend-multiply scale-x-[-1]"
      />
      <img
        src={petalosCayendo}
        alt=""
        className="absolute z-100 w-[150px] h-[150px] right-1/8 top-[50%] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none mix-blend-multiply scale-x-[-1]"
      />

      {/* Floral Decorations */}
      <img
        src={rosasArriba}
        alt=""
        className="absolute top-0 left-0 w-full max-w-[400px] object-contain -translate-y-10 sm:-translate-y-0"
      />
      <img
        src={rosasArriba}
        alt=""
        className="absolute top-0 right-0 w-full max-w-[400px] object-contain scale-x-[-1] -translate-y-10 sm:-translate-y-0"
      />
      <img
        src={rosasAbajo}
        alt=""
        className="absolute bottom-0 left-24 z-40 w-full max-w-[350px] object-contain translate-y-10 sm:translate-y-0 scale-x-[-1]"
      />
      <img
        src={rosasAbajo}
        alt=""
        className="absolute z-40 bottom-0 right-24 w-full max-w-[350px] object-contain translate-y-10 sm:translate-y-0"
      />
    </div>
  );
}
