export default function SuperadminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section>
            {children}
        </section>
    );
}
