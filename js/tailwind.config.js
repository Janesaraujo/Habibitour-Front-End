// Must load AFTER the Tailwind CDN <script src="https://cdn.tailwindcss.com">
// tag and BEFORE any markup that relies on these custom utilities is
// parsed — keep its <script> tag immediately below the CDN one in
// index.html.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        sand: "#D9B26F",   // desert sand gold — primary accent
        dune: "#0B1120",   // near-black navy for the night overlay
        pearl: "#F3EFE6",  // pearl white for secondary text
      },
    },
  },
};
