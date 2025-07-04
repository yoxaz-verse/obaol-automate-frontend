export default function Title({ title }: { title: string }) {
  return (
    <h1 className="font-bold text-[22px] md:text-[44px] text-warning-400 opacity-80 shadow-sm">
      {title}
    </h1>
  );
}

export function SubTitle({ title }: { title: string }) {
  return (
    <h1 className=" text-[15px] md:text-[35px] text-primary-300">{title}</h1>
  );
}
export function toTitleCase(str: string): string {
  return str
    .replace(/[_\-]+/g, " ") // Replace underscores/dashes with space
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}
