import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const assets = [
  "artists/kartik-master.jpg", "artists/manish-master.jpg", "artists/sachin-master.jpg", "logo.png",
  "portfolio/ankle-botanical.avif", "portfolio/blackwork-armband.avif", "portfolio/blackwork-owl.avif",
  "portfolio/blackwork-snowflake.avif", "portfolio/blackwork-wing.avif", "portfolio/child-portrait.avif",
  "portfolio/colour-lotus-back.avif", "portfolio/colour-tiger.avif", "portfolio/fine-line-arrow-feather.avif",
  "portfolio/fine-line-arrow.avif", "portfolio/fine-line-botanical.avif", "portfolio/fine-line-butterfly.avif",
  "portfolio/ganesha-forearm.avif", "portfolio/ganesha-mandala.avif", "portfolio/geometric-back.avif",
  "portfolio/geometric-hand-flower.avif", "portfolio/geometric-spine.avif", "portfolio/hope-wings.avif",
  "portfolio/lion-forearm.avif", "portfolio/lion-realism.avif", "portfolio/lotus-back.avif",
  "portfolio/mandala-hand.avif", "portfolio/mechanical-forearm.avif", "portfolio/memorial-floral.avif",
  "portfolio/minimal-ear-symbol.avif", "portfolio/minimal-snowflake.avif", "portfolio/music-watercolour.avif",
  "portfolio/ornamental-back.avif", "portfolio/portrait-forearm.avif", "portfolio/shiva-linework.avif",
  "portfolio/shiva-portrait-forearm.avif", "portfolio/temple-forearm.avif",
  "studio/consultation-lounge.webp", "studio/front-desk.webp", "studio/home-hero.webp",
  "studio/studio-entrance.webp", "studio/studio-sign.webp", "studio/tattoo-room.webp",
];

for (const asset of assets) {
  const destination = new URL(`../public/${asset}`, import.meta.url);
  try {
    await access(destination);
    continue;
  } catch {}

  const response = await fetch(`https://www.ahmedabadinktattoo.com/${asset}`);
  if (!response.ok) throw new Error(`Could not restore ${asset}: ${response.status}`);
  await mkdir(dirname(destination.pathname), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}
