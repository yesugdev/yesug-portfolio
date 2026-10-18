import Background from "./background";
import NavSpy from "./nav-spy";

// Бүх хуудсанд хэрэглэгдэх дээд цэс + арын animation. nav: [[href, label], ...]
export default function Header({ name, nav }) {
  return (
    <>
      <Background />
      <NavSpy />
      <div className="progress" aria-hidden="true" />
      <header className="masthead">
        <div className="masthead-inner">
          <a href="/" className="logo">{name}</a>
          <nav>
            {nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        </div>
      </header>
    </>
  );
}
