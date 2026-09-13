import styles from '../premium.module.css';
import {
  Bee,
  Bloom,
  Butterfly,
  FlowerGarland,
  FlowerMeadow,
  FlowerPot,
  FlowerVine,
  SpringPostmark,
} from './spring-art';

export function BotanicalFrame({ variant = 'cover' }: { variant?: string }) {
  return (
    <div className={styles.garden} data-garden={variant} aria-hidden="true">
      <div className={styles.gardenWash} />
      {(variant === 'cover' ||
        variant === 'intro' ||
        variant === 'reasons') && (
        <>
          <svg
            aria-hidden="true"
            focusable="false"
            className={styles.gardenCloud}
            viewBox="0 0 320 130"
          >
            <path
              d="M29 102C-8 98 3 60 34 59 25 17 92 5 111 44c29-48 93-33 98 3 52-25 99 24 67 49Z"
              fill="#FFFEF4"
              opacity="0.85"
            />
          </svg>
          <svg
            aria-hidden="true"
            focusable="false"
            className={styles.gardenCloudSmall}
            viewBox="0 0 240 100"
          >
            <path
              d="M17 83c-27-20-9-42 20-40 5-49 79-53 91-7 38-21 83 6 76 42Z"
              fill="#FFFEF4"
              opacity="0.7"
            />
          </svg>
          <FlowerMeadow className={styles.gardenMeadow} />
        </>
      )}
      {variant === 'intro' && (
        <FlowerGarland className={styles.gardenGarland} />
      )}
      {variant === 'photos' && (
        <>
          <FlowerPot className={styles.gardenPot} />
          <FlowerVine className={styles.gardenRightVine} />
          <SpringPostmark className={styles.gardenStamp} />
        </>
      )}
      {variant === 'letter' && (
        <>
          <FlowerVine hanging className={styles.gardenLeftVine} />
          <SpringPostmark className={styles.gardenStamp} />
          <svg
            aria-hidden="true"
            focusable="false"
            className={styles.gardenCornerBloom}
            viewBox="0 0 200 190"
          >
            <path
              d="M130 180Q36 93 49 26m79 145q-1-93 52-119"
              fill="none"
              stroke="#93AD7C"
              strokeWidth="3"
            />
            <Bloom x={5} y={0} size={98} kind="cosmos" />
            <Bloom x={127} y={26} size={64} />
          </svg>
        </>
      )}
      {variant === 'reasons' && <Bee className={styles.gardenBee} />}
      {variant === 'coupon' && (
        <>
          <div className={styles.gardenPicnic} />
          <FlowerPot basket className={styles.gardenBasket} />
          <FlowerGarland className={styles.gardenGarland} />
        </>
      )}
      {variant === 'finale' && (
        <>
          <FlowerGarland wreath className={styles.gardenWreath} />
          <FlowerVine className={styles.gardenLeftVine} />
          <FlowerVine hanging className={styles.gardenRightVine} />
        </>
      )}
      <Butterfly className={styles.gardenButterfly} />
      {(variant === 'cover' ||
        variant === 'coupon' ||
        variant === 'finale') && (
        <Butterfly className={styles.gardenButterflySmall} />
      )}
      <div className={styles.gardenMotes}>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
