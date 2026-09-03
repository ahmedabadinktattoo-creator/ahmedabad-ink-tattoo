import type { Metadata } from "next";

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export function buildMetadata({ title, description, path }: PageSeo): Metadata {
  const canonical = path === "/" ? "/" : path.replace(/\/$/, "");
  const socialTitle = `${title} | Ahmedabad Ink Tattoo`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      type: "website",
      locale: "en_IN",
      siteName: "Ahmedabad Ink Tattoo",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
