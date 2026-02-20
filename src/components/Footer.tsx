const Footer = () => {
  return (
    <footer
      className="w-full border-t px-5 sm:px-8 py-8 sm:py-10"
      style={{
        borderColor: "hsl(38 50% 30% / 0.3)",
        background: "hsl(20 12% 5%)",
      }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
        <p
          className="font-narrative text-[11px] sm:text-xs leading-relaxed"
          style={{ color: "hsl(38 20% 55%)" }}
        >
          Laurel Crowns Above is an original intellectual property of Cecilia Ma. All rights reserved.
        </p>
        <p
          className="font-narrative text-[11px] sm:text-xs leading-relaxed"
          style={{ color: "hsl(38 20% 55%)" }}
        >
          For other works please visit{" "}
          <a
            href="https://www.averydelacruz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:underline"
            style={{ color: "hsl(38 60% 55%)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "hsl(38 72% 65%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "hsl(38 60% 55%)")
            }
          >
            averydelacruz.com
          </a>
        </p>
        <p
          className="font-narrative text-[10px] sm:text-[11px] mt-1"
          style={{ color: "hsl(38 15% 40%)" }}
        >
          © 2026
        </p>
      </div>
    </footer>
  );
};

export default Footer;
