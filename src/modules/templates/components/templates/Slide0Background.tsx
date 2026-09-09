import corazonesTransparentes from '../../assets/gifs/plantilla-1/corazones-transparantes.gif';
import corazonRojo from '../../assets/images/plantilla-1/corazon-rojo.png';

const WhiteHeartWithRed = ({
  size = 100,
  className = '',
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="1.7 -44.1 1987.2 1990.3"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      >
        <g>
          <path
            d="M811.32,209.9C941.6-44.08,1237.44,27.65,1197.85,324.22c-16.5,123.57-79.98,236.42-156.4,334.91 c-59.4,76.55-127.3,146.51-202.05,208.16c-6.47,5.34-14.28,10.95-22.47,9.16c-8.81-1.93-208.54-78.74-400.44-372.65 c-149.25-228.59,6.94-335.43,187.31-257.63c53.84,23.22,104.53,55.2,144.44,98.15C761.72,307.6,779.32,272.3,811.32,209.9z"
            fill="rgb(255, 245, 245)"
          />
          <path
            d="M425.61,324.54c-7.89,46.25-5.5,95.05,12.74,138.29c18.24,43.23,53.4,80.29,97.85,95.32 c-4.64-12.99-14.55-23.26-23.06-34.12c-39.74-50.73-50.64-118.35-51.05-182.79c-0.07-10.73-1.12-23.66-10.64-28.62 C441.42,307.4,426.64,318.46,425.61,324.54z"
            fill="rgb(255, 255, 255)"
          />
        </g>
        <g>
          <path
            d="M1603.86,844.15c160.7-177.73,385.06-55.44,288.67,176.49c-40.16,96.64-116.1,174.39-199.43,237.7 c-64.76,49.21-134.99,91.22-208.97,125.02c-6.4,2.93-13.95,5.78-20.21,2.55c-6.73-3.47-152.05-109.05-243.97-389 c-71.49-217.73,78.33-270.51,207.74-168.32c38.63,30.5,72.81,67.42,95.86,110.9C1542.46,912.63,1564.38,887.82,1603.86,844.15z"
            fill="rgb(255, 245, 245)"
          />
          <path
            d="M1266.22,853.51c-16.42,35.8-25.06,75.89-19.64,114.91s25.9,76.68,58.69,98.51 c-0.95-11.54-6.76-22.01-11.31-32.67c-21.23-49.75-15.42-106.95-1.78-159.3c2.27-8.72,4.22-19.43-2.43-25.52 C1282.76,843.04,1268.38,848.81,1266.22,853.51z"
            fill="rgb(255, 255, 255)"
          />
        </g>
        <g>
          <path
            d="M409.81,1423.16c27.17-238.06,280.79-269.26,337.45-24.58c23.61,101.95,7.14,209.38-23.75,309.36 c-24,77.71-56.64,152.76-97.11,223.31c-3.5,6.11-7.97,12.82-14.94,13.84c-7.49,1.09-187.11-0.14-424.83-174.23 c-184.89-135.4-93.81-265.54,70.9-257.8c49.16,2.31,98.45,12.43,142.51,34.35C399.75,1514.58,403.13,1481.64,409.81,1423.16z"
            fill="rgb(255, 245, 245)"
          />
          <path
            d="M140.74,1627.35c7.49,38.67,23.81,76.29,50.93,104.86s65.71,47.26,105.07,45.92 c-7.49-8.83-18.31-13.96-28.21-19.98c-46.23-28.09-74.8-77.98-94.19-128.48c-3.23-8.41-7.89-18.26-16.83-19.33 C148.09,1609.21,139.76,1622.27,140.74,1627.35z"
            fill="rgb(255, 255, 255)"
          />
        </g>
      </svg>
      <img
        src={corazonRojo}
        alt=""
        className="absolute"
        style={{
          width: '20%',
          height: '20%',
          top: '30%',
          left: '40%',
          transform: 'translate(-50%, -50%) rotate(-10deg)',
          filter: 'blur(0.5px)',
        }}
      />
      <img
        src={corazonRojo}
        alt=""
        className="absolute"
        style={{
          width: '18%',
          height: '18%',
          top: '58%',
          left: '78%',
          transform: 'translate(-50%, -50%) rotate(5deg)',
          filter: 'blur(0.5px)',
        }}
      />
      <img
        src={corazonRojo}
        alt=""
        className="absolute"
        style={{
          width: '18%',
          height: '18%',
          top: '88%',
          left: '25%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          filter: 'blur(0.5px)',
        }}
      />
    </div>
  );
};

export function Slide0Background() {
  const hearts = [
    { top: '-15%', left: '-15%', size: 300, rotate: 0 },
    { top: '-25%', left: '50%', size: 300, rotate: 25 },
    { top: '0%', right: '-5%', size: 250, rotate: -15 },
    { top: '30%', right: '-20%', size: 300, rotate: 45 },
    { bottom: '-21%', right: '-8.5%', size: 250, rotate: 0 },
    { bottom: '-26%', left: '62%', size: 250, rotate: 40 },
    { bottom: '-30%', left: '50%', size: 250, rotate: 10 },
    { bottom: '-2%', left: '-5%', size: 250, rotate: -15 },
    { bottom: '-44%', left: '12%', size: 350, rotate: 45 },
    { top: '8%', left: '-20%', size: 350, rotate: 5 },
  ];

  const transparentGifs = [
    { top: '5%', left: '20%', size: 70, rotate: 40 },
    { top: '10%', left: '60%', size: 70, rotate: -5 },
    { top: '45%', left: '10%', size: 70, rotate: 20 },
    { bottom: '15%', right: '8%', size: 70, rotate: -12 },
    { top: '10%', right: '17%', size: 70, rotate: 5 },
    { bottom: '5%', left: '45%', size: 70, rotate: 18 },
    { bottom: '5%', left: '15%', size: 70, rotate: -5 },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        background: 'rgb(255,255,255)',
        backgroundImage:
          'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(240, 173, 194, 1) 100%)',
      }}
    >
      {hearts.map((heart, i) => (
        <div
          key={`white-${i}`}
          className="absolute"
          style={{
            top: heart.top,
            bottom: (heart as any).bottom,
            left: heart.left,
            right: (heart as any).right,
            transform: `rotate(${heart.rotate}deg)`,
            opacity: 0.9,
          }}
        >
          <WhiteHeartWithRed size={heart.size} />
        </div>
      ))}
      {transparentGifs.map((gif, i) => (
        <img
          key={`gif-${i}`}
          src={corazonesTransparentes}
          alt=""
          className="absolute opacity-100 animate-pulse-slow"
          style={{
            top: gif.top,
            bottom: (gif as any).bottom,
            left: gif.left,
            right: (gif as any).right,
            width: `${gif.size}px`,
            height: 'auto',
            transform: `rotate(${gif.rotate}deg)`,
            animationDelay: `${i * 0.5}s`,
            filter: 'drop-shadow(0 0 5px rgba(255,182,193,0.3))',
          }}
        />
      ))}
    </div>
  );
}
