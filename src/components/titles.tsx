export default function Title({ title }: { title: string }) {
  return (
    <h1 className="font-bold text-[20px] md:text-[44px] text-warning-400 opacity-80 shadow-sm">
      {title}
    </h1>
  );
}

export function SubTitle({ title }: { title: string }) {
  return (
    <h1 className=" text-[15px] md:text-[35px] text-primary-300">{title}</h1>
  );
}
