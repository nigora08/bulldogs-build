export function ShopPhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const width = /(^|\s)w-/.test(className) ? "" : "w-full";
  return <img src={src} alt={alt} className={`block max-w-full object-cover ${width} ${className}`} />;
}
