import { ArrowUpRight, Flower2, Heart, Image, Link2 } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section
      id="your-gift"
      className="bloom-section bloom-includes"
      aria-labelledby="includes-title"
    >
      <div className="bloom-container">
        <div className="bloom-includes-heading">
          <div>
            <span className="bloom-eyebrow">
              <span /> MUCHO MÁS QUE UN «FELIZ DÍA»
            </span>
            <h2 id="includes-title">
              Un pequeño enlace.
              <br />
              <em>Mucho de ustedes.</em>
            </h2>
          </div>
          <p>
            Un regalo digital que reúne lo que una foto suelta o un mensaje de
            chat no pueden contar juntos.
          </p>
        </div>
        <div className="bloom-includes-grid">
          <article className="bloom-feature bloom-feature-letter">
            <span className="bloom-feature-icon">
              <Heart size={21} />
            </span>
            <h3>
              Eso que solo tú
              <br />
              podrías escribir.
            </h3>
            <p>
              Una carta con tus palabras, sus nombres y todo el cariño que
              quieras ponerle.
            </p>
            <div className="bloom-mini-letter">
              <span>Para ti, con mucho cariño</span>
              <blockquote>
                «Mis días favoritos
                <br />
                siempre tienen
                <br />
                <em>un poquito de ti.»</em>
              </blockquote>
              <Heart size={19} />
            </div>
          </article>
          <article className="bloom-feature bloom-feature-photos">
            <span className="bloom-feature-icon">
              <Image size={21} />
            </span>
            <h3>
              Sus momentos.
              <br />
              En su propio lugar.
            </h3>
            <p>
              Tu foto de portada y los recuerdos que hacen especial su historia,
              según el diseño.
            </p>
            <div className="bloom-mini-photos" aria-hidden="true">
              <div className="bloom-photo-one">
                <img src="/images/memory-together.jpg" alt="" loading="lazy" />
                <span>Ese día tan bonito ♡</span>
              </div>
              <div className="bloom-photo-two">
                <Flower2 />
                <span>Nosotros, siempre.</span>
              </div>
            </div>
          </article>
          <article className="bloom-feature bloom-feature-link">
            <span className="bloom-feature-icon">
              <Link2 size={21} />
            </span>
            <h3>
              Tan cerca como
              <br />
              abrir un enlace.
            </h3>
            <p>
              Lo envías por tu chat favorito. Lo abre en su celular, sin
              descargar una aplicación.
            </p>
            <div className="bloom-chat">
              <span>Te hice algo. Ábrelo 💛</span>
              <div>
                <Flower2 size={29} />
                <strong>Un regalo para ti</strong>
                <small>Una dedicatoria por descubrir</small>
                <ArrowUpRight size={19} />
              </div>
              <span className="bloom-chat-reply">
                ¿Esto lo hiciste para mí? 🥹
              </span>
            </div>
            <small className="bloom-example-note">
              Ejemplo de cómo puedes compartirlo
            </small>
          </article>
        </div>
      </div>
    </section>
  );
}
