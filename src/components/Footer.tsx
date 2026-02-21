const Footer = () => {
  return (
    <footer
      className="w-full px-5 sm:px-8 py-10 sm:py-12"
      style={{
        borderTop: "1px solid hsl(30 15% 25% / 0.4)",
        background: "hsl(20 12% 5%)",
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-[2px]">
        <p
          className="font-body tracking-[0.22em] uppercase leading-[1.6]"
          style={{ color: "hsl(30 12% 52%)", fontSize: "10px" }}
        >
          LAUREL CROWNS ABOVE - A LIVING WORLD is an original intellectual property of CECILIA MA.
        </p>
        <p
          className="font-body tracking-[0.22em] uppercase leading-[1.6]"
          style={{ color: "hsl(30 12% 52%)", fontSize: "10px" }}
        >
          © 2026 All rights reserved.
        </p>
        <p
          className="font-body tracking-[0.22em] uppercase leading-[1.6]"
          style={{ color: "hsl(30 12% 52%)", fontSize: "10px" }}
        >
          For other works please visit{" "}
          <a
            href="https://www.AverydelaCruz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-200 hover:underline"
            style={{ color: "hsl(30 12% 52%)" }}
          >
            AverydelaCruz.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
