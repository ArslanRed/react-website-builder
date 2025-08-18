import EditableText from "./EditableText";
import EditableImage, { EditableBackground } from "./EditableElement"; 
import styles from "../styles/Hero.module.css";

function Hero({
  heading,
  onHeadingChange,
  subheading,
  onSubheadingChange,
  ctaText,
  onCtaChange,
  backgroundImage,
  onBackgroundChange,
  style = {},
  elements = {},
}) {
  return (
    <section
      className={styles.hero}
      style={{
        ...style,
        ...(elements["hero"]?.style || {}),
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative", 
      }}
      data-element-id="hero"
    >
      {/* Background Image uploader */}
      <EditableBackground
        src={backgroundImage}
        onChange={onBackgroundChange}   // 🔹 updates the hero's background
        style={{ position: "absolute", top: 0, right: 0, padding: 8, zIndex: 10 }}
        labelText="Change Background"
      />

      {/* Heading */}
      <EditableText
        tag="h1"
        text={heading}
        onChange={onHeadingChange}
        className={styles.heading}
        style={{ ...(elements["heading"]?.style || {}), ...(elements["heading"]?.textStyle || {}), position: 'relative', zIndex: 20 }}
        data-element-id="hero-heading"
      />

      {/* Subheading */}
      <EditableText
        tag="p"
        text={subheading}
        onChange={onSubheadingChange}
        className={styles.subheading}
        style={{ ...(elements["subheading"]?.style || {}), ...(elements["subheading"]?.textStyle || {}), position: 'relative', zIndex: 20 }}
        data-element-id="hero-subheading"
      />

      {/* CTA Button */}
      {ctaText && (
        <button
          className={styles.ctaButton}
          data-element-id="hero-cta"
          style={{ ...(elements["cta"]?.style || {}), position: 'relative', zIndex: 20 }}
        >
          <EditableText
            tag="span"
            text={ctaText}
            onChange={onCtaChange}
            style={{ ...(elements["cta"]?.textStyle || {}), position: 'relative', zIndex: 20 }}
          />
        </button>
      )}
    </section>
  );
}

export default Hero;
