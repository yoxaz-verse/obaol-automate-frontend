import Header from "@/components/home/header";

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="pt-24">{children}</main>
        </>
    );
}
