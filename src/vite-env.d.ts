/// <reference types="vite/client" />
/// <reference types="vite-imagetools/types" />

/**
 * Augment the `?as=picture` imagetools query so TypeScript knows the
 * shape we get back: an `img` (default <img> attrs) and a `sources` map
 * keyed by MIME type, each value being a ready-to-use `srcset` string.
 */
declare module '*?as=picture' {
  const value: {
    img: { src: string; w: number; h: number };
    sources: Record<string, string>;
  };
  export default value;
}

declare module '*?imagetools' {
  const value: string;
  export default value;
}
