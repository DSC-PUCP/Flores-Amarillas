import fuegosArtificiales from '../../assets/gifs/plantilla-1/fuegos-artificiales.gif';
import floresAbajoImg from '../../assets/images/plantilla-1/flores-abajo.png';

export function Slide2Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Fireworks (GIF) */}
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute top-10 left-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute top-10 right-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute bottom-40 right-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute bottom-40 left-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute top-40 right-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />
      <img
        src={fuegosArtificiales}
        alt=""
        className="absolute top-40 left-10 w-[20%] h-[20%] object-cover opacity-50 pointer-events-none mix-blend-multiply"
      />

      {/* Bottom Decoration - Fixed containment */}
      <div className="absolute -bottom-16 left-0 right-0 w-full pointer-events-none z-20 flex items-end justify-center">
        <img
          src={floresAbajoImg}
          alt=""
          className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
        />
        <img
          src={floresAbajoImg}
          alt=""
          className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
        />
        <img
          src={floresAbajoImg}
          alt=""
          className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
        />
      </div>
    </div>
  );
}
