import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link href="/">Home</Link>
      <Link href="/rooms">Rooms</Link>
      <Link href="/reservations">Reservations</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  );
}
