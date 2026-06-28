import ClientApp from "../components/ClientApp";

export default function Home() {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ClientApp />
    </section>
  );
}
